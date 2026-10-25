import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "gold",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "gold" | "teal";
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
          accent === "gold" ? "bg-gold-500/10 text-gold-400" : "bg-teal-400/10 text-teal-400"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-mono text-2xl font-semibold text-mist-100">{value}</p>
        <p className="text-xs text-mist-500">{label}</p>
      </div>
    </div>
  );
}
