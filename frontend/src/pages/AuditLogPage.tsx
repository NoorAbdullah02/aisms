import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Search, FileDown, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, Td } from "@/components/ui/Table";

interface AuditRow {
  id: number;
  action: string;
  metadata: string | null;
  createdAt: string;
  actorName: string | null;
  actorEmail: string | null;
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await api.get<AuditRow[]>("/audit-logs")).data,
  });

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.actorName && l.actorName.toLowerCase().includes(search.toLowerCase())) ||
      (l.actorEmail && l.actorEmail.toLowerCase().includes(search.toLowerCase())) ||
      (l.metadata && l.metadata.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Timestamp,Actor Name,Actor Email,Action,Metadata"]
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.createdAt}","${l.actorName ?? "System"}","${l.actorEmail ?? ""}","${l.action}","${(l.metadata ?? "").replace(/"/g, '""')}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AISMS_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Audit Trail"
        subtitle="Immutable chronicle of administrative, authentication, and security events across AISMS (NFR-17)."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs"
              title="Refresh Logs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs"
              title="Export Audit Logs as CSV"
            >
              <FileDown className="h-3.5 w-3.5 text-blue-600" />
              Export CSV
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-10 !py-2 text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredLogs.length} of {logs.length} entries
        </span>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-sm text-slate-500 border border-slate-200 bg-white rounded-2xl">
          Loading audit trail…
        </div>
      ) : (
        <Table headers={["When", "Actor", "Action", "Details"]}>
          {filteredLogs.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50/80 transition">
              <Td className="whitespace-nowrap font-mono text-xs text-slate-600">
                {new Date(l.createdAt).toLocaleString()}
              </Td>
              <Td>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{l.actorName ?? "System"}</span>
                  {l.actorEmail && <span className="text-[11px] text-slate-500">{l.actorEmail}</span>}
                </div>
              </Td>
              <Td>
                <span className="badge border border-blue-200 bg-blue-50/80 text-blue-700 text-xs font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-blue-600" />
                  {l.action}
                </span>
              </Td>
              <Td className="max-w-md truncate text-xs text-slate-600 font-mono">
                {l.metadata || "—"}
              </Td>
            </tr>
          ))}
          {filteredLogs.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={4}>
                No audit entries matching filter.
              </Td>
            </tr>
          )}
        </Table>
      )}
    </div>
  );
}
