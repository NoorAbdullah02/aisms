import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LogIn, Eye, EyeOff, ShieldCheck, KeyRound, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Modal } from "@/components/ui/Modal";
import type { AuthUser } from "@/lib/types";

interface LoginForm {
  email: string;
  password: string;
}

const DEMO_ACCOUNTS = [
  { label: "Admin Portal", email: "admin@aisms.dev", password: "Admin@123" },
  { label: "Teacher Portal", email: "teacher@aisms.dev", password: "Teacher@123" },
  { label: "Student Portal", email: "student@aisms.dev", password: "Student@123" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const { accessToken, refreshToken, user } = res.data as {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      };
      setSession(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/app";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      toast.success("Password reset instructions dispatched to your email!");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err: any) {
      toast.error("Could not process request.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 font-display text-2xl font-bold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-sans text-xl font-black text-white shadow-md">A</span>
          AISMS
        </Link>

        <div className="card shadow-lg border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Sign in to your Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Secure access for Students, Faculty Teachers, and Administrators.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@aisms.dev"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline mb-1.5"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign in to AISMS"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{" "}
              <Link to="/signup" className="font-bold text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Demo Credentials (Click to Autofill)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => {
                    setValue("email", acc.email);
                    setValue("password", acc.password);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 shadow-xs"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <Modal
          title="Forgot Password"
          subtitle="Enter your account email address to dispatch password reset credentials."
          icon={<KeyRound className="h-5 w-5" />}
          onClose={() => setShowForgotModal(false)}
          size="sm"
        >
          <form onSubmit={handleForgotPassword} className="space-y-4 pt-1">
            <div>
              <label className="label">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="you@aisms.dev"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If an account is associated with this email, a reset token dispatch will be queued automatically via our transactional email engine.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn-secondary !py-2 !px-3.5 text-xs"
                disabled={forgotLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary !py-2 !px-3.5 text-xs"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
