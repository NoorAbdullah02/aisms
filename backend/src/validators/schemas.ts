import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "teacher", "student"]),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
});

export const createTeacherSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.number().int().positive().optional(),
  employeeCode: z.string().min(2).max(30),
  designation: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
});

export const createStudentSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.number().int().positive().optional(),
  studentCode: z.string().min(2).max(30),
  semester: z.string().max(20).default("1"),
  guardianName: z.string().max(150).optional(),
  guardianPhone: z.string().max(30).optional(),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  departmentId: z.number().int().positive().optional(),
  semester: z.string().max(20).optional(),
  guardianName: z.string().max(150).optional(),
  guardianPhone: z.string().max(30).optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(2).max(150),
  code: z.string().min(2).max(20),
  credits: z.number().int().min(1).max(6).default(3),
  departmentId: z.number().int().positive().optional(),
  teacherId: z.number().int().positive().optional(),
  semester: z.string().max(20),
  capacity: z.number().int().min(1).default(60),
});

export const enrollCourseSchema = z.object({
  courseId: z.number().int().positive(),
  studentId: z.number().int().positive().optional(),
});

export const markAttendanceSchema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  date: z.string(),
  status: z.enum(["present", "absent", "late", "excused"]),
});

export const bulkAttendanceSchema = z.object({
  courseId: z.number().int().positive(),
  date: z.string(),
  records: z.array(
    z.object({
      studentId: z.number().int().positive(),
      status: z.enum(["present", "absent", "late", "excused"]),
    })
  ),
});

export const createResultSchema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  marks: z.number().min(0).max(100),
  gradePoint: z.number().min(0).max(4),
  semester: z.string().max(20),
});

export const createNoticeSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(2),
  audience: z.enum(["all", "students", "teachers", "admins"]).default("all"),
});
