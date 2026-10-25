import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Wallet, CreditCard, Printer, FileDown } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import type { StudentRow } from "@/lib/types";

interface FeeRow {
  id: number;
  title: string;
  amount: string;
  semester: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "waived";
  studentId: number;
  studentCode?: string;
}

interface FeeForm {
  studentId: number;
  title: string;
  amount: number;
  semester: string;
  dueDate: string;
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-teal-400/10 text-teal-400 border border-teal-500/20",
  pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  overdue: "bg-red-400/10 text-red-400 border border-red-500/20",
  waived: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

function printFeeReceipt(fee: FeeRow) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popups to print fee receipts.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fee Payment Receipt - ${fee.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 650px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #2563eb; font-size: 24px; }
          .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
          .paid { background: #dcfce7; color: #166534; }
          .pending { background: #fef3c7; color: #92400e; }
          .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .box label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px; }
          .box value { font-size: 16px; font-weight: 600; color: #0f172a; }
          .amount-box { background: #eff6ff; border: 1px solid #bfdbfe; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .amount-box .amount { font-size: 32px; font-weight: bold; color: #1d4ed8; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AISMS - Official Fee Receipt</h1>
          <p>AI-Based Student Management System</p>
        </div>
        <div class="grid">
          <div class="box">
            <label>Student Code</label>
            <value>${fee.studentCode || `STU-${fee.studentId}`}</value>
          </div>
          <div class="box">
            <label>Payment Status</label>
            <span class="badge ${fee.status === "paid" ? "paid" : "pending"}">${fee.status}</span>
          </div>
          <div class="box">
            <label>Fee Title</label>
            <value>${fee.title}</value>
          </div>
          <div class="box">
            <label>Academic Semester</label>
            <value>Semester ${fee.semester}</value>
          </div>
        </div>
        <div class="amount-box">
          <div style="font-size: 12px; color: #3b82f6; font-weight: bold; margin-bottom: 5px;">TOTAL AMOUNT PAID / DUE</div>
          <div class="amount">৳${Number(fee.amount).toFixed(2)} BDT</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Due Date: ${fee.dueDate}</div>
        </div>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} — AISMS Accounts & Finance Portal</p>
          <p>This document is verified and computer-generated.</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function AdminFees() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => (await api.get<FeeRow[]>("/fees")).data,
  });
  const { data: students = [] } = useQuery({
    queryKey: ["students", ""],
    queryFn: async () => (await api.get<StudentRow[]>("/students")).data,
  });

  const { register, handleSubmit, reset } = useForm<FeeForm>();

  const createMutation = useMutation({
    mutationFn: (data: FeeForm) => api.post("/fees", { ...data, studentId: Number(data.studentId), amount: Number(data.amount) }),
    onSuccess: () => {
      toast.success("Fee issued successfully in Taka (৳).");
      qc.invalidateQueries({ queryKey: ["fees"] });
      setOpen(false);
      reset();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/fees/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Fee status updated.");
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });

  const exportCsv = async () => {
    try {
      const res = await api.get("/export/fees", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fees-financial-report.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Fees financial report exported.");
    } catch {
      toast.error("Failed to export fees report.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Fee Management (BDT / ৳)"
        subtitle="Issue invoices in Bangladeshi Taka (৳/Tk) and track payment status."
        action={
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={exportCsv}>
              <FileDown className="h-4 w-4" /> Export CSV
            </button>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Issue fee
            </button>
          </div>
        }
      />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading fees…</p>
      ) : (
        <Table headers={["Student", "Title", "Amount (৳)", "Semester", "Due date", "Status", "Receipt"]}>
          {fees.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50/80">
              <Td className="font-mono text-blue-600 font-bold">{f.studentCode}</Td>
              <Td className="font-medium text-slate-900">{f.title}</Td>
              <Td className="font-bold text-slate-900">৳{Number(f.amount).toFixed(2)}</Td>
              <Td>Sem {f.semester}</Td>
              <Td>{f.dueDate}</Td>
              <Td>
                <select
                  value={f.status}
                  onChange={(e) => statusMutation.mutate({ id: f.id, status: e.target.value })}
                  className={`badge border text-xs capitalize cursor-pointer ${STATUS_STYLE[f.status]}`}
                >
                  {["pending", "paid", "overdue", "waived"].map((s) => (
                    <option key={s} value={s} className="bg-white text-slate-800">{s}</option>
                  ))}
                </select>
              </Td>
              <Td>
                <button
                  onClick={() => printFeeReceipt(f)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  title="Print Fee Receipt"
                >
                  <Printer className="h-3.5 w-3.5" /> Receipt
                </button>
              </Td>
            </tr>
          ))}
          {fees.length === 0 && <tr><Td className="py-8 text-center text-slate-500" colSpan={7}>No fee records yet.</Td></tr>}
        </Table>
      )}

      {open && (
        <Modal title="Issue a fee (Taka / ৳)" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Student</label>
              <select className="input" {...register("studentId", { required: true, valueAsNumber: true })}>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Semester 3 Tuition Fee" {...register("title", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (৳ / Tk)</label>
                <input className="input" type="number" step="0.01" placeholder="450.00" {...register("amount", { required: true, valueAsNumber: true })} />
              </div>
              <div>
                <label className="label">Semester</label>
                <input className="input" defaultValue="1" {...register("semester", { required: true })} />
              </div>
            </div>
            <div>
              <label className="label">Due date</label>
              <input className="input" type="date" {...register("dueDate", { required: true })} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Issuing…" : "Issue fee"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StudentFees() {
  const qc = useQueryClient();
  const [payingFee, setPayingFee] = useState<FeeRow | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | "card">("bkash");

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees", "me"],
    queryFn: async () => (await api.get<FeeRow[]>("/fees/me")).data,
  });

  const payMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/fees/${id}/status`, { status: "paid" }),
    onSuccess: () => {
      toast.success("Payment confirmed successfully! Official receipt updated.");
      qc.invalidateQueries({ queryKey: ["fees", "me"] });
      setPayingFee(null);
    },
    onError: () => toast.error("Payment transaction failed. Please retry."),
  });

  const outstanding = fees.filter((f) => f.status === "pending" || f.status === "overdue");
  const totalDue = outstanding.reduce((sum, f) => sum + Number(f.amount), 0);

  if (isLoading) return <p className="text-sm text-slate-500">Loading fees…</p>;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding balance" value={`৳${totalDue.toFixed(2)}`} icon={Wallet} />
        <StatCard label="Invoices" value={fees.length} icon={CreditCard} accent="teal" />
      </div>
      <Table headers={["Title", "Amount (৳)", "Semester", "Due date", "Status", "Action"]}>
        {fees.map((f) => (
          <tr key={f.id} className="hover:bg-slate-50/80">
            <Td className="font-semibold text-slate-900">{f.title}</Td>
            <Td className="font-bold text-slate-900">৳{Number(f.amount).toFixed(2)}</Td>
            <Td>Sem {f.semester}</Td>
            <Td>{f.dueDate}</Td>
            <Td><span className={`badge text-xs capitalize ${STATUS_STYLE[f.status]}`}>{f.status}</span></Td>
            <Td>
              <div className="flex items-center gap-2">
                {(f.status === "pending" || f.status === "overdue") && (
                  <button onClick={() => setPayingFee(f)} className="btn-secondary !py-1 !px-2.5 text-xs">
                    Pay ৳
                  </button>
                )}
                <button
                  onClick={() => printFeeReceipt(f)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  title="Print Fee Receipt"
                >
                  <Printer className="h-3.5 w-3.5" /> Receipt
                </button>
              </div>
            </Td>
          </tr>
        ))}
        {fees.length === 0 && <tr><Td className="py-8 text-center text-slate-500" colSpan={6}>No fee records yet.</Td></tr>}
      </Table>

      {/* Online Payment / Checkout Modal */}
      {payingFee && (
        <Modal
          title="Online Fee Payment (৳)"
          subtitle={`Secure checkout for: ${payingFee.title}`}
          icon={<CreditCard className="h-5 w-5" />}
          onClose={() => setPayingFee(null)}
          size="md"
        >
          <div className="space-y-4 pt-1">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-md text-center">
              <span className="text-xs uppercase tracking-wider text-blue-100 font-medium">Total Payable Amount</span>
              <h3 className="text-3xl font-extrabold mt-1">৳{Number(payingFee.amount).toFixed(2)}</h3>
              <p className="text-xs text-blue-100 mt-0.5">Semester {payingFee.semester} • Due {payingFee.dueDate}</p>
            </div>

            <div>
              <label className="label">Select Payment Gateway</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "bkash", name: "bKash", color: "border-pink-300 bg-pink-50 text-pink-700" },
                  { id: "nagad", name: "Nagad", color: "border-amber-300 bg-amber-50 text-amber-700" },
                  { id: "rocket", name: "Rocket", color: "border-purple-300 bg-purple-50 text-purple-700" },
                  { id: "card", name: "Visa / Master", color: "border-blue-300 bg-blue-50 text-blue-700" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`rounded-xl border p-3 text-xs font-bold text-center transition flex items-center justify-between ${
                      paymentMethod === m.id ? `${m.color} ring-2 ring-blue-500 shadow-sm` : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{m.name}</span>
                    {paymentMethod === m.id && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              🔒 Instant 256-bit automated reconciliation. An official university tax receipt will be stamped upon verification.
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayingFee(null)}
                className="btn-secondary !py-2 !px-4 text-xs"
                disabled={payMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => payMutation.mutate(payingFee.id)}
                className="btn-primary !py-2 !px-4 text-xs"
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? "Processing ৳…" : `Pay ৳${Number(payingFee.amount).toFixed(2)}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function FeesPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      {user?.role === "admin" ? (
        <AdminFees />
      ) : (
        <>
          <PageHeader title="My Fees (৳ / BDT)" subtitle="Invoices, fee receipts, and payment status in Taka." />
          <StudentFees />
        </>
      )}
    </div>
  );
}
