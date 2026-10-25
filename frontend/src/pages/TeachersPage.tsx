import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Wand2, Mail, Key, Copy, Check, FileDown, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { TeacherRow, Department } from "@/lib/types";

interface TeacherForm {
  fullName: string;
  email: string;
  password: string;
  employeeCode: string;
  designation?: string;
  phone?: string;
  departmentId?: number;
  employmentType?: "Permanent" | "Contractual";
  contractEndDate?: string;
}

export default function TeachersPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [resetModalTeacher, setResetModalTeacher] = useState<TeacherRow | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherRow | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => (await api.get<TeacherRow[]>("/teachers")).data,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get<Department[]>("/departments")).data,
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<TeacherForm>();
  const selectedType = watch("employmentType", "Permanent");

  const createMutation = useMutation({
    mutationFn: (data: TeacherForm) =>
      api.post("/teachers", {
        ...data,
        departmentId: data.departmentId ? Number(data.departmentId) : undefined,
      }),
    onSuccess: () => {
      toast.success("Faculty teacher account created successfully!");
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setOpen(false);
      reset();
    },
    onError: () => toast.error("Could not add teacher."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/teachers/${id}`),
    onSuccess: () => {
      toast.success("Teacher removed.");
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: () => toast.error("Could not delete teacher."),
  });

  const batchEmailMutation = useMutation({
    mutationFn: () => api.post<{ message: string }>("/teachers/generate-emails"),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: () => toast.error("Failed to batch generate faculty emails."),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      api.post("/auth/admin-reset-password", { userId, newPassword }),
    onSuccess: () => {
      toast.success("Faculty password updated successfully!");
      setResetModalTeacher(null);
      setNewResetPassword("");
    },
    onError: () => toast.error("Failed to reset password."),
  });

  const isAdmin = user?.role === "admin";

  const handleAutoGenerateEmail = () => {
    const name = watch("fullName") || "";
    const code = watch("employeeCode") || "";
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
    const generated = cleanName ? `${cleanName}@faculty.aisms.edu.bd` : `${(code || "faculty").toLowerCase()}@faculty.aisms.edu.bd`;
    setValue("email", generated);
    return generated;
  };

  const handleAutoGeneratePassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `Faculty@${randomNum}!`;
    setValue("password", pass);
    return pass;
  };

  const handleAutoFillCredentials = () => {
    const name = watch("fullName") || "Faculty";
    const email = handleAutoGenerateEmail();
    const pass = handleAutoGeneratePassword();
    if (!watch("employeeCode")) {
      const code = `EMP-0${Math.floor(10 + Math.random() * 90)}`;
      setValue("employeeCode", code);
    }
    toast.success(`Generated credentials for ${name}: ${email} / ${pass}`);
  };

  const copyFormCredentials = () => {
    const email = watch("email");
    const pass = watch("password");
    if (!email || !pass) {
      toast.error("Please enter or generate email and password first.");
      return;
    }
    navigator.clipboard.writeText(`Faculty Email: ${email}\nInitial Password: ${pass}`);
    setCopied(true);
    toast.success("Faculty credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/export/teachers", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "teachers.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Teachers roster exported.");
    } catch {
      toast.error("Failed to export teachers CSV.");
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.departmentName && t.departmentName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (deptFilter && t.departmentCode !== deptFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Faculty & Teachers"
        subtitle="Faculty teacher roster, employee codes, departments, and credentials (FR-04)."
        action={
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button className="btn-secondary" onClick={exportCsv}>
                  <FileDown className="h-4 w-4" /> Export CSV
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => batchEmailMutation.mutate()}
                  disabled={batchEmailMutation.isPending}
                  title="Auto-generate institutional @faculty.aisms.edu.bd emails for all teachers"
                >
                  <Mail className="h-4 w-4 text-blue-600" />
                  {batchEmailMutation.isPending ? "Generating…" : "Batch Emails"}
                </button>
                <button className="btn-primary" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Teacher
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Filter and Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, code, email..."
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
            <option key={d.id} value={d.code}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading faculty members…</p>
      ) : (
        <Table headers={["Name", "Employee Code", "Department", "Designation", "Email", "Type", "Contract Expiry", ...(isAdmin ? ["Actions"] : [])]}>
          {filteredTeachers.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/80">
              <Td className="font-semibold text-slate-900">{t.fullName}</Td>
              <Td className="font-mono text-xs font-bold text-blue-600">{t.employeeCode}</Td>
              <Td>
                <span className="badge bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  {t.departmentCode || "General"}
                </span>
              </Td>
              <Td>{t.designation ?? "Faculty Member"}</Td>
              <Td className="font-mono text-xs text-slate-700">{t.email}</Td>
              <Td>
                <span
                  className={`badge ${
                    t.employmentType === "Contractual"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {t.employmentType || "Permanent"}
                </span>
              </Td>
              <Td>{t.contractEndDate ? t.contractEndDate : "Permanent Tenured"}</Td>
              {isAdmin && (
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setResetModalTeacher(t);
                        setNewResetPassword(`Faculty@${Math.floor(1000 + Math.random() * 9000)}!`);
                      }}
                      className="text-slate-400 hover:text-blue-600 transition"
                      title="Reset Faculty Password"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTeacher(t)}
                      className="text-slate-400 hover:text-red-600 transition"
                      aria-label={`Remove ${t.fullName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              )}
            </tr>
          ))}
          {filteredTeachers.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={8}>
                No faculty members found.
              </Td>
            </tr>
          )}
        </Table>
      )}

      {/* Add Faculty Member Modal */}
      {open && (
        <Modal title="Add Faculty Member & Set Credentials" onClose={() => setOpen(false)}>
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
              <input className="input" placeholder="Dr. Sarah Connor" {...register("fullName", { required: true })} />
            </div>

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
              <div className="flex items-center justify-between">
                <label className="label">Faculty Institutional Email</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateEmail}
                  className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Mail className="h-3 w-3" /> Auto @faculty.aisms.edu.bd
                </button>
              </div>
              <input className="input font-mono text-sm" placeholder="sarah.connor@faculty.aisms.edu.bd" {...register("email", { required: true })} />
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
              <input className="input font-mono text-sm" type="text" placeholder="e.g. Faculty@2026!" {...register("password", { required: true, minLength: 6 })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Employee Code</label>
                <input className="input font-mono" placeholder="EMP-001" {...register("employeeCode", { required: true })} />
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" placeholder="Assistant Professor" {...register("designation")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Employment Type</label>
                <select className="input" {...register("employmentType")}>
                  <option value="Permanent">Permanent</option>
                  <option value="Contractual">Contractual</option>
                </select>
              </div>
              <div>
                <label className="label">Contract End Date</label>
                <input
                  className="input"
                  type="date"
                  disabled={selectedType === "Permanent"}
                  {...register("contractEndDate")}
                />
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input className="input" placeholder="+880-1700-000000" {...register("phone")} />
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
                {createMutation.isPending ? "Saving…" : "Save Faculty Account"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin Reset Password Modal */}
      {resetModalTeacher && (
        <Modal title={`Reset Password for ${resetModalTeacher.fullName}`} onClose={() => setResetModalTeacher(null)}>
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Set a new password for <strong>{resetModalTeacher.fullName}</strong> (<span className="font-mono">{resetModalTeacher.email}</span>).
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
                  onClick={() => {
                    const pass = `Faculty@${Math.floor(1000 + Math.random() * 9000)}!`;
                    setNewResetPassword(pass);
                  }}
                  className="btn-secondary text-xs"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setResetModalTeacher(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={resetPasswordMutation.isPending || !newResetPassword}
                onClick={() =>
                  resetPasswordMutation.mutate({
                    userId: resetModalTeacher.userId,
                    newPassword: newResetPassword,
                  })
                }
              >
                {resetPasswordMutation.isPending ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Remove Faculty Member Popup */}
      <ConfirmModal
        isOpen={!!deletingTeacher}
        onClose={() => setDeletingTeacher(null)}
        onConfirm={async () => {
          if (deletingTeacher) {
            await deleteMutation.mutateAsync(deletingTeacher.id);
          }
        }}
        title="Remove Faculty Member"
        message="Are you sure you want to remove this faculty member? Their login account, course teaching assignments, and department affiliations will be revoked."
        itemName={deletingTeacher ? `${deletingTeacher.fullName} (${deletingTeacher.employeeCode})` : undefined}
        confirmText="Remove Faculty"
        variant="danger"
      />
    </div>
  );
}
