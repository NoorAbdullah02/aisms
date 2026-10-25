import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, GraduationCap, Users, BookOpen, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface SearchResults {
  students: Array<{ id: number; name: string; code: string }>;
  teachers: Array<{ id: number; name: string; code: string }>;
  courses: Array<{ id: number; title: string; code: string }>;
  departments?: Array<{ id: number; name: string; code: string }>;
}

export function CommandPalette() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["global-search", query],
    queryFn: async () => (await api.get<SearchResults>("/search", { params: { q: query } })).data,
    enabled: open && query.trim().length >= 2 && !!user,
  });

  if (!open) return null;

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const hasResults =
    (data?.students?.length ?? 0) > 0 ||
    (data?.teachers?.length ?? 0) > 0 ||
    (data?.courses?.length ?? 0) > 0 ||
    (data?.departments?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="card w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Search students, faculty, courses, departments… (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">Ctrl K</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {isFetching && <p className="px-3 py-2 text-sm text-slate-500">Searching institutional records…</p>}

          {!hasResults && query.length >= 2 && !isFetching && (
            <p className="px-3 py-2 text-sm text-slate-500">No results found for "{query}".</p>
          )}

          {data?.departments && data.departments.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-xs uppercase tracking-wider font-bold text-slate-400">Departments</p>
              {data.departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => go("/app/departments")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-blue-50 transition"
                >
                  <Building2 className="h-4 w-4 text-blue-600" /> {d.name} <span className="ml-auto font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{d.code}</span>
                </button>
              ))}
            </div>
          )}

          {data?.courses && data.courses.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-xs uppercase tracking-wider font-bold text-slate-400">Courses</p>
              {data.courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go("/app/courses")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-blue-50 transition"
                >
                  <BookOpen className="h-4 w-4 text-indigo-600" /> {c.title} <span className="ml-auto font-mono text-xs text-slate-500">{c.code}</span>
                </button>
              ))}
            </div>
          )}

          {data?.teachers && data.teachers.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-xs uppercase tracking-wider font-bold text-slate-400">Faculty</p>
              {data.teachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go("/app/teachers")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-blue-50 transition"
                >
                  <Users className="h-4 w-4 text-teal-600" /> {t.name} <span className="ml-auto font-mono text-xs text-slate-500">{t.code}</span>
                </button>
              ))}
            </div>
          )}

          {data?.students && data.students.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-xs uppercase tracking-wider font-bold text-slate-400">Students</p>
              {data.students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => go("/app/students")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-blue-50 transition"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-600" /> {s.name} <span className="ml-auto font-mono text-xs text-slate-500">{s.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
