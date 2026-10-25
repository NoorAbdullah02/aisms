import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarCheck, FileDown, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { StatCard } from "@/components/ui/StatCard";
import type { AttendanceSummary, AttendanceStatus, CourseRow, StudentRow } from "@/lib/types";

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"];

function StaffAttendance() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState<number | "">("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [draft, setDraft] = useState<Record<number, AttendanceStatus>>({});

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.get<CourseRow[]>("/courses")).data,
  });

  // Query enrolled students for course, or fall back to all students
  const { data: enrolledStudents = [] } = useQuery({
    queryKey: ["course-students", courseId],
    queryFn: async () => (await api.get<Array<{ id: number; fullName: string; studentCode: string }>>(`/courses/${courseId}/students`)).data,
    enabled: !!courseId,
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ["students", ""],
    queryFn: async () => (await api.get<StudentRow[]>("/students")).data,
    enabled: !courseId || enrolledStudents.length === 0,
  });

  const studentList = courseId && enrolledStudents.length > 0 ? enrolledStudents : allStudents;

  // Load existing recorded attendance for this course & date
  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["attendance-date", courseId, date],
    queryFn: async () =>
      (await api.get<Array<{ studentId: number; status: AttendanceStatus }>>(`/attendance/course/${courseId}`, {
        params: { date },
      })).data,
    enabled: !!courseId && !!date,
  });

  useEffect(() => {
    if (existingAttendance.length > 0) {
      const newDraft: Record<number, AttendanceStatus> = {};
      existingAttendance.forEach((rec) => {
        newDraft[rec.studentId] = rec.status;
      });
      setDraft(newDraft);
    } else {
      // Default to present for all in list
      const newDraft: Record<number, AttendanceStatus> = {};
      studentList.forEach((s) => {
        newDraft[s.id] = "present";
      });
      setDraft(newDraft);
    }
  }, [existingAttendance, studentList.length, courseId, date]);

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post("/attendance/bulk", {
        courseId,
        date,
        records: studentList.map((s) => ({ studentId: s.id, status: draft[s.id] ?? "present" })),
      }),
    onSuccess: () => {
      toast.success("Attendance saved successfully!");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance-date", courseId, date] });
    },
    onError: () => toast.error("Could not save attendance."),
  });

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<number, AttendanceStatus> = {};
    studentList.forEach((s) => {
      updated[s.id] = status;
    });
    setDraft(updated);
    toast.success(`Marked all students as ${status}.`);
  };

  const presentCount = studentList.filter((s) => (draft[s.id] ?? "present") === "present").length;
  const absentCount = studentList.filter((s) => draft[s.id] === "absent").length;
  const lateCount = studentList.filter((s) => draft[s.id] === "late").length;

  return (
    <div>
      <div className="mb-6 card p-5 border border-slate-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <label className="label">Select Course</label>
            <select className="input" value={courseId} onChange={(e) => setCourseId(Number(e.target.value))}>
              <option value="">Choose a course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              disabled={!courseId || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              <CalendarCheck className="h-4 w-4" />
              {submitMutation.isPending ? "Saving…" : "Save Attendance"}
            </button>

            {courseId && (
              <button
                className="btn-secondary"
                onClick={async () => {
                  const res = await api.get(`/export/attendance/${courseId}`, { responseType: "blob" });
                  const url = URL.createObjectURL(res.data);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `attendance-course-${courseId}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Attendance report downloaded.");
                }}
              >
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
            )}
          </div>
        </div>

        {courseId && (
          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Quick Actions:</span>
              <button
                type="button"
                onClick={() => markAll("present")}
                className="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll("absent")}
                className="rounded bg-rose-50 px-2 py-1 font-semibold text-rose-700 border border-rose-200 hover:bg-rose-100"
              >
                Mark All Absent
              </button>
              <button
                type="button"
                onClick={() => markAll("late")}
                className="rounded bg-amber-50 px-2 py-1 font-semibold text-amber-700 border border-amber-200 hover:bg-amber-100"
              >
                Mark All Late
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span>Present: <strong className="text-emerald-700">{presentCount}</strong></span>
              <span>Absent: <strong className="text-rose-700">{absentCount}</strong></span>
              <span>Late: <strong className="text-amber-700">{lateCount}</strong></span>
              <span>Total: <strong className="text-slate-900">{studentList.length}</strong></span>
            </div>
          </div>
        )}
      </div>

      <Table headers={["Student", "Student Code", "Attendance Status"]}>
        {studentList.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/70">
            <Td className="font-semibold text-slate-900">{s.fullName}</Td>
            <Td className="font-mono text-xs">{s.studentCode}</Td>
            <Td>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((status) => {
                  const currentStatus = draft[s.id] ?? "present";
                  const isSelected = currentStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setDraft((d) => ({ ...d, [s.id]: status }))}
                      className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                        isSelected
                          ? status === "present"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : status === "absent"
                            ? "bg-rose-600 text-white shadow-xs"
                            : status === "late"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-blue-600 text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </Td>
          </tr>
        ))}
        {studentList.length === 0 && (
          <tr>
            <Td className="py-8 text-center text-slate-500" colSpan={3}>
              No students found for this course.
            </Td>
          </tr>
        )}
      </Table>
    </div>
  );
}

function StudentAttendance() {
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: async () => (await api.get<AttendanceSummary>("/attendance/me")).data,
  });

  if (isLoading || !data) return <p className="text-sm text-slate-500">Loading attendance…</p>;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Attendance %" value={`${data.percentage}%`} icon={CalendarCheck} />
        <StatCard label="Sessions Present" value={data.present} icon={CheckCircle2} accent="teal" />
        <StatCard label="Total Sessions" value={data.total} icon={CalendarCheck} />
      </div>

      <Table headers={["Session Date", "Status"]}>
        {data.history.map((h) => (
          <tr key={h.id} className="hover:bg-slate-50/70">
            <Td className="font-medium text-slate-900">{h.date}</Td>
            <Td>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                  h.status === "present"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : h.status === "late"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {h.status}
              </span>
            </Td>
          </tr>
        ))}
        {data.history.length === 0 && (
          <tr>
            <Td className="py-8 text-center text-slate-500" colSpan={2}>
              No attendance recorded yet.
            </Td>
          </tr>
        )}
      </Table>
    </div>
  );
}

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle={
          user?.role === "student"
            ? "View your attendance percentage, threshold compliance, and session logs (FR-09)."
            : "Record digital attendance per course and date with automated notifications (FR-08)."
        }
      />
      {user?.role === "student" ? <StudentAttendance /> : <StaffAttendance />}
    </div>
  );
}
