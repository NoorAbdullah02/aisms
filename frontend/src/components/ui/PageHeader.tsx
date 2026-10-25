import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-mist-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mist-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
