import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  UserPlus,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Building2,
  Mail,
  User,
  Lock,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/lib/types";

interface Department {
  id: number;
  name: string;
  code: string;
}

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
  departmentId?: number | string;
  code?: string;
  phone?: string;
  designation?: string;
  guardianName?: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: {
      role: "student",
      designation: "Lecturer",
    },
  });

  const passwordValue = watch("password");

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await api.get<Department[]>("/auth/departments");
        setDepartments(res.data || []);
      } catch {
        // Non-blocking fallback
      }
    }
    fetchDepartments();
  }, []);

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: selectedRole,
        departmentId: data.departmentId ? Number(data.departmentId) : undefined,
        code: data.code?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        designation: selectedRole === "teacher" ? data.designation?.trim() : undefined,
        guardianName: selectedRole === "student" ? data.guardianName?.trim() : undefined,
      };

      const res = await api.post("/auth/signup", payload);
      const { accessToken, refreshToken, user } = res.data as {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      };

      setSession(user, accessToken, refreshToken);
      toast.success(`Welcome to AISMS, ${user.fullName}! Account created successfully.`);
      navigate("/app", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="relative w-full max-w-lg">
        {/* Brand Header */}
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5 font-display text-2xl font-bold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-sans text-xl font-black text-white shadow-md">
            A
          </span>
          AISMS
        </Link>

        <div className="card shadow-lg border border-slate-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Create your Account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Join AISMS to access the next-generation AI-powered academic portal.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition shadow-xs ${
                selectedRole === "student"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("teacher")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition shadow-xs ${
                selectedRole === "teacher"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Faculty Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  className="input pl-9"
                  placeholder={selectedRole === "student" ? "e.g. Noor Abdullah" : "e.g. Dr. Sarah Ahmed"}
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Must be at least 2 characters" },
                  })}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="input pl-9"
                  placeholder="name@institution.edu"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format",
                    },
                  })}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            {/* Department Selection */}
            <div>
              <label className="label" htmlFor="departmentId">Academic Department</label>
              <div className="relative">
                <select
                  id="departmentId"
                  className="input pl-9 cursor-pointer"
                  {...register("departmentId")}
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {selectedRole === "student" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="code">Student ID (Optional)</label>
                  <input
                    id="code"
                    type="text"
                    className="input"
                    placeholder="e.g. STU-2026-002"
                    {...register("code")}
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Auto-generated if left blank</p>
                </div>
                <div>
                  <label className="label" htmlFor="guardianName">Guardian / Parent Name</label>
                  <input
                    id="guardianName"
                    type="text"
                    className="input"
                    placeholder="Guardian Name"
                    {...register("guardianName")}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="designation">Academic Designation</label>
                  <select id="designation" className="input" {...register("designation")}>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Adjunct Faculty">Adjunct Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="phone">Contact Number</label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="text"
                      className="input pl-9"
                      placeholder="+880-1700-000000"
                      {...register("phone")}
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input pr-10 pl-9"
                    placeholder="Min 6 characters"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Min 6 characters" },
                    })}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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

              <div>
                <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="input pr-10 pl-9"
                    placeholder="Re-type password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === passwordValue || "Passwords do not match",
                    })}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms notice */}
            <p className="text-xs text-slate-500 leading-relaxed">
              By registering, you agree to institutional academic conduct policies, audit log compliance, and role access regulations.
            </p>

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating your Account..." : "Create Account & Enter Portal"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Secured with JWT Dual-Key & Role-Based Access Controls</span>
        </div>
      </div>
    </div>
  );
}
