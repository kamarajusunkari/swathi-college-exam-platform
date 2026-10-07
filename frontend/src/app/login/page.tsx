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
  Award,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api/services.api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter your username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({
        email: username.trim(),
        password: password.trim(),
      });

      if (data.success && data.user) {
        // Ensure client cookies are set for Next.js server components and router transitions
        document.cookie = `swathi_auth_user=${encodeURIComponent(data.user.email)}; path=/; max-age=604800; SameSite=Lax`;
        if (data.token) {
          document.cookie = `auth_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`;
          localStorage.setItem("auth_token", data.token);
        }

        toast.success(data.message || `Signed in successfully as ${data.user.role}`);
        if (data.user.role === "EXAM_PAPER_CREATOR") {
          router.push("/creator/dashboard");
        } else if (data.user.role === "EXAM_PAPER_EVALUATOR") {
          router.push("/evaluator/dashboard");
        } else if (data.user.role === "TEACHER") {
          router.push("/teacher/dashboard");
        } else if (data.user.role === "STUDENT") {
          router.push("/student/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
        router.refresh();
      } else {
        toast.error("Authentication failed. Please check your credentials.");
      }
    } catch (err: any) {
      toast.error(err.message || "Unable to connect to the authentication service. Please retry.");
    } finally {
      setLoading(false);
    }
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
                <h4 className="text-sm font-semibold text-slate-900">Double-Blind Digital Evaluation</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-assisted rubric scoring and manual review workspace with instant audit logging.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-[#316421]/10 text-[#316421] mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Verified QR Marksheets</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant marksheet issuance with anti-tamper verification and SGPA/CGPA computation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-200 z-10 gap-2">
          <span>&copy; {new Date().getFullYear()} Swathi Educational Society. All Rights Reserved.</span>
          <span className="text-[#0A6F34] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Neon PostgreSQL Database Live
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT 30% SECTION: CLEAN SIGN IN FORM                         */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-[30%] bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center shadow-xl lg:shadow-none z-20">
        <div className="max-w-md w-full mx-auto">
          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#075FA7]/10 text-[#075FA7] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Institutional Access
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter your username or institutional email. Your role and workspace will be determined automatically.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin@swathicollege.edu or username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A6F34] focus:border-[#0A6F34] transition-all"
                  required
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A6F34] focus:border-[#0A6F34] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#0A6F34] hover:bg-[#316421] active:bg-[#0A6F34] shadow-md shadow-[#0A6F34]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
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

          {/* Quick Institutional Account Reference for ease of evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Default Seeded Accounts (Direct from DB):
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Super Admin:</span>
                <span className="font-mono text-slate-600">admin@swathicollege.edu / Admin@123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Exam Controller:</span>
                <span className="font-mono text-slate-600">exam.controller@swathicollege.edu / Admin@123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-amber-800">Paper Creator:</span>
                <span className="font-mono text-slate-600">creator@swathicollege.edu / Admin@123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-800">Paper Evaluator:</span>
                <span className="font-mono text-slate-600">evaluator@swathicollege.edu / Admin@123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Teacher (Internals):</span>
                <span className="font-mono text-slate-600">prof.ramesh@swathicollege.edu / Teacher@123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Student:</span>
                <span className="font-mono text-slate-600">rahul.sharma@student.swathi.edu / Student@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
