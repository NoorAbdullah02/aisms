import { Router } from "express";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { users, students, teachers, courses, attendance, results, fees, notices } from "../db/schema.js";
import { predictStudentOutcomeWithAI, generateAIChatCompletion } from "../utils/ai.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

async function buildPrediction(studentId: number) {
  const studentResults = await db.select().from(results).where(eq(results.studentId, studentId));
  const attendanceRows = await db.select().from(attendance).where(eq(attendance.studentId, studentId));

  const total = attendanceRows.length;
  const present = attendanceRows.filter((r) => r.status === "present" || r.status === "late").length;
  const attendancePercentage = total === 0 ? 100 : (present / total) * 100;

  return predictStudentOutcomeWithAI({
    attendancePercentage,
    results: studentResults.map((r) => ({
      courseCode: String(r.courseId),
      marks: Number(r.marks),
      gradePoint: Number(r.gradePoint),
    })),
  });
}

/**
 * Reads live PostgreSQL database datasets for the current logged in user and builds context for AI
 */
async function getDatabaseContextForUser(userId: number, role: string): Promise<string> {
  let context = `INSTITUTION DATABASE CONTEXT:\n`;

  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (u) {
    context += `User Name: ${u.fullName} | Email: ${u.email} | Role: ${u.role}\n`;
  }

  if (role === "student") {
    const [stu] = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
    if (stu) {
      context += `Student Code: ${stu.studentCode} | Semester: ${stu.semester} | Profile Status: ${stu.status || "active"}\n`;

      // Academic Course Results
      const stuResults = await db
        .select({
          courseTitle: courses.title,
          courseCode: courses.code,
          marks: results.marks,
          gradePoint: results.gradePoint,
          semester: results.semester,
        })
        .from(results)
        .innerJoin(courses, eq(results.courseId, courses.id))
        .where(eq(results.studentId, stu.id));

      if (stuResults.length > 0) {
        context += `Academic Course Results & Marks:\n`;
        stuResults.forEach((r) => {
          context += ` - ${r.courseTitle} (${r.courseCode}, Semester ${r.semester}): Marks = ${r.marks}, Grade Point = ${r.gradePoint}\n`;
        });
      }

      // Attendance Stats
      const attRows = await db.select().from(attendance).where(eq(attendance.studentId, stu.id));
      const totalAtt = attRows.length;
      const presentAtt = attRows.filter((r) => r.status === "present" || r.status === "late").length;
      const attPct = totalAtt === 0 ? 100 : Math.round((presentAtt / totalAtt) * 100);
      context += `Attendance Record: ${attPct}% (${presentAtt}/${totalAtt} sessions present/late)\n`;

      // Financial Fees in BDT Taka
      const stuFees = await db.select().from(fees).where(eq(fees.studentId, stu.id));
      if (stuFees.length > 0) {
        context += `Financial Fees & Invoices (in BDT / ৳):\n`;
        stuFees.forEach((f) => {
          context += ` - Fee Invoice #${f.id}: "${f.title}" — Amount: ৳${Number(f.amount).toFixed(2)} BDT — Status: ${f.status} — Due Date: ${f.dueDate}\n`;
        });
      }
    }
  } else if (role === "teacher") {
    const [tch] = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    if (tch) {
      context += `Faculty Employee Code: ${tch.employeeCode} | Designation: ${tch.designation || "Faculty Member"}\n`;
      const tchCourses = await db.select().from(courses).where(eq(courses.teacherId, tch.id));
      context += `Assigned Courses:\n`;
      tchCourses.forEach((c) => {
        context += ` - ${c.title} (${c.code}, Semester ${c.semester}, Capacity: ${c.capacity})\n`;
      });
    }
  } else if (role === "admin") {
    const allStudents = await db.select().from(students);
    const allTeachers = await db.select().from(teachers);
    const allCourses = await db.select().from(courses);
    const allFees = await db.select().from(fees);
    const totalCollected = allFees.filter((f) => f.status === "paid").reduce((sum, f) => sum + Number(f.amount), 0);
    const totalPending = allFees.filter((f) => f.status === "pending" || f.status === "overdue").reduce((sum, f) => sum + Number(f.amount), 0);

    context += `System Platform Database Totals:\n`;
    context += `- Enrolled Students: ${allStudents.length}\n`;
    context += `- Faculty Members: ${allTeachers.length}\n`;
    context += `- Active Courses: ${allCourses.length}\n`;
    context += `- Total Fees Collected: ৳${totalCollected.toFixed(2)} BDT\n`;
    context += `- Total Fees Pending/Due: ৳${totalPending.toFixed(2)} BDT\n`;
  }

  // Active Notices for context
  const activeNotices = await db.select().from(notices).limit(5);
  if (activeNotices.length > 0) {
    context += `System Notice Board:\n`;
    activeNotices.forEach((n) => {
      context += ` - [Notice #${n.id}] "${n.title}": ${n.body}\n`;
    });
  }

  return context;
}

