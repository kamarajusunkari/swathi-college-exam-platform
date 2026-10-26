"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Building2,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLoginMutation } from "@/features/auth/auth.queries";
import { loginSchema, LoginFormData } from "@/features/auth/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginMutation();

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Zod Schema Validation
    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      const formattedErrors: { email?: string; password?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "email") formattedErrors.email = err.message;
        if (err.path[0] === "password") formattedErrors.password = err.message;
      });
      setFieldErrors(formattedErrors);
      toast.error(validationResult.error.errors[0]?.message || "Please check your inputs.");
      return;
    }

    setFieldErrors({});

    // 2. TanStack Query Mutation
    loginMutation.mutate(validationResult.data, {
      onSuccess: (data) => {
        if (data.success && data.user) {
          toast.success(data.message || `Signed in successfully as ${data.user.role}`);
          const role = data.user.role;
          if (role === "EXAM_PAPER_CREATOR") {
            router.push("/creator/dashboard");
          } else if (role === "EXAM_PAPER_EVALUATOR") {
            router.push("/evaluator/dashboard");
          } else if (role === "EXAM_PAPER_CHECKER") {
            router.push("/checker/dashboard");
          } else if (role === "TEACHER") {
            router.push("/teacher/dashboard");
          } else if (role === "STUDENT") {
            router.push("/student/dashboard");
          } else {
            router.push("/admin/dashboard");
          }
          router.refresh();
        } else {
          toast.error("Authentication failed. Please check your credentials.");
        }
      },
      onError: (err: any) => {
        const errorMsg =
          typeof err?.message === "string" && err.message !== "[object Object]"
            ? err.message
            : typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : "Unable to connect to the authentication service. Please check your connection and credentials.";
        toast.error(errorMsg);
      },
    });
  };

  const fillQuickCredential = (email: string, pass: string) => {
    setFormData({ email, password: pass });
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slate-900 font-sans selection:bg-[#0A6F34]/20 selection:text-[#0A6F34]">
      {/* ------------------------------------------------------------- */}
      {/* LEFT 70% SECTION: COLLEGE LOGO, BRANDING & INSTITUTIONAL INFO  */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-[70%] bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#f1f5f9] border-r border-slate-200 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Decorative Background Geometry */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0A6F34]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#075FA7]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Header / Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A6F34]/10 border border-[#0A6F34]/20 text-[#0A6F34] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0A6F34]" />
            <span>Autonomous Examination & Digital Evaluation Portal</span>
          </div>
          <div className="text-xs font-medium text-slate-500 hidden sm:block">
            Accredited Grade &apos;A+&apos; • ISO 9001:2026 Certified
          </div>
        </div>

        {/* Center: Main Logo, College Name & Core Features */}
        <div className="my-auto py-12 z-10 max-w-3xl">
          {/* Logo & Emblem */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#0A6F34] via-[#316421] to-[#075FA7] flex items-center justify-center text-white shadow-lg shadow-[#0A6F34]/20 border-2 border-[#BB904E]">
              <GraduationCap className="w-11 h-11 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#BB904E]">Est. 1994</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500">Autonomous Institution</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                SWATHI DEGREE &amp; JUNIOR COLLEGE
              </h1>
            </div>
          </div>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-10 max-w-2xl">
            Integrated Institutional Platform for end-to-end Examination Lifecycle Management, Controlled 2-Hour Question Paper Release, Barcode/QR Answer Sheet Ingestion, AI-Assisted Digital Evaluation, and Real-Time Results Moderation.
          </p>

          {/* Institutional Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-[#0A6F34]/10 text-[#0A6F34] mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Automated Role Routing</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin, Exam Controllers, Evaluators &amp; Students are routed dynamically from your single credential.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-[#075FA7]/10 text-[#075FA7] mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">2-Hour Paper Release Engine</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Strict cryptographic time-locks on question papers before official exam commencement.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-[#BB904E]/10 text-[#BB904E] mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Digital Paper Evaluation Desk</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hybrid AI evaluation engine with step-marking, optical answer validation, and scrutiny gates.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Institutional Audit Log</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tamper-evident activity trail for all marks modifications, paper releases, and score revisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-6 border-t border-slate-200 text-xs text-slate-500 z-10">
          <div>© {new Date().getFullYear()} Swathi College Examination Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Examination By-laws</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Exam Helpdesk</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT 30% SECTION: FOCUSED INSTITUTIONAL LOGIN DESK          */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-[30%] bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[600px] border-l border-slate-100">
        <div className="w-full max-w-sm mx-auto">
          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5 text-[#0A6F34]" />
              <span>Identity &amp; Access Gate</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Authorized Portal Access
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your institutional credentials to enter your role-specific dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Email / Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. admin@swathicollege.edu or username"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A6F34] focus:border-[#0A6F34] transition-all ${
                    fieldErrors.email ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                  }`}
                  disabled={loginMutation.isPending}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-[#075FA7] hover:underline cursor-pointer font-medium">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter your secure password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A6F34] focus:border-[#0A6F34] transition-all ${
                    fieldErrors.password ? "border-rose-400 bg-rose-50/30" : "border-slate-300"
                  }`}
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#0A6F34] hover:bg-[#316421] active:bg-[#0A6F34] shadow-md shadow-[#0A6F34]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dynamic Institutional Super Admin Root Access */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0A6F34] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Root Administrator Access
              </p>
              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Dynamic
              </span>
            </div>

            <div
              onClick={() => fillQuickCredential("admin@swathicollege.edu", "Admin@123")}
              className="group cursor-pointer p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-150"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Super Administrator (Master Role)
                </span>
                <span className="text-[10px] font-semibold text-[#0A6F34] group-hover:underline">
                  Auto Fill →
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-600">
                <span>admin@swathicollege.edu</span>
                <span className="text-slate-400">••••••••</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Dynamic User Management:</span> All faculty, exam paper creators, evaluators, checkers, and enrolled students are provisioned securely on demand via the Super Admin Console.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
