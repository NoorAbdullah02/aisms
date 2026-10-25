import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Building2, Plus, Trash2, Edit3, Users, BookOpen, GraduationCap, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StatCard } from "@/components/ui/StatCard";
import type { Department } from "@/lib/types";

interface DepartmentForm {
  name: string;
  code: string;
  description?: string;
}

export default function DepartmentsPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get<Department[]>("/departments")).data,
  });

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm<DepartmentForm>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm<DepartmentForm>();

  const createMutation = useMutation({
    mutationFn: (data: DepartmentForm) => api.post("/departments", data),
    onSuccess: () => {
      toast.success("Department created successfully!");
      qc.invalidateQueries({ queryKey: ["departments"] });
      setOpenAdd(false);
      resetAdd();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create department."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentForm }) =>
      api.patch(`/departments/${id}`, data),
    onSuccess: () => {
      toast.success("Department updated successfully!");
      qc.invalidateQueries({ queryKey: ["departments"] });
      setEditDept(null);
      resetEdit();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update department."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      toast.success("Department removed.");
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete department."),
  });

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalTeachers = departments.reduce((sum, d) => sum + (d.teacherCount || 0), 0);
  const totalCourses = departments.reduce((sum, d) => sum + (d.courseCount || 0), 0);
  const totalStudents = departments.reduce((sum, d) => sum + (d.studentCount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Academic Departments"
        subtitle="Manage faculties, departments, and academic curricula (FR-05)."
        action={
          isAdmin && (
            <button className="btn-primary" onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" /> Add Department
            </button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Departments" value={departments.length} icon={Building2} />
        <StatCard label="Faculty Teachers" value={totalTeachers} icon={Users} accent="teal" />
        <StatCard label="Curriculum Courses" value={totalCourses} icon={BookOpen} />
        <StatCard label="Enrolled Students" value={totalStudents} icon={GraduationCap} accent="teal" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input !pl-9 text-sm"
            placeholder="Search departments by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading departments…</p>
      ) : (
        <Table headers={["Department Name", "Code", "Description", "Faculty", "Courses", "Students", "Actions"]}>
          {filteredDepts.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50/70">
              <Td className="font-semibold text-slate-900">{d.name}</Td>
              <Td>
                <span className="rounded bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700 border border-blue-200">
                  {d.code}
                </span>
              </Td>
              <Td className="max-w-xs truncate text-xs text-slate-500">{d.description || "—"}</Td>
              <Td className="text-slate-700 font-medium">{d.teacherCount ?? 0}</Td>
              <Td className="text-slate-700 font-medium">{d.courseCount ?? 0}</Td>
              <Td className="text-slate-700 font-medium">{d.studentCount ?? 0}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setEditDept(d);
                          resetEdit({
                            name: d.name,
                            code: d.code,
                            description: d.description || "",
                          });
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                        title="Edit Department"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingDept(d)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                        title="Delete Department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </Td>
            </tr>
          ))}
          {filteredDepts.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={7}>
                No departments found.
              </Td>
            </tr>
          )}
        </Table>
      )}

      {/* Add Department Modal */}
      {openAdd && (
        <Modal title="Create New Department" onClose={() => setOpenAdd(false)}>
          <form
            onSubmit={handleSubmitAdd((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div>
              <label className="label">Department Name</label>
              <input
                className="input"
                placeholder="e.g. Computer Science & Engineering"
                {...registerAdd("name", { required: true })}
              />
            </div>
            <div>
              <label className="label">Department Code</label>
              <input
                className="input"
                placeholder="e.g. CSE"
                {...registerAdd("code", { required: true })}
              />
            </div>
            <div>
              <label className="label">Description / Vision</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Brief description of the academic department..."
                {...registerAdd("description")}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create Department"}
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Department Modal */}
      {editDept && (
        <Modal title={`Edit Department: ${editDept.name}`} onClose={() => setEditDept(null)}>
          <form
            onSubmit={handleSubmitEdit((data) =>
              updateMutation.mutate({ id: editDept.id, data })
            )}
            className="space-y-4"
          >
            <div>
              <label className="label">Department Name</label>
              <input className="input" {...registerEdit("name", { required: true })} />
            </div>
            <div>
              <label className="label">Department Code</label>
              <input className="input" {...registerEdit("code", { required: true })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[80px]" {...registerEdit("description")} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating…" : "Update Department"}
            </button>
          </form>
        </Modal>
      )}

      {/* Confirm Department Deletion Popup */}
      <ConfirmModal
        isOpen={!!deletingDept}
        onClose={() => setDeletingDept(null)}
        onConfirm={async () => {
          if (deletingDept) {
            await deleteMutation.mutateAsync(deletingDept.id);
          }
        }}
        title="Delete Department"
        message="Are you sure you want to permanently remove this academic department? All courses and records mapped to it should be reviewed."
        itemName={deletingDept ? `${deletingDept.name} (${deletingDept.code})` : undefined}
        confirmText="Delete Department"
        variant="danger"
      />
    </div>
  );
}
