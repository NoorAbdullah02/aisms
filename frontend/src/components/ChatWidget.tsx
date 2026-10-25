import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Cpu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AttendanceSummary, PredictionResult } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  provider?: string;
}

export function ChatWidget() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! I am your AISMS Dual AI Assistant (powered by Mistral & Grok). Ask me anything about your courses, attendance, GPA, or regulations!",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: attendance } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: async () => (await api.get<AttendanceSummary>("/attendance/me")).data,
    enabled: open && user?.role === "student",
  });
  const { data: prediction } = useQuery({
    queryKey: ["ai", "predict", "me"],
    queryFn: async () => (await api.get<PredictionResult>("/ai/predict/me")).data,
    enabled: open && user?.role === "student",
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    // Check quick local data for student attendance/GPA queries first
    const q = text.toLowerCase();
    let localAnswer = "";
    if (user?.role === "student") {
      if (/attendance|present|absent/.test(q) && attendance) {
        localAnswer = `You currently have ${attendance.percentage}% attendance (${attendance.present}/${attendance.total} sessions). ${
          attendance.percentage < 75 ? "⚠️ Note: Your attendance is below the 75% exam eligibility threshold." : "✅ Excellent attendance."
        }`;
      } else if (/gpa|grade|result|perform/.test(q) && prediction) {
        localAnswer = `Your predicted GPA is ${prediction.predictedGpa.toFixed(2)} (${prediction.predictedGpaBand}). Attendance risk is ${prediction.attendanceRisk}. Top recommendation: ${prediction.recommendations[0]}`;
      }
    }

    if (localAnswer) {
      setMessages((prev) => [...prev, { role: "assistant", text: localAnswer, provider: "Instant Engine" }]);
      setLoading(false);
      return;
    }

    // Call Dual AI Provider Endpoint (Mistral AI <-> Grok xAI Fallback)
    try {
      const res = await api.post("/ai/chat", {
        prompt: text,
        systemPrompt: `You are the AI Academic Assistant for AISMS. User is ${user?.fullName} (${user?.role}). Be concise, professional, and helpful.`,
      });
      const data = res.data as { text: string; providerUsed: string; model: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text,
          provider: `${data.providerUsed === "mistral" ? "Mistral AI" : "Grok xAI"} (${data.model})`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Hi ${user?.fullName?.split(" ")[0]}! You can check your attendance, view exam results, register for courses, or manage fee payments from your sidebar menu.`,
          provider: "AISMS Assistant",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-glow ring-4 ring-blue-100 transition-all hover:scale-105 hover:bg-blue-700"
          aria-label="Open AI Assistant"
        >
          {/* Beautiful AI Agent Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
            </span>
          </div>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-[520px] max-h-[85vh] w-[calc(100vw-32px)] sm:w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-sm ring-2 ring-blue-400/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>AISMS AI Agent</span>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-blue-400" /> Mistral & Grok Dual AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close Assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
                {m.provider && (
                  <span className="mt-1 text-[10px] font-semibold text-slate-400 px-1">
                    via {m.provider}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100 max-w-[70%]">
                <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
                <span>AI Agent thinking…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
            <input
              className="input flex-1 !py-2 text-sm"
              placeholder="Ask AI about attendance, courses…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button onClick={handleSend} className="btn-primary !px-3 !py-2" disabled={loading} aria-label="Send Message">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
