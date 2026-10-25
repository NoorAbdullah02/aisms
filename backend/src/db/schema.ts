import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  pgEnum,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Enums ----------
export const roleEnum = pgEnum("role", ["admin", "teacher", "student"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "excused"]);
export const noticeAudienceEnum = pgEnum("notice_audience", ["all", "students", "teachers", "admins"]);
export const feeStatusEnum = pgEnum("fee_status", ["pending", "paid", "overdue", "waived"]);
export const studentStatusEnum = pgEnum("student_status", ["active", "graduated", "suspended", "expired"]);
export const teacherTypeEnum = pgEnum("teacher_type", ["Permanent", "Contractual"]);

// ---------- Users (FR-01, FR-02, NFR-04, NFR-05) ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

// ---------- Departments (FR-05) ----------
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex("departments_code_idx").on(table.code),
}));

// ---------- Teachers (FR-04) ----------
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  employeeCode: varchar("employee_code", { length: 30 }).notNull(),
  designation: varchar("designation", { length: 100 }),
  phone: varchar("phone", { length: 30 }),
  employmentType: teacherTypeEnum("employment_type").notNull().default("Permanent"),
  contractEndDate: date("contract_end_date"),
  joinedAt: date("joined_at"),
}, (table) => ({
  employeeCodeIdx: uniqueIndex("teachers_employee_code_idx").on(table.employeeCode),
}));

// ---------- Courses (FR-06) ----------
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  credits: integer("credits").notNull().default(3),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  teacherId: integer("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  semester: varchar("semester", { length: 20 }).notNull(),
  capacity: integer("capacity").notNull().default(60),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex("courses_code_idx").on(table.code),
}));

// ---------- Students (FR-03) ----------
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  studentCode: varchar("student_code", { length: 30 }).notNull(),
  semester: varchar("semester", { length: 20 }).notNull().default("1"),
  guardianName: varchar("guardian_name", { length: 150 }),
  guardianPhone: varchar("guardian_phone", { length: 30 }),
  admissionDate: date("admission_date"),
  status: studentStatusEnum("status").notNull().default("active"),
  graduationDate: date("graduation_date"),
}, (table) => ({
  studentCodeIdx: uniqueIndex("students_student_code_idx").on(table.studentCode),
}));

// ---------- Course Registration / Enrollment (FR-07) ----------
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
}, (table) => ({
  uniqueEnrollment: uniqueIndex("enrollments_student_course_idx").on(table.studentId, table.courseId),
}));

// ---------- Attendance (FR-08, FR-09) ----------
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull().default("present"),
  markedByTeacherId: integer("marked_by_teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueDaily: uniqueIndex("attendance_student_course_date_idx").on(table.studentId, table.courseId, table.date),
}));

// ---------- Results (FR-10, FR-11) ----------
export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  marks: numeric("marks", { precision: 5, scale: 2 }).notNull(),
  gradePoint: numeric("grade_point", { precision: 3, scale: 2 }).notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  publishedByTeacherId: integer("published_by_teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueResult: uniqueIndex("results_student_course_semester_idx").on(table.studentId, table.courseId, table.semester),
}));

// ---------- Notices (FR-12, FR-13) ----------
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  audience: noticeAudienceEnum("audience").notNull().default("all"),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Fee Management (billing, invoices, payment status) ----------
export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 150 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: feeStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdByUserId: integer("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feesRelations = relations(fees, ({ one }) => ({
  student: one(students, { fields: [fees.studentId], references: [students.id] }),
}));

export type Fee = typeof fees.$inferSelect;
export type NewFee = typeof fees.$inferInsert;

// ---------- Refresh tokens (secure session handling) ----------
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// ---------- Audit log (NFR-17) ----------
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 150 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Relations ----------
export const usersRelations = relations(users, ({ one }) => ({
  teacherProfile: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  studentProfile: one(students, { fields: [users.id], references: [students.userId] }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  teachers: many(teachers),
  students: many(students),
  courses: many(courses),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  department: one(departments, { fields: [teachers.departmentId], references: [departments.id] }),
  courses: many(courses),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  department: one(departments, { fields: [students.departmentId], references: [departments.id] }),
  enrollments: many(enrollments),
  attendance: many(attendance),
  results: many(results),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  department: one(departments, { fields: [courses.departmentId], references: [departments.id] }),
  teacher: one(teachers, { fields: [courses.teacherId], references: [teachers.id] }),
  enrollments: many(enrollments),
  attendance: many(attendance),
  results: many(results),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  course: one(courses, { fields: [attendance.courseId], references: [courses.id] }),
  markedBy: one(teachers, { fields: [attendance.markedByTeacherId], references: [teachers.id] }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  student: one(students, { fields: [results.studentId], references: [students.id] }),
  course: one(courses, { fields: [results.courseId], references: [courses.id] }),
  publishedBy: one(teachers, { fields: [results.publishedByTeacherId], references: [teachers.id] }),
}));

export const noticesRelations = relations(notices, ({ one }) => ({
  createdBy: one(users, { fields: [notices.createdByUserId], references: [users.id] }),
}));

// ---------- Inferred types ----------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
export type Notice = typeof notices.$inferSelect;
export type NewNotice = typeof notices.$inferInsert;
