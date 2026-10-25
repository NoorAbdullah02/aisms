import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ClipboardList, Trash2, Edit3, Award, CheckCircle2, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { CourseRow, ResultRow, StudentRow } from "@/lib/types";

interface ResultForm {
  studentId: number;
  courseId: number;
  marks: number;
  gradePoint: number;
  semester: string;
}

function calculateGrade(marks: number): { gradePoint: number; letterGrade: string } {
  if (marks >= 80) return { gradePoint: 4.0, letterGrade: "A+" };
  if (marks >= 75) return { gradePoint: 3.75, letterGrade: "A" };
  if (marks >= 70) return { gradePoint: 3.5, letterGrade: "A-" };
  if (marks >= 65) return { gradePoint: 3.25, letterGrade: "B+" };
  if (marks >= 60) return { gradePoint: 3.0, letterGrade: "B" };
  if (marks >= 55) return { gradePoint: 2.75, letterGrade: "B-" };
  if (marks >= 50) return { gradePoint: 2.5, letterGrade: "C+" };
  if (marks >= 45) return { gradePoint: 2.25, letterGrade: "C" };
  if (marks >= 40) return { gradePoint: 2.0, letterGrade: "D" };
  return { gradePoint: 0.0, letterGrade: "F" };
}

function StaffResults() {
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [editingResult, setEditingResult] = useState<ResultRow | null>(null);
  const [deletingResult, setDeletingResult] = useState<ResultRow | null>(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students", ""],
    queryFn: async () => (await api.get<StudentRow[]>("/students")).data,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.get<CourseRow[]>("/courses")).data,
  });

  const { data: courseResults = [], isLoading: isLoadingCourseResults } = useQuery({
    queryKey: ["course-results", selectedCourseId],
    queryFn: async () => (await api.get<ResultRow[]>(`/results/course/${selectedCourseId}`)).data,
    enabled: !!selectedCourseId,
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<ResultForm>({
    defaultValues: { semester: "3" },
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm<{
    marks: number;
    gradePoint: number;
    semester: string;
  }>();

  const enteredMarks = watch("marks");

  // Automatically update grade point when marks change
  const handleMarksChange = (val: number) => {
    const { gradePoint } = calculateGrade(val);
    setValue("gradePoint", gradePoint);
  };

  const submitMutation = useMutation({
    mutationFn: (data: ResultForm) =>
      api.post("/results", {
        ...data,
        studentId: Number(data.studentId),
        courseId: Number(data.courseId),
        marks: Number(data.marks),
        gradePoint: Number(data.gradePoint),
      }),
    onSuccess: () => {
      toast.success("Result published & student notified via email!");
      qc.invalidateQueries({ queryKey: ["results"] });
      qc.invalidateQueries({ queryKey: ["course-results"] });
      reset();
    },
    onError: () => toast.error("Could not publish result."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { marks: number; gradePoint: number; semester: string } }) =>
      api.patch(`/results/${id}`, {
        marks: Number(data.marks),
        gradePoint: Number(data.gradePoint),
        semester: data.semester,
      }),
    onSuccess: () => {
      toast.success("Result updated successfully!");
      qc.invalidateQueries({ queryKey: ["results"] });
      qc.invalidateQueries({ queryKey: ["course-results"] });
      setEditingResult(null);
    },
    onError: () => toast.error("Failed to update result."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/results/${id}`),
    onSuccess: () => {
      toast.success("Result deleted.");
      qc.invalidateQueries({ queryKey: ["results"] });
      qc.invalidateQueries({ queryKey: ["course-results"] });
    },
    onError: () => toast.error("Failed to delete result."),
  });

  return (
    <div className="space-y-8">
      {/* Upload Marks Form */}
      <div className="card p-6 border border-slate-200">
        <h3 className="mb-4 text-base font-bold text-slate-900">Upload or Update Course Marks (FR-10)</h3>
        <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Student</label>
              <select className="input" {...register("studentId", { required: true, valueAsNumber: true })}>
                <option value="">Select student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Course</label>
              <select className="input" {...register("courseId", { required: true, valueAsNumber: true })}>
                <option value="">Select course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Marks Scored (0-100)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min={0}
                max={100}
                {...register("marks", {
                  required: true,
                  valueAsNumber: true,
                  onChange: (e) => handleMarksChange(Number(e.target.value)),
                })}
              />
              {enteredMarks !== undefined && !isNaN(enteredMarks) && (
                <span className="mt-1 block text-xs font-bold text-blue-600">
                  Grade: {calculateGrade(Number(enteredMarks)).letterGrade}
                </span>
              )}
            </div>

            <div>
              <label className="label">Grade Point (0-4.00)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min={0}
                max={4}
                {...register("gradePoint", { required: true, valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="label">Semester</label>
              <input className="input" placeholder="e.g. 3" {...register("semester", { required: true })} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitMutation.isPending}>
            <ClipboardList className="h-4 w-4" />
            {submitMutation.isPending ? "Publishing…" : "Publish / Save Result"}
          </button>
        </form>
      </div>

      {/* Course Grade Sheet */}
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Course Grade Sheet</h3>
            <p className="text-xs text-slate-500">Select a course to inspect all published student grades.</p>
          </div>
          <div className="w-72">
            <select
              className="input text-sm"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            >
              <option value="">Select a course to view sheet...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCourseId ? (
          isLoadingCourseResults ? (
            <p className="py-6 text-sm text-slate-500">Loading grade sheet…</p>
          ) : (
            <Table headers={["Student Name", "Student Code", "Semester", "Marks", "Grade Point", "Grade", "Actions"]}>
              {courseResults.map((r) => {
                const letter = calculateGrade(Number(r.marks)).letterGrade;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <Td className="font-semibold text-slate-900">{r.studentName}</Td>
                    <Td className="font-mono text-xs">{r.studentCode}</Td>
                    <Td>Semester {r.semester}</Td>
                    <Td className="font-bold text-slate-800">{Number(r.marks).toFixed(2)}</Td>
                    <Td className="font-semibold text-blue-600">{Number(r.gradePoint).toFixed(2)}</Td>
                    <Td>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold ${
                          letter.startsWith("A")
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : letter.startsWith("B")
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : letter.startsWith("C") || letter.startsWith("D")
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {letter}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingResult(r);
                            resetEdit({
                              marks: Number(r.marks),
                              gradePoint: Number(r.gradePoint),
                              semester: r.semester,
                            });
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          title="Edit Marks"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingResult(r)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                          title="Delete Result"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {courseResults.length === 0 && (
                <tr>
                  <Td className="py-8 text-center text-slate-500" colSpan={7}>
                    No results recorded for this course yet.
                  </Td>
                </tr>
              )}
            </Table>
          )
        ) : (
          <div className="card py-8 text-center text-sm text-slate-500 border border-dashed border-slate-200">
            Select a course above to view and manage its grade sheet.
          </div>
        )}
      </div>

      {/* Edit Result Modal */}
      {editingResult && (
        <Modal title={`Edit Result for ${editingResult.studentName}`} onClose={() => setEditingResult(null)}>
          <form
            onSubmit={handleSubmitEdit((data) =>
              updateMutation.mutate({ id: editingResult.id, data })
            )}
            className="space-y-4"
          >
            <div>
              <label className="label">Marks Scored</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min={0}
                max={100}
                {...registerEdit("marks", { required: true, valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="label">Grade Point</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min={0}
                max={4}
                {...registerEdit("gradePoint", { required: true, valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="label">Semester</label>
              <input className="input" {...registerEdit("semester", { required: true })} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating…" : "Update Grade"}
            </button>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Grade Entry Popup */}
      <ConfirmModal
        isOpen={!!deletingResult}
        onClose={() => setDeletingResult(null)}
        onConfirm={async () => {
          if (deletingResult) {
            await deleteMutation.mutateAsync(deletingResult.id);
          }
        }}
        title="Delete Grade Entry"
        message="Are you sure you want to delete this student's grade record? This will alter their semester and cumulative GPA calculation."
        itemName={deletingResult ? `${deletingResult.studentName} — Marks: ${deletingResult.marks}` : undefined}
        confirmText="Delete Grade"
        variant="danger"
      />
    </div>
  );
}

function StudentResults() {
  const user = useAuthStore((s) => s.user);
  const [showTranscript, setShowTranscript] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["results", "me"],
    queryFn: async () => (await api.get<{ studentId: number; cgpa: number; results: ResultRow[] }>("/results/me")).data,
  });

  if (isLoading || !data) return <p className="text-sm text-slate-500">Loading academic results…</p>;

  const totalCredits = data.results.reduce((sum, r) => sum + (r.credits || 0), 0);

  const handlePrintTranscript = () => {
    window.print();
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Cumulative GPA (CGPA)" value={data.cgpa.toFixed(2)} icon={Award} />
        <StatCard label="Courses Completed" value={data.results.length} icon={CheckCircle2} accent="teal" />
        <StatCard label="Total Credits Earned" value={totalCredits} icon={ClipboardList} />
      </div>

      <div className="mb-4 flex justify-end">
        <button className="btn-secondary" onClick={() => setShowTranscript(true)}>
          <Printer className="h-4 w-4 text-blue-600" /> View & Print Official Transcript
        </button>
      </div>

      <Table headers={["Course Title", "Course Code", "Credits", "Semester", "Marks Scored", "Grade Point", "Grade"]}>
        {data.results.map((r) => {
          const letter = calculateGrade(Number(r.marks)).letterGrade;
          return (
            <tr key={r.id} className="hover:bg-slate-50/70">
              <Td className="font-semibold text-slate-900">{r.courseTitle}</Td>
              <Td className="font-mono text-xs font-bold text-blue-700">{r.courseCode}</Td>
              <Td>{r.credits ?? 3} Cr</Td>
              <Td>Semester {r.semester}</Td>
              <Td className="font-medium text-slate-800">{Number(r.marks).toFixed(2)}</Td>
              <Td className="font-bold text-blue-600">{Number(r.gradePoint).toFixed(2)}</Td>
              <Td>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    letter.startsWith("A")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {letter}
                </span>
              </Td>
            </tr>
          );
        })}
        {data.results.length === 0 && (
          <tr>
            <Td className="py-8 text-center text-slate-500" colSpan={7}>
              No results published yet.
            </Td>
          </tr>
        )}
      </Table>

      {/* Official Transcript Modal */}
      {showTranscript && (
        <Modal title="Official Academic Transcript" onClose={() => setShowTranscript(false)}>
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-200 pb-4 text-center">
                <h2 className="text-xl font-black text-blue-700">AISMS UNIVERSITY OF SCIENCE & TECHNOLOGY</h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Office of the Controller of Examinations</p>
                <p className="text-sm font-bold text-slate-900 mt-2">OFFICIAL TRANSCRIPT OF ACADEMIC RECORD</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Student Name:</span>{" "}
                  <strong className="text-slate-900">{user?.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Institutional Email:</span>{" "}
                  <strong className="text-slate-900">{user?.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Cumulative GPA:</span>{" "}
                  <strong className="text-blue-700 text-sm">{data.cgpa.toFixed(2)} / 4.00</strong>
                </div>
                <div>
                  <span className="text-slate-500">Total Credits Earned:</span>{" "}
                  <strong className="text-slate-900">{totalCredits} Credits</strong>
                </div>
              </div>

              <div className="mt-6">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Course Code</th>
                      <th className="p-2">Course Title</th>
                      <th className="p-2">Credits</th>
                      <th className="p-2">Marks</th>
                      <th className="p-2">Grade Point</th>
                      <th className="p-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.results.map((r) => {
                      const grade = calculateGrade(Number(r.marks)).letterGrade;
                      return (
                        <tr key={r.id}>
                          <td className="p-2 font-mono font-bold text-blue-700">{r.courseCode}</td>
                          <td className="p-2 font-semibold text-slate-900">{r.courseTitle}</td>
                          <td className="p-2">{r.credits ?? 3}</td>
                          <td className="p-2">{Number(r.marks).toFixed(2)}</td>
                          <td className="p-2 font-bold">{Number(r.gradePoint).toFixed(2)}</td>
                          <td className="p-2 font-black">{grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500">
                <div>Date of Issue: {new Date().toLocaleDateString()}</div>
                <div className="text-center">
                  <div className="font-signature text-base text-slate-800">Controller of Examinations</div>
                  <div className="border-t border-slate-400 mt-1 pt-1 font-semibold">Authorized Signature & Seal</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowTranscript(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={handlePrintTranscript}>
                <Printer className="h-4 w-4" /> Print Transcript
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader
        title="Examination Results & Transcripts"
        subtitle={
          user?.role === "student"
            ? "View published semester examination marks and print official academic transcripts (FR-11)."
            : "Publish student examination marks, generate automatic GPAs, and manage course grade sheets (FR-10)."
        }
      />
      {user?.role === "student" ? <StudentResults /> : <StaffResults />}
    </div>
  );
}
