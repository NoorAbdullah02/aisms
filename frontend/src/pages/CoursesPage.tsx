import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, BookOpenCheck, FileDown, Search, Users, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { CourseRow, Department, TeacherRow } from "@/lib/types";

interface CourseForm {
  title: string;
  code: string;
  credits: number;
  semester: string;
  capacity: number;
  departmentId?: number;
  teacherId?: number;
}

interface EnrolledStudent {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  semester: string;
  enrolledAt: string;
}

export default function CoursesPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "my">("all");
  const [viewStudentsCourse, setViewStudentsCourse] = useState<CourseRow | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseRow | null>(null);

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.get<CourseRow[]>("/courses")).data,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get<Department[]>("/departments")).data,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => (await api.get<TeacherRow[]>("/teachers")).data,
    enabled: isAdmin,
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.get<Array<{ courseId: number }>>("/courses/my-enrollments")).data,
    enabled: isStudent,
  });

  const { data: enrolledStudents = [], isFetching: isFetchingStudents } = useQuery({
    queryKey: ["course-students", viewStudentsCourse?.id],
    queryFn: async () => (await api.get<EnrolledStudent[]>(`/courses/${viewStudentsCourse!.id}/students`)).data,
    enabled: !!viewStudentsCourse,
  });

  const { register, handleSubmit, reset } = useForm<CourseForm>({
    defaultValues: { credits: 3, capacity: 60 },
  });

  const createMutation = useMutation({
    mutationFn: (data: CourseForm) =>
      api.post("/courses", {
        ...data,
        credits: Number(data.credits),
        capacity: Number(data.capacity),
        departmentId: data.departmentId ? Number(data.departmentId) : undefined,
        teacherId: data.teacherId ? Number(data.teacherId) : undefined,
      }),
    onSuccess: () => {
      toast.success("Course created successfully.");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
      reset();
    },
    onError: () => toast.error("Could not create course."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      toast.success("Course removed.");
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => toast.error("Could not delete course."),
  });

  const registerMutation = useMutation({
    mutationFn: (courseId: number) => api.post("/courses/register", { courseId }),
    onSuccess: () => {
      toast.success("Registered for course successfully.");
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => toast.error("Could not register (maybe already registered or capacity full)."),
  });

  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId));

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.departmentName && c.departmentName.toLowerCase().includes(search.toLowerCase())) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "my") {
      if (isStudent) return enrolledIds.has(c.id);
      if (isTeacher) return c.teacherEmail === user?.email;
    }
    return true;
  });

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/export/courses", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "courses-catalog.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Courses CSV exported.");
    } catch {
      toast.error("Failed to export courses CSV.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Courses & Curriculum"
        subtitle={
          isStudent
            ? "Register for available courses this semester (FR-07)."
            : "Course catalog, syllabus and faculty assignments (FR-06)."
        }
        action={
          <div className="flex items-center gap-2">
            {(isAdmin || isTeacher) && (
              <button className="btn-secondary text-xs" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
            )}
            {isAdmin && (
              <button className="btn-primary" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Add Course
              </button>
            )}
          </div>
        }
      />

      {/* Filter Tabs and Search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input !pl-9 text-sm"
            placeholder="Search courses, codes, teachers, or departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {(isStudent || isTeacher) && (
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={() => setFilterTab("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filterTab === "all" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setFilterTab("my")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filterTab === "my" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isStudent ? "My Enrolled Courses" : "My Assigned Courses"}
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading courses…</p>
      ) : (
        <Table headers={["Title & Code", "Department", "Instructor", "Credits", "Semester", "Enrollment", "Actions"]}>
          {filteredCourses.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/70">
              <Td>
                <div>
                  <div className="font-semibold text-slate-900">{c.title}</div>
                  <div className="font-mono text-xs font-bold text-blue-600">{c.code}</div>
                </div>
              </Td>
              <Td>
                <span className="badge bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                  {c.departmentCode || "General"}
                </span>
              </Td>
              <Td>
                {c.teacherName ? (
                  <div>
                    <span className="text-slate-800 font-medium">{c.teacherName}</span>
                    <span className="block text-xs text-slate-400">{c.teacherEmail}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Unassigned</span>
                )}
              </Td>
              <Td className="font-semibold text-slate-700">{c.credits} Cr</Td>
              <Td>Semester {c.semester}</Td>
              <Td>
                <div className="text-xs font-medium text-slate-600">
                  <span className="font-bold text-slate-900">{c.enrolledCount ?? 0}</span> / {c.capacity}
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  {(isAdmin || isTeacher) && (
                    <button
                      onClick={() => setViewStudentsCourse(c)}
                      className="btn-secondary !py-1 !px-2.5 text-xs"
                      title="View Enrolled Students"
                    >
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      Students ({c.enrolledCount ?? 0})
                    </button>
                  )}

                  {isStudent && (
                    <button
                      onClick={() => registerMutation.mutate(c.id)}
                      disabled={enrolledIds.has(c.id) || registerMutation.isPending}
                      className={`btn-secondary !py-1.5 !px-3 text-xs ${
                        enrolledIds.has(c.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : ""
                      }`}
                    >
                      {enrolledIds.has(c.id) ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Enrolled
                        </>
                      ) : (
                        <>
                          <BookOpenCheck className="h-3.5 w-3.5" /> Register
                        </>
                      )}
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => setDeletingCourse(c)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                      title={`Remove ${c.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
          {filteredCourses.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={7}>
                No courses found.
              </Td>
            </tr>
          )}
        </Table>
      )}

      {/* Add Course Modal */}
      {open && (
        <Modal title="Create Course Catalog Entry" onClose={() => setOpen(false)}>
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-4"
          >
            <div>
              <label className="label">Course Title</label>
              <input
                className="input"
                placeholder="e.g. Artificial Intelligence & Machine Learning"
                {...register("title", { required: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Course Code</label>
                <input
                  className="input"
                  placeholder="e.g. CSE-401"
                  {...register("code", { required: true })}
                />
              </div>
              <div>
                <label className="label">Credits (1 - 6)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={6}
                  {...register("credits", { required: true, valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Academic Semester</label>
                <input
                  className="input"
                  placeholder="e.g. 1, 2, 3..."
                  {...register("semester", { required: true })}
                />
              </div>
              <div>
                <label className="label">Class Capacity</label>
                <input
                  className="input"
                  type="number"
                  {...register("capacity", { required: true, valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <select className="input" {...register("departmentId")}>
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Assigned Faculty Teacher</label>
                <select className="input" {...register("teacherId")}>
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving…" : "Save Course"}
            </button>
          </form>
        </Modal>
      )}

      {/* Enrolled Students Modal */}
      {viewStudentsCourse && (
        <Modal
          title={`Enrolled Students: ${viewStudentsCourse.title} (${viewStudentsCourse.code})`}
          onClose={() => setViewStudentsCourse(null)}
        >
          {isFetchingStudents ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading student roster…</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Enrolled: <strong className="text-slate-900">{enrolledStudents.length}</strong></span>
                <span>Capacity: <strong className="text-slate-900">{viewStudentsCourse.capacity}</strong></span>
              </div>
              <Table headers={["Student Name", "Student Code", "Email", "Enrolled Date"]}>
                {enrolledStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <Td className="font-semibold text-slate-900">{s.fullName}</Td>
                    <Td className="font-mono text-xs">{s.studentCode}</Td>
                    <Td className="text-xs text-slate-600">{s.email}</Td>
                    <Td className="text-xs text-slate-500">{new Date(s.enrolledAt).toLocaleDateString()}</Td>
                  </tr>
                ))}
                {enrolledStudents.length === 0 && (
                  <tr>
                    <Td className="py-6 text-center text-slate-500" colSpan={4}>
                      No students enrolled in this course yet.
                    </Td>
                  </tr>
                )}
              </Table>
            </div>
          )}
        </Modal>
      )}

      {/* Confirm Delete Course Popup */}
      <ConfirmModal
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={async () => {
          if (deletingCourse) {
            await deleteMutation.mutateAsync(deletingCourse.id);
          }
        }}
        title="Delete Course"
        message="Are you sure you want to permanently delete this course? All associated enrollments and curriculum records will be removed."
        itemName={deletingCourse ? `${deletingCourse.title} (${deletingCourse.code})` : undefined}
        confirmText="Delete Course"
        variant="danger"
      />
    </div>
  );
}
