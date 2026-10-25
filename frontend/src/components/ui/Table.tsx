import type { ReactNode } from "react";

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-mist-500">
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-3.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700/60">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className = "",
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={`whitespace-nowrap px-5 py-3.5 text-mist-300 ${className}`}>
      {children}
    </td>
  );
}
