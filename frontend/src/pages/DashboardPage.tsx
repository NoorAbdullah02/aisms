import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users, BookOpen, Building2, CalendarCheck, Sparkles, Award, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { AdminOverview, PredictionResult, StudentRow } from "@/lib/types";

const PIE_COLORS = ["#2563EB", "#0D9488", "#0284C7", "#D97706"];

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => (await api.get<AdminOverview>("/dashboard/admin")).data,
  });

  if (isLoading || !data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Students" value={data.totals.students} icon={GraduationCap} />
        <StatCard label="Faculty Teachers" value={data.totals.teachers} icon={Users} accent="teal" />
        <StatCard label="Active Courses" value={data.totals.courses} icon={BookOpen} />
        <StatCard label="Departments" value={data.totals.departments} icon={Building2} accent="teal" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 text-base font-bold text-slate-900">Attendance Breakdown</h3>
          {data.attendanceByStatus.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance records yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.attendanceByStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.attendanceByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="mb-4 text-base font-bold text-slate-900">Grade Distribution</h3>
          {data.gradeDistribution.length === 0 ? (
            <p className="text-sm text-slate-500">No results published yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="band" tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}

function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "teacher"],
    queryFn: async () => (await api.get("/dashboard/teacher")).data as { courses: Array<{ id: number; title: string; code: string }>; courseCount: number },
  });

  if (isLoading || !data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Assigned Courses" value={data.courseCount} icon={BookOpen} />
        <StatCard label="Attendance Status" value="Ready to mark" icon={CalendarCheck} accent="teal" />
      </div>

      <div className="mt-6 card">
        <h3 className="mb-4 text-base font-bold text-slate-900">My Assigned Courses</h3>
        <div className="divide-y divide-slate-100">
          {data.courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <span className="font-semibold text-slate-800">{c.title}</span>
              <span className="rounded bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-600 border border-blue-100">{c.code}</span>
            </div>
          ))}
          {data.courses.length === 0 && <p className="py-4 text-sm text-slate-500">No courses assigned yet.</p>}
        </div>
      </div>
    </>
  );
}

function StudentDashboard() {
  const { data: profile } = useQuery({
    queryKey: ["students", "me"],
    queryFn: async () => (await api.get<StudentRow>("/students/me")).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["ai", "predict", "me"],
    queryFn: async () => (await api.get<PredictionResult>("/ai/predict/me")).data,
  });

  const isGraduated = profile?.status === "graduated";

  if (isLoading || !data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  return (
    <>
      {isGraduated && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-emerald-900">Graduated Alumni Student Profile</h3>
                <span className="badge bg-emerald-200 text-emerald-800 font-bold">Graduated</span>
              </div>
              <p className="mt-1 text-sm text-emerald-800">
                Congratulations! You have successfully completed your degree program at AISMS. Your final academic transcripts, completed courses, and certificates remain permanently available in your portal.
              </p>
              {profile?.graduationDate && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Graduation Date: {profile.graduationDate}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Predicted GPA" value={data.predictedGpa.toFixed(2)} icon={Sparkles} />
        <StatCard label="GPA Status" value={data.predictedGpaBand} icon={GraduationCap} accent="teal" />
        <StatCard label="Attendance Risk" value={data.attendanceRisk} icon={CalendarCheck} />
        <StatCard label="Performance Score" value={`${data.performanceScore.toFixed(0)}/100`} icon={BookOpen} accent="teal" />
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">AI Academic Advisor Recommendations</h3>
          <span className="badge bg-blue-50 text-blue-600 font-bold border border-blue-100">Dual AI Powered</span>
        </div>
        <ul className="mt-4 space-y-3">
          {data.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.fullName.split(" ")[0]}`}
        subtitle="Here's what's happening across your AISMS portal today."
      />
      {user?.role === "admin" && <AdminDashboard />}
      {user?.role === "teacher" && <TeacherDashboard />}
      {user?.role === "student" && <StudentDashboard />}
    </div>
  );
}