// Self-service prediction for the logged-in student.
router.get("/predict/me", requireAuth, requireRole("student"), async (req, res) => {
  const [student] = await db.select().from(students).where(eq(students.userId, req.user!.sub)).limit(1);
  if (!student) throw new ApiError(404, "Student profile not found.");
  res.json(await buildPrediction(student.id));
});

// FR-14/15/16 for staff, viewing any student.
router.get("/predict/:studentId", requireAuth, requireRole("admin", "teacher"), async (req, res) => {
  const studentId = Number(req.params.studentId);
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) throw new ApiError(404, "Student not found.");
  res.json(await buildPrediction(studentId));
});

// AI Chat completion endpoint connected to Neon PostgreSQL Database (Read & Write capabilities)
router.post("/chat", requireAuth, async (req, res) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    throw new ApiError(400, "Prompt is required.");
  }

  const userId = req.user!.sub;
  const userRole = req.user!.role;

  // AI Write Action: Admin or Teacher requesting to post/create a notice in database via AI Chat
  if ((userRole === "admin" || userRole === "teacher") && /post notice|create notice|publish notice|add notice/i.test(prompt)) {
    const titleMatch = prompt.match(/(?:title|titled|named)\s+["']?([^"']+)["']?/i);
    const noticeTitle: string = (titleMatch && titleMatch[1]) ? titleMatch[1] : "Notice from AI Assistant";
    let noticeBody: string = prompt.replace(/.*(?:title|titled|named)\s+["']?([^"']+)["']?/i, "").trim();
    if (!noticeBody || noticeBody.length < 5) noticeBody = prompt;

    const [notice] = await db
      .insert(notices)
      .values({
        title: noticeTitle,
        body: noticeBody,
        audience: "all",
        createdByUserId: userId,
      })
      .returning();

    if (notice) {
      res.json({
        text: `✅ **Notice Written to Database!**\n\n**Notice ID:** #${notice.id}\n**Title:** ${notice.title}\n**Audience:** All Users\n**Content:** ${notice.body}`,
        providerUsed: "mistral",
        model: "neon-postgres-orm-writer",
      });
      return;
    }
  }

  // Fetch real-time live database context for the requesting user
  const dbContext = await getDatabaseContextForUser(userId, userRole);

  const fullSystemPrompt = `You are the AI Academic Assistant for AISMS (Student Management System).
You have real-time live read access to the Neon PostgreSQL Database.

${dbContext}

Rules for Answering:
1. Answer the user's question directly using the LIVE DATABASE CONTEXT provided above.
2. All financial fee amounts MUST be stated in Bangladeshi Taka (৳ / BDT).
3. If asked about GPA, marks, attendance percentage, fee payment status, course list, or notices, quote the exact values from the database context above.
4. Be concise, professional, accurate, and encouraging.`;

  const result = await generateAIChatCompletion(prompt, fullSystemPrompt);
  res.json(result);
});

// AI Configuration and Status check endpoint
router.get("/status", requireAuth, (_req, res) => {
  res.json({
    primaryProvider: process.env.PRIMARY_AI_PROVIDER || "mistral",
    mistral: {
      configured: Boolean(process.env.MISTRAL_API_KEY),
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
    },
    grok: {
      configured: Boolean(process.env.GROK_API_KEY),
      model: process.env.GROK_MODEL || "grok-beta",
    },
  });
});

export default router;
