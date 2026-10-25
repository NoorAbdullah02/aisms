import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { students, teachers, courses, departments, attendance, results } from "../db/schema.js";

// FR-17: Dashboard displays graphical statistics and analytics.
export async function getAdminOverview(_req: Request, res: Response) {
  const [studentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
  const [teacherCount] = await db.select({ count: sql<number>`count(*)::int` }).from(teachers);
  const [courseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(courses);
  const [departmentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(departments);

  const attendanceByStatus = await db
    .select({ status: attendance.status, count: sql<number>`count(*)::int` })
    .from(attendance)
    .groupBy(attendance.status);

  const gradeDistribution = await db
    .select({
      band: sql<string>`
        case
          when ${results.gradePoint}::numeric >= 3.5 then 'Excellent'
          when ${results.gradePoint}::numeric >= 3.0 then 'Good'
          when ${results.gradePoint}::numeric >= 2.3 then 'Average'
          else 'At Risk'
        end
      `,
      count: sql<number>`count(*)::int`,
    })
    .from(results)
    .groupBy(sql`1`);

  res.json({
    totals: {
      students: studentCount?.count ?? 0,
      teachers: teacherCount?.count ?? 0,
      courses: courseCount?.count ?? 0,
      departments: departmentCount?.count ?? 0,
    },
    attendanceByStatus,
    gradeDistribution,
  });
}

export async function getTeacherOverview(req: Request, res: Response) {
  const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, req.user!.sub)).limit(1);
  if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });

  const myCourses = await db.select().from(courses).where(eq(courses.teacherId, teacher.id));

  res.json({ courses: myCourses, courseCount: myCourses.length });
}
