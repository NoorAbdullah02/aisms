import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Search, Download, Wand2, Mail, Key, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { StudentRow, Department } from "@/lib/types";

interface StudentForm {
  fullName: string;
  email: string;
  password: string;
  studentCode: string;
  semester: string;
  departmentId?: number;
  guardianName?: string;
  guardianPhone?: string;
  status?: "active" | "graduated" | "suspended" | "expired";
  graduationDate?: string;
}

export default function StudentsPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [resetModalStudent, setResetModalStudent] = useState<StudentRow | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentRow | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", search],
    queryFn: async () => (await api.get<StudentRow[]>("/students", { params: { q: search || undefined } })).data,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get<Department[]>("/departments")).data,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StudentForm>();

  const createMutation = useMutation({
    mutationFn: (data: StudentForm) => api.post("/students", data),
    onSuccess: () => {
      toast.success("Student account created successfully!");
      qc.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      reset();
    },
    onError: () => toast.error("Could not add student."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/students/${id}`),
    onSuccess: () => {
      toast.success("Student removed.");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, graduationDate }: { id: number; status: string; graduationDate?: string }) =>
      api.patch(`/students/${id}`, { status, graduationDate }),
    onSuccess: () => {
      toast.success("Student status updated.");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const batchEmailMutation = useMutation({
    mutationFn: () => api.post<{ message: string }>("/students/generate-emails"),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => toast.error("Failed to batch generate student emails."),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      api.post("/auth/admin-reset-password", { userId, newPassword }),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      setResetModalStudent(null);
      setNewResetPassword("");
    },
    onError: () => toast.error("Failed to reset password."),
  });

  const isAdmin = user?.role === "admin";
  const canExport = user?.role === "admin" || user?.role === "teacher";

  const handleAutoGenerateEmail = () => {
    const name = watch("fullName") || "";
    const code = watch("studentCode") || "";
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
    const generated = cleanName ? `${cleanName}@student.aisms.edu.bd` : `${(code || "student").toLowerCase()}@student.aisms.edu.bd`;
    setValue("email", generated);
    return generated;
  };

  const handleAutoGeneratePassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `Student@${randomNum}!`;
    setValue("password", pass);
    return pass;
  };

  const handleAutoFillCredentials = () => {
    const name = watch("fullName") || "Student";
    const email = handleAutoGenerateEmail();
    const pass = handleAutoGeneratePassword();
    if (!watch("studentCode")) {
      const code = `STU-2026-${Math.floor(100 + Math.random() * 900)}`;
      setValue("studentCode", code);
    }
    toast.success(`Generated for ${name}: ${email} / ${pass}`);
  };

  const copyFormCredentials = () => {
    const email = watch("email");
    const pass = watch("password");
    if (!email || !pass) {
      toast.error("Please enter or generate email and password first.");
      return;
    }
    navigator.clipboard.writeText(`Student Email: ${email}\nInitial Password: ${pass}`);
    setCopied(true);
    toast.success("Login credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  async function exportCsv() {
    const res = await api.get("/export/students", { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredStudents = students.filter((s) => {
    if (deptFilter && s.departmentCode !== deptFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Students Management"
        subtitle="Student enrollment, email generation, initial passwords, and graduation records."
        action={
          <div className="flex gap-2">
            {canExport && (
              <button className="btn-secondary" onClick={exportCsv}>
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => batchEmailMutation.mutate()}
                  disabled={batchEmailMutation.isPending}
                  title="Auto-generate institutional @student.aisms.edu.bd emails for all students"
                >
                  <Mail className="h-4 w-4 text-blue-600" />
                  {batchEmailMutation.isPending ? "Generating…" : "Batch Emails"}
                </button>
                <button className="btn-primary" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Student
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input max-w-xs text-xs"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading students…</p>
      ) : (
        <Table headers={["Name", "Student Code", "Department", "Email", "Semester", "Academic Status", "Guardian", ...(isAdmin ? ["Actions"] : [])]}>
          {filteredStudents.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50/80">
              <Td className="font-semibold text-slate-900">{s.fullName}</Td>
              <Td className="font-mono text-xs font-bold text-blue-600">{s.studentCode}</Td>
              <Td>
                <span className="badge bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  {s.departmentCode || "General"}
                </span>
              </Td>
              <Td className="font-mono text-xs text-slate-700">{s.email}</Td>
              <Td>Sem {s.semester}</Td>
              <Td>
                {isAdmin ? (
                  <select
                    value={s.status || "active"}
                    onChange={(e) => updateStatusMutation.mutate({ id: s.id, status: e.target.value })}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border outline-none cursor-pointer ${
                      s.status === "graduated"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : s.status === "suspended" || s.status === "expired"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                ) : (
                  <span className={`badge capitalize ${
                    s.status === "graduated"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : s.status === "suspended" || s.status === "expired"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {s.status || "active"}
                  </span>
                )}
              </Td>
              <Td>{s.guardianName ?? "—"}</Td>
              {isAdmin && (
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setResetModalStudent(s);
                        setNewResetPassword(`Student@${Math.floor(1000 + Math.random() * 9000)}!`);
                      }}
                      className="text-slate-400 hover:text-blue-600 transition"
                      title="Reset Student Password"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingStudent(s)}
                      className="text-slate-400 hover:text-red-600 transition"
                      aria-label={`Remove ${s.fullName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              )}
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={7}>
                No students found.
              </Td>
            </tr>
          )}
        </Table>
      )}

      {/* Add Student Modal */}
      {open && (
        <Modal title="Add New Student & Set Credentials" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 p-3">
              <span className="text-xs font-semibold text-blue-900">Need automatic credentials?</span>
              <button
                type="button"
                onClick={handleAutoFillCredentials}
                className="btn-secondary !py-1 !px-2.5 text-xs bg-white text-blue-700 font-bold border-blue-200 hover:bg-blue-50"
              >
                <Wand2 className="h-3.5 w-3.5 text-blue-600" /> Auto-Fill Credentials
              </button>
            </div>

            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. Alex Johnson" {...register("fullName", { required: true })} />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">Required</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Email Address</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateEmail}
                  className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Wand2 className="h-3 w-3" /> Auto Email
                </button>
              </div>
              <input className="input font-mono text-sm" type="email" placeholder="alex@student.aisms.edu.bd" {...register("email", { required: true })} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Initial Password</label>
                <button
                  type="button"
                  onClick={handleAutoGeneratePassword}
                  className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Key className="h-3 w-3" /> Generate Password
                </button>
              </div>
              <input className="input font-mono text-sm" type="text" placeholder="e.g. Student@2026!" {...register("password", { required: true, minLength: 6 })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Student Code</label>
                <input className="input font-mono" placeholder="STU-2026-001" {...register("studentCode", { required: true })} />
              </div>
              <div>
                <label className="label">Semester</label>
                <input className="input" defaultValue="1" {...register("semester", { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <select className="input" {...register("departmentId", { valueAsNumber: true })}>
                  <option value="">Select Department (Optional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Guardian Name</label>
                <input className="input" placeholder="Optional" {...register("guardianName")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Academic Status</label>
                <select className="input" {...register("status")}>
                  <option value="active">Active Student</option>
                  <option value="graduated">Graduated Alumni</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="label">Guardian Phone</label>
                <input className="input" placeholder="Optional" {...register("guardianPhone")} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={copyFormCredentials}
                className="btn-secondary text-xs flex-1"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Login Credentials"}
              </button>

              <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving…" : "Save Student Account"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin Reset Password Modal */}
      {resetModalStudent && (
        <Modal title={`Reset Password for ${resetModalStudent.fullName}`} onClose={() => setResetModalStudent(null)}>
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Set a new password for <strong>{resetModalStudent.fullName}</strong> (<span className="font-mono">{resetModalStudent.email}</span>).
            </p>
            <div>
              <label className="label">New Password</label>
              <div className="flex gap-2">
                <input
                  className="input font-mono flex-1 text-sm"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setNewResetPassword(`Student@${Math.floor(1000 + Math.random() * 9000)}!`)}
                  className="btn-secondary text-xs"
                >
                  <Wand2 className="h-3.5 w-3.5 text-blue-600" /> Random
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setResetModalStudent(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={resetPasswordMutation.isPending}
                onClick={() =>
                  resetPasswordMutation.mutate({
                    userId: resetModalStudent.userId,
                    newPassword: newResetPassword,
                  })
                }
              >
                {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Student Popup */}
      <ConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={async () => {
          if (deletingStudent) {
            await deleteMutation.mutateAsync(deletingStudent.id);
          }
        }}
        title="Delete Student"
        message="Are you sure you want to permanently delete this student? All linked course registrations, grades, and attendance entries will be removed."
        itemName={deletingStudent ? `${deletingStudent.fullName} (${deletingStudent.studentCode})` : undefined}
        confirmText="Delete Student"
        variant="danger"
      />
    </div>
  );
}
