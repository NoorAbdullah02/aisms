import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap, BarChart3, ShieldCheck, Sparkles, Bell, BookOpenCheck, ArrowRight } from "lucide-react";
import { HeroScene } from "@/components/three/HeroScene";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Unified Academic Records",
    body: "Centralized student profiles, faculty assignments, courses, and department datasets — zero spreadsheet clutter.",
  },
  {
    icon: BarChart3,
    title: "Dual AI Performance Insights",
    body: "Multi-provider LLM intelligence (Mistral AI & Grok) analyzes GPA trends and attendance to safeguard student progress.",
  },
  {
    icon: ShieldCheck,
    title: "Role & Expiry Security",
    body: "Granular administrative role control, student graduation alumni tracking, and contract expiration monitoring.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    body: "Instant WebSocket event dispatching keeps students, teachers, and admins synchronized without manual refresh.",
  },
  {
    icon: BookOpenCheck,
    title: "Online Registration & Portal",
    body: "Self-service course registration, result transcripts, fee payment tracking, and digital attendance marking.",
  },
  {
    icon: Sparkles,
    title: "Attendance Risk Engine",
    body: "Automated risk categorization (Low, Moderate, High) alerts faculty to attendance drop-offs early.",
  },
];

const STATS = [
  { value: "100%", label: "System Uptime" },
  { value: "Dual AI", label: "Mistral & Grok" },
  { value: "3 Roles", label: "Admin, Teacher, Student" },
  { value: "Real-Time", label: "WebSocket Events" },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-eyebrow", { opacity: 0, y: 12, duration: 0.6, ease: "power3.out" });
      gsap.from(".hero-title", { opacity: 0, y: 24, duration: 0.8, delay: 0.1, ease: "power3.out" });
      gsap.from(".hero-sub", { opacity: 0, y: 16, duration: 0.7, delay: 0.25, ease: "power3.out" });
      gsap.from(".hero-cta", { opacity: 0, y: 16, duration: 0.7, delay: 0.35, ease: "power3.out" });
      gsap.from(".hero-stat", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.45,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power2.out",
          delay: (i % 3) * 0.05,
          scrollTrigger: { trigger: card, start: "top 85%" },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 font-display text-xl font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-sans text-lg font-black text-white shadow-sm">
              A
            </span>
            AISMS
          </div>
          <nav className="hidden gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-blue-600">Features</a>
            <a href="#modules" className="transition hover:text-blue-600">Portals</a>
            <a href="#stack" className="transition hover:text-blue-600">Technology</a>
          </nav>
          <Link to="/login" className="btn-primary !px-5 !py-2 text-sm shadow-sm">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="absolute right-0 top-0 h-full w-full opacity-80 md:w-3/5">
          <HeroScene />
        </div>
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div className="py-12">
            <p className="hero-eyebrow mb-3 font-semibold text-xs uppercase tracking-widest text-blue-600">
              Next-Generation Academic Administration
            </p>
            <h1 className="hero-title text-4xl font-extrabold leading-[1.15] text-slate-900 sm:text-5xl">
              Unified Academic Management Powered by Artificial Intelligence.
            </h1>
            <p className="hero-sub mt-6 max-w-lg text-base leading-relaxed text-slate-600">
              AISMS delivers role-based management for Students, Faculty Teachers, and Administrators — featuring automated GPA analytics, attendance risk detection, and dual Mistral & Grok AI recommendations.
            </p>
            <div className="hero-cta mt-8 flex flex-wrap gap-4">
              <Link to="/login" className="btn-primary py-3 px-6 text-sm">
                Enter Portal <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="btn-secondary py-3 px-6 text-sm">
                Explore Features
              </a>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-slate-200 pt-8">
              {STATS.map((s) => (
                <div key={s.label} className="hero-stat">
                  <dt className="text-2xl font-black text-blue-600">{s.value}</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Comprehensive Capabilities</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Engineered for Modern Institutions & Academic Growth
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card hover:shadow-md transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section id="modules" className="border-t border-slate-200 bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-semibold text-xs uppercase tracking-widest text-blue-600">Three Dedicated Portals</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Tailored Experiences for Admins, Teachers & Students
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { role: "Administrator", items: ["Full student & teacher management", "Academic status & graduation tracking", "Course & department structure", "Audit trail & fee management"] },
              { role: "Faculty Teacher", items: ["Assigned course overview", "Digital attendance marking", "Exam result publishing", "AI academic performance reports"] },
              { role: "Student & Alumni", items: ["Personalized GPA & attendance insights", "Graduation alumni status portal", "Course enrollment & notices", "Fee invoice & payment history"] },
            ].map((col) => (
              <div key={col.role} className="card border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-blue-600">{col.role}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-xs font-semibold text-slate-500">
        AI-Based Student Management System (AISMS) — Empowering Academic Excellence.
      </footer>
    </div>
  );
}
