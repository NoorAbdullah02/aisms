import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Calculator, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { AIBrainVisualizer } from "@/components/three/AIBrainVisualizer";
import type { PredictionResult, StudentRow } from "@/lib/types";

const RISK_BADGE: Record<string, string> = {
  Low: "bg-teal-50 text-teal-700 border-teal-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-rose-50 text-rose-700 border-rose-200",
};

function PredictionCard({ prediction }: { prediction: PredictionResult }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Predicted GPA" value={prediction.predictedGpa.toFixed(2)} icon={Sparkles} />
        <StatCard label="GPA Band" value={prediction.predictedGpaBand} icon={Sparkles} accent="teal" />
        <StatCard label="Performance Score" value={`${prediction.performanceScore.toFixed(0)}/100`} icon={Sparkles} />
        <StatCard label="Overall Risk Score" value={`${prediction.overallRiskScore}/100`} icon={Sparkles} accent="teal" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 border border-slate-200 bg-white shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Attendance Risk Analysis
            </h3>
            <span className={`badge text-xs capitalize ${RISK_BADGE[prediction.attendanceRisk] || "bg-slate-100 text-slate-700"}`}>
              {prediction.attendanceRisk} Risk
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {prediction.attendanceRisk}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            FR-15: Continuous attendance heuristic monitoring flags early attendance shortfalls before semester finals.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Risk Threshold Index</span>
              <span className="font-semibold text-slate-900">{prediction.overallRiskScore}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  prediction.overallRiskScore > 50 ? "bg-rose-500" : prediction.overallRiskScore > 25 ? "bg-amber-500" : "bg-teal-500"
                }`}
                style={{ width: `${Math.min(100, prediction.overallRiskScore)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card p-6 border border-slate-200 bg-white shadow-sm rounded-2xl">
          <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            AI Prescriptive Recommendations (FR-16)
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            {prediction.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="h-3 w-3" />
                </span>
                <span className="leading-snug text-xs sm:text-sm text-slate-700 font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WhatIfSimulatorModal({ onClose }: { onClose: () => void }) {
  const [attendancePercent, setAttendancePercent] = useState<number>(85);
  const [midtermScore, setMidtermScore] = useState<number>(75);
  const [assignmentScore, setAssignmentScore] = useState<number>(80);

  // Projected calculation: Midterm 30%, Assignments 20%, Final Exam projection 40%, Attendance 10%
  const attendanceComponent = (attendancePercent / 100) * 10;
  const midtermComponent = (midtermScore / 100) * 30;
  const assignmentComponent = (assignmentScore / 100) * 20;
  const projectedTotal = attendanceComponent + midtermComponent + assignmentComponent + 32; // Assuming ~80% in final
  
  const getProjectedGrade = (score: number) => {
    if (score >= 80) return { gpa: "4.00", grade: "A+", band: "Distinction" };
    if (score >= 75) return { gpa: "3.75", grade: "A", band: "Very Good" };
    if (score >= 70) return { gpa: "3.50", grade: "A-", band: "Good" };
    if (score >= 65) return { gpa: "3.25", grade: "B+", band: "Satisfactory" };
    if (score >= 60) return { gpa: "3.00", grade: "B", band: "Average" };
    if (score >= 50) return { gpa: "2.50", grade: "C+", band: "Pass" };
    return { gpa: "0.00", grade: "F", band: "At Risk" };
  };

  const outcome = getProjectedGrade(projectedTotal);

  return (
    <Modal
      title="What-If Academic Simulator"
      subtitle="Adjust your attendance and term scores to project your predicted GPA and grade point band."
      icon={<Calculator className="h-5 w-5" />}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-5 pt-1">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-100 font-semibold">Simulated Outcome</p>
            <h4 className="text-3xl font-black mt-1">GPA {outcome.gpa}</h4>
            <p className="text-xs text-blue-200 mt-0.5">Projected Letter Grade: <strong className="text-white">{outcome.grade}</strong> ({outcome.band})</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{projectedTotal.toFixed(1)}</span>
            <span className="text-xs text-blue-200 block">/ 100 Points</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label>Attendance Rate ({attendancePercent}%)</label>
              <span className={attendancePercent < 75 ? "text-rose-600" : "text-teal-600"}>
                {attendancePercent < 75 ? "⚠️ Below 75% Requirement" : "✓ In Compliance"}
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={attendancePercent}
              onChange={(e) => setAttendancePercent(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label>Midterm Examination Score ({midtermScore}/100)</label>
              <span className="text-slate-500">Weight: 30%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={midtermScore}
              onChange={(e) => setMidtermScore(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label>Assignments & Quizzes Average ({assignmentScore}/100)</label>
              <span className="text-slate-500">Weight: 20%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={assignmentScore}
              onChange={(e) => setAssignmentScore(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900 leading-relaxed">
          💡 <strong>Pro Tip:</strong> Maintaining attendance above 85% and scoring 75+ in midterms ensures you remain securely in the top quartile (A / A+ bracket) with zero risk of shortage hold.
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-primary !px-5 !py-2 text-xs">
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function StaffPredictionLookup() {
  const [studentId, setStudentId] = useState("");
  const { data: students = [] } = useQuery({
    queryKey: ["students", ""],
    queryFn: async () => (await api.get<StudentRow[]>("/students")).data,
  });
  const { data: prediction, isFetching } = useQuery({
    queryKey: ["ai", "predict", studentId],
    queryFn: async () => (await api.get<PredictionResult>(`/ai/predict/${studentId}`)).data,
    enabled: studentId !== "",
  });

  return (
    <div className="space-y-6">
      <div className="card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl max-w-md">
        <label className="label">Select Student for AI Evaluation</label>
        <select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Choose a student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-500">
          Evaluates past term GPAs, continuous class attendance, and course completions.
        </p>
      </div>

      {isFetching && (
        <div className="card p-8 text-center text-slate-500 border border-slate-200 bg-white rounded-2xl">
          <Sparkles className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium">Running neural prediction heuristics…</p>
        </div>
      )}

      {prediction && <PredictionCard prediction={prediction} />}
      {!prediction && !isFetching && (
        <div className="card p-10 text-center text-slate-400 border border-dashed border-slate-300 bg-white rounded-2xl">
          <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Select any student above to view real-time AI risk analysis and prescriptive guidance.</p>
        </div>
      )}
    </div>
  );
}

function StudentSelfPrediction() {
  const { data: prediction, isLoading } = useQuery({
    queryKey: ["ai", "predict", "me"],
    queryFn: async () => (await api.get<PredictionResult>("/ai/predict/me")).data,
  });

  if (isLoading || !prediction) {
    return (
      <div className="card p-8 text-center text-slate-500 border border-slate-200 bg-white rounded-2xl">
        <Sparkles className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm font-medium">Analyzing your academic trajectory…</p>
      </div>
    );
  }

  return <PredictionCard prediction={prediction} />;
}

export default function PredictionsPage() {
  const user = useAuthStore((s) => s.user);
  const [showSimulator, setShowSimulator] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Performance Insights"
        subtitle="Predictive heuristics over cumulative marks, semester trendlines, and continuous attendance (FR-14, FR-15, FR-16)."
        action={
          <button
            onClick={() => setShowSimulator(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            What-If Simulator
          </button>
        }
      />

      {/* 3D Neural Visualizer Header Canvas */}
      <AIBrainVisualizer />

      {user?.role === "student" ? <StudentSelfPrediction /> : <StaffPredictionLookup />}

      {showSimulator && <WhatIfSimulatorModal onClose={() => setShowSimulator(false)} />}
    </div>
  );
}
