/**
 * Dual AI Provider Engine (Mistral AI & Grok xAI) with Fallback & Heuristic Backup
 * ---------------------------------------------------------------------------------
 * Implements FR-14 (AI Performance Prediction), FR-15 (AI Attendance Prediction)
 * and FR-16 (Recommendation System) with dynamic multi-provider LLM support.
 *
 * Primary Provider: Mistral AI (or Grok xAI based on PRIMARY_AI_PROVIDER)
 * Secondary Provider: Fallback to Grok or Mistral if primary fails
 * Backup: Deterministic Heuristic Engine if no API keys are set or network fails
 */

export interface CourseResultInput {
  courseCode: string;
  marks: number; // 0-100
  gradePoint: number; // 0-4
}

export interface StudentOutcomeInput {
  attendancePercentage: number; // 0-100
  results: CourseResultInput[];
}

export interface PredictionResult {
  predictedGpaBand: "Excellent" | "Good" | "Average" | "At Risk";
  predictedGpa: number;
  performanceScore: number; // 0-100
  attendanceRisk: "Low" | "Moderate" | "High";
  overallRiskScore: number; // 0-100, higher = more at risk
  recommendations: string[];
  providerUsed?: "mistral" | "grok" | "heuristic";
  aiModel?: string;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function trendSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xs = values.map((_, i) => i);
  const xMean = average(xs);
  const yMean = average(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i]! - xMean) * (values[i]! - yMean);
    den += (xs[i]! - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Call Mistral AI API
 */
async function callMistral(prompt: string, systemPrompt?: string): Promise<{ text: string; model: string }> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY is not configured in environment.");

  const model = process.env.MISTRAL_MODEL || "mistral-small-latest";
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API Error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Mistral API.");

  return { text: content.trim(), model };
}

/**
 * Call Grok (xAI) API
 */
async function callGrok(prompt: string, systemPrompt?: string): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY is not configured in environment.");

  const model = process.env.GROK_MODEL || "grok-beta";
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API Error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Grok API.");

  return { text: content.trim(), model };
}

/**
 * Dual AI Completion with Automatic Fallback (Mistral <-> Grok)
 */
export async function generateAIChatCompletion(
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string; providerUsed: "mistral" | "grok"; model: string }> {
  const primary = (process.env.PRIMARY_AI_PROVIDER || "mistral").toLowerCase();

  const providers =
    primary === "grok"
      ? [
          { name: "grok" as const, fn: () => callGrok(prompt, systemPrompt) },
          { name: "mistral" as const, fn: () => callMistral(prompt, systemPrompt) },
        ]
      : [
          { name: "mistral" as const, fn: () => callMistral(prompt, systemPrompt) },
          { name: "grok" as const, fn: () => callGrok(prompt, systemPrompt) },
        ];

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const res = await provider.fn();
      return { text: res.text, providerUsed: provider.name, model: res.model };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`[${provider.name}]: ${msg}`);
    }
  }

  throw new Error(`All AI Providers failed:\n${errors.join("\n")}`);
}

/**
 * Heuristic prediction engine (used as base and fallback)
 */
export function predictStudentOutcome(input: StudentOutcomeInput): PredictionResult {
  const marks = input.results.map((r) => r.marks);
  const gradePoints = input.results.map((r) => r.gradePoint);

  const avgMarks = average(marks);
  const avgGpa = average(gradePoints);
  const slope = trendSlope(marks);
  const attendance = Math.max(0, Math.min(100, input.attendancePercentage));

  const trendComponent = Math.max(-10, Math.min(10, slope)) * 2;
  const performanceScore = Math.max(
    0,
    Math.min(100, avgMarks * 0.55 + attendance * 0.25 + (50 + trendComponent) * 0.2)
  );

  const predictedGpa = Math.round((avgGpa * 0.6 + (performanceScore / 100) * 4 * 0.4) * 100) / 100;

  let predictedGpaBand: PredictionResult["predictedGpaBand"];
  if (predictedGpa >= 3.5) predictedGpaBand = "Excellent";
  else if (predictedGpa >= 3.0) predictedGpaBand = "Good";
  else if (predictedGpa >= 2.3) predictedGpaBand = "Average";
  else predictedGpaBand = "At Risk";

  let attendanceRisk: PredictionResult["attendanceRisk"];
  if (attendance >= 85) attendanceRisk = "Low";
  else if (attendance >= 70) attendanceRisk = "Moderate";
  else attendanceRisk = "High";

  const attendanceRiskScore = attendanceRisk === "Low" ? 10 : attendanceRisk === "Moderate" ? 45 : 80;
  const overallRiskScore = Math.round(
    Math.max(0, Math.min(100, (100 - performanceScore) * 0.6 + attendanceRiskScore * 0.4))
  );

  const recommendations: string[] = [];
  if (attendanceRisk !== "Low") {
    recommendations.push(
      `Attendance is at ${attendance.toFixed(1)}%. Aim for 85%+ to reduce academic risk and stay eligible for exams.`
    );
  }
  if (slope < 0) {
    recommendations.push("Recent scores show a declining trend — consider scheduling extra study sessions or office hours.");
  }
  if (avgMarks < 60) {
    recommendations.push("Average marks are below 60. Focus revision time on the weakest courses first.");
  }
  if (predictedGpaBand === "Excellent") {
    recommendations.push("Performance is strong — consider mentoring peers or taking on advanced electives.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Performance and attendance are on track. Keep up the consistent effort.");
  }

  return {
    predictedGpaBand,
    predictedGpa: Number.isFinite(predictedGpa) ? predictedGpa : 0,
    performanceScore: Math.round(performanceScore * 100) / 100,
    attendanceRisk,
    overallRiskScore,
    recommendations,
    providerUsed: "heuristic",
    aiModel: "built-in-heuristic-engine",
  };
}

/**
 * Enhanced Student Outcome Prediction with LLM Insights & Automatic Provider Fallback
 */
export async function predictStudentOutcomeWithAI(input: StudentOutcomeInput): Promise<PredictionResult> {
  const heuristic = predictStudentOutcome(input);

  // If no API keys are set, return heuristic immediately
  if (!process.env.MISTRAL_API_KEY && !process.env.GROK_API_KEY) {
    return heuristic;
  }

  try {
    const prompt = `Analyze student data:
Attendance: ${input.attendancePercentage.toFixed(1)}%
Course Marks: ${JSON.stringify(input.results)}
Heuristic Predicted GPA: ${heuristic.predictedGpa} (${heuristic.predictedGpaBand})
Attendance Risk: ${heuristic.attendanceRisk}

Provide 3 bullet-point recommendations formatted as a JSON array of strings. Do not include markdown code block syntax or extra text. Output strictly JSON array: ["rec1", "rec2", "rec3"]`;

    const systemPrompt =
      "You are an AI Academic Advisor for AISMS (Student Management System). Give concise, actionable academic recommendations based on student grades and attendance.";

    const aiRes = await generateAIChatCompletion(prompt, systemPrompt);
    let parsedRecs: string[] = [];
    try {
      const cleanText = aiRes.text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedRecs = JSON.parse(cleanText);
    } catch {
      parsedRecs = [aiRes.text];
    }

    if (Array.isArray(parsedRecs) && parsedRecs.length > 0) {
      return {
        ...heuristic,
        recommendations: parsedRecs,
        providerUsed: aiRes.providerUsed,
        aiModel: aiRes.model,
      };
    }
  } catch (err) {
    console.warn("AI LLM prediction fallback to heuristic:", err);
  }

  return heuristic;
}
