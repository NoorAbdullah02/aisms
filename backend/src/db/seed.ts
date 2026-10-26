import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index.js";
import { users, departments, teachers, students, courses, enrollments, attendance, results, notices, fees } from "./schema.js";

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  const [csDept] = await db
    .insert(departments)
    .values({ name: "Computer Science", code: "CSE", description: "Department of Computer Science & Engineering" })
    .returning();

  const [adminUser] = await db
    .insert(users)
    .values({
      fullName: "System Administrator",
      email: "admin@aisms.dev",
      passwordHash: await hash("Admin@123"),
      role: "admin",
    })
    .returning();

  const [teacherUser] = await db
    .insert(users)
    .values({
      fullName: "Dr. Sarah Ahmed",
      email: "teacher@aisms.dev",
      passwordHash: await hash("Teacher@123"),
      role: "teacher",
    })
    .returning();

  const [teacher] = await db
    .insert(teachers)
    .values({
      userId: teacherUser!.id,
      departmentId: csDept!.id,
      employeeCode: "EMP-001",
      designation: "Associate Professor",
      phone: "+880-1000-000000",
    })
    .returning();

  const [studentUser] = await db
    .insert(users)
    .values({
      fullName: "Noor Abdullah",
      email: "student@aisms.dev",
      passwordHash: await hash("Student@123"),
      role: "student",
    })
    .returning();

  const [student] = await db
    .insert(students)
    .values({
      userId: studentUser!.id,
      departmentId: csDept!.id,
      studentCode: "STU-2026-001",
      semester: "3",
      guardianName: "Mr. Abdullah",
      guardianPhone: "+880-1111-111111",
    })
    .returning();

  const [course1] = await db
    .insert(courses)
    .values({
      title: "Data Structures & Algorithms",
      code: "CSE-201",
      credits: 3,
      departmentId: csDept!.id,
      teacherId: teacher!.id,
      semester: "3",
      capacity: 60,
    })
    .returning();

  const [course2] = await db
    .insert(courses)
    .values({
      title: "Database Systems",
      code: "CSE-205",
      credits: 3,
      departmentId: csDept!.id,
      teacherId: teacher!.id,
      semester: "3",
      capacity: 60,
    })
    .returning();

  await db.insert(enrollments).values([
    { studentId: student!.id, courseId: course1!.id },
    { studentId: student!.id, courseId: course2!.id },
  ]);

  const today = new Date();
  const attendanceRows = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return {
      studentId: student!.id,
      courseId: course1!.id,
      date: d.toISOString().slice(0, 10),
      status: i % 4 === 0 ? ("absent" as const) : ("present" as const),
      markedByTeacherId: teacher!.id,
    };
  });
  await db.insert(attendance).values(attendanceRows);

  await db.insert(results).values([
    { studentId: student!.id, courseId: course1!.id, marks: "78.50", gradePoint: "3.50", semester: "2", publishedByTeacherId: teacher!.id },
    { studentId: student!.id, courseId: course2!.id, marks: "82.00", gradePoint: "3.75", semester: "2", publishedByTeacherId: teacher!.id },
  ]);

  await db.insert(notices).values([
    { title: "Welcome to AISMS", body: "The AI-Based Student Management System is now live for the new semester.", audience: "all", createdByUserId: adminUser!.id },
    { title: "Mid-term Schedule Published", body: "Mid-term examination routine has been published on the notice board.", audience: "students", createdByUserId: teacherUser!.id },
  ]);

  await db.insert(fees).values([
    { studentId: student!.id, title: "Semester 3 Tuition Fee (BDT)", amount: "450.00", semester: "3", dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().slice(0, 10), createdByUserId: adminUser!.id },
    { studentId: student!.id, title: "Computer Lab & Maintenance Fee", amount: "60.00", semester: "3", status: "paid", paidAt: new Date(), dueDate: new Date().toISOString().slice(0, 10), createdByUserId: adminUser!.id },
  ]);

  console.log("Seed complete. Demo logins:");
  console.log("  admin@aisms.dev / Admin@123");
  console.log("  teacher@aisms.dev / Teacher@123");
  console.log("  student@aisms.dev / Student@123");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
