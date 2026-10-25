import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck,
  ClipboardList, Bell, LogOut, Sparkles, Wallet, ShieldCheck, Settings, Menu, X, Building2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
  { to: "/app/students", label: "Students", icon: GraduationCap, roles: ["admin", "teacher"] },
  { to: "/app/teachers", label: "Teachers", icon: Users, roles: ["admin"] },
  { to: "/app/departments", label: "Departments", icon: Building2, roles: ["admin", "teacher"] },
  { to: "/app/courses", label: "Courses", icon: BookOpen, roles: ["admin", "teacher", "student"] },
  { to: "/app/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher", "student"] },
  { to: "/app/results", label: "Results", icon: ClipboardList, roles: ["admin", "teacher", "student"] },
  { to: "/app/predictions", label: "AI Insights", icon: Sparkles, roles: ["admin", "teacher", "student"] },
  { to: "/app/fees", label: "Fees", icon: Wallet, roles: ["admin", "student"] },
  { to: "/app/notices", label: "Notices", icon: Bell, roles: ["admin", "teacher", "student"] },
  { to: "/app/settings", label: "Settings & Profile", icon: Settings, roles: ["admin", "teacher", "student"] },
  { to: "/app/audit-log", label: "Audit Trail", icon: ShieldCheck, roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile Top Navbar with Hamburger Toggle */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden shadow-xs">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 font-sans text-sm font-black text-white">
            A
          </span>
          AISMS
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 font-display text-xl font-bold text-slate-900">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-sans text-lg font-black text-white shadow-sm">
              A
            </span>
            AISMS
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-blue-500 hover:bg-white hover:text-slate-800"
          >
            Search everything…
            <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] shadow-xs">Ctrl K</kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 bg-slate-50/50">
          <div className="mb-3 flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm">
                {user.fullName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
              <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold capitalize text-blue-700">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <NavLink
              to="/app/settings"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-blue-500 hover:text-blue-600"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings & Profile
            </NavLink>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-red-600 shadow-xs hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 mt-14 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
