import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Search, Megaphone } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Notice } from "@/lib/types";

interface NoticeForm {
  title: string;
  body: string;
  audience: Notice["audience"];
}

const AUDIENCE_STYLE: Record<string, string> = {
  all: "bg-blue-50 text-blue-700 border-blue-200",
  students: "bg-emerald-50 text-emerald-700 border-emerald-200",
  teachers: "bg-purple-50 text-purple-700 border-purple-200",
  admins: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function NoticesPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);

  const canPublish = user?.role === "admin" || user?.role === "teacher";

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => (await api.get<Notice[]>("/notices")).data,
  });

  const { register, handleSubmit, reset } = useForm<NoticeForm>({ defaultValues: { audience: "all" } });

  const createMutation = useMutation({
    mutationFn: (data: NoticeForm) => api.post("/notices", data),
    onSuccess: () => {
      toast.success("Notice published & broadcasted in real-time!");
      qc.invalidateQueries({ queryKey: ["notices"] });
      setOpen(false);
      reset();
    },
    onError: () => toast.error("Could not publish notice."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/notices/${id}`),
    onSuccess: () => {
      toast.success("Notice removed.");
      qc.invalidateQueries({ queryKey: ["notices"] });
    },
    onError: () => toast.error("Failed to delete notice."),
  });

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (audienceFilter !== "all" && n.audience !== audienceFilter && n.audience !== "all") {
      return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Notice Board & Announcements"
        subtitle="Instant digital notice broadcasting across students, faculty, and administrators (FR-12, FR-13)."
        action={
          canPublish && (
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New Announcement
            </button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input !pl-9 text-sm"
            placeholder="Search notice titles or announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          {[
            { id: "all", label: "All Notices" },
            { id: "students", label: "Students" },
            { id: "teachers", label: "Faculty" },
            { id: "admins", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAudienceFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                audienceFilter === tab.id ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading notices…</p>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((n) => (
            <div key={n.id} className="card p-5 border border-slate-200 hover:border-slate-300 transition shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{n.body}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <span className={`badge border font-bold capitalize ${AUDIENCE_STYLE[n.audience] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                        Audience: {n.audience}
                      </span>
                      <span>•</span>
                      <span>Published on {new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {canPublish && (
                  <button
                    onClick={() => setDeletingNotice(n)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredNotices.length === 0 && (
            <div className="card py-12 text-center text-sm text-slate-500 border border-dashed border-slate-200">
              No notices match your selected filter.
            </div>
          )}
        </div>
      )}

      {/* New Notice Modal */}
      {open && (
        <Modal title="Publish Institutional Notice" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Notice Headline / Title</label>
              <input
                className="input"
                placeholder="e.g. Midterm Examination Schedule Spring 2026"
                {...register("title", { required: true })}
              />
            </div>
            <div>
              <label className="label">Target Audience</label>
              <select className="input" {...register("audience")}>
                <option value="all">Everyone (All Students & Faculty)</option>
                <option value="students">Students Only</option>
                <option value="teachers">Faculty Teachers Only</option>
                <option value="admins">Administrators Only</option>
              </select>
            </div>
            <div>
              <label className="label">Notice Content / Instructions</label>
              <textarea
                className="input min-h-[120px]"
                placeholder="Detailed instructions or announcement body..."
                {...register("body", { required: true })}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Broadcasting…" : "Broadcast Announcement"}
            </button>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Notice Popup */}
      <ConfirmModal
        isOpen={!!deletingNotice}
        onClose={() => setDeletingNotice(null)}
        onConfirm={async () => {
          if (deletingNotice) {
            await deleteMutation.mutateAsync(deletingNotice.id);
          }
        }}
        title="Delete Notice"
        message="Are you sure you want to delete this announcement? Students and faculty will no longer see this broadcast on their notice board."
        itemName={deletingNotice ? deletingNotice.title : undefined}
        confirmText="Delete Notice"
        variant="danger"
      />
    </div>
  );
}
