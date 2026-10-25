export type Role = "admin" | "teacher" | "student";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
  studentCount?: number;
  teacherCount?: number;
  courseCount?: number;
}

export interface TeacherRow {
  id: number;
  userId: number;
  employeeCode: string;
  designation?: string | null;
  phone?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  employmentType?: "Permanent" | "Contractual";
  contractEndDate?: string | null;
  fullName: string;
  email: string;
}

export interface StudentRow {
  id: number;
  userId: number;
  studentCode: string;
  semester: string;
  departmentId?: number | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  status?: "active" | "graduated" | "suspended" | "expired";
  graduationDate?: string | null;
  fullName: string;
  email: string;
}

export interface CourseRow {
  id: number;
  title: string;
  code: string;
  credits: number;
  departmentId?: number | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  teacherId?: number | null;
  teacherName?: string | null;
  teacherEmail?: string | null;
  semester: string;
  capacity: number;
  enrolledCount?: number;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceSummary {
  studentId: number;
  total: number;
  present: number;
  percentage: number;
  history: Array<{ id: number; date: string; status: AttendanceStatus; courseId: number }>;
}

export interface ResultRow {
  id: number;
  studentId?: number;
  studentCode?: string;
  studentName?: string;
  marks: string;
  gradePoint: string;
  semester: string;
  courseTitle?: string;
  courseCode?: string;
  credits?: number;
  createdAt?: string;
}

export interface Notice {
  id: number;
  title: string;
  body: string;
  audience: "all" | "students" | "teachers" | "admins";
  createdAt: string;
}

export interface PredictionResult {
  predictedGpaBand: "Excellent" | "Good" | "Average" | "At Risk";
  predictedGpa: number;
  performanceScore: number;
  attendanceRisk: "Low" | "Moderate" | "High";
  overallRiskScore: number;
  recommendations: string[];
}

export interface AdminOverview {
  totals: { students: number; teachers: number; courses: number; departments: number };
  attendanceByStatus: Array<{ status: AttendanceStatus; count: number }>;
  gradeDistribution: Array<{ band: string; count: number }>;
}
