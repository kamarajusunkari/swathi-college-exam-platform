"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  BookOpen,
  GraduationCap,
  Award,
  FileSpreadsheet,
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Fingerprint,
  RefreshCw,
  QrCode,
  CreditCard,
  Briefcase,
  History,
  Layers,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { SessionUser, UserRole } from "@/lib/types";
import {
  useMyProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSwitchRoleMutation,
} from "@/features/auth/auth.queries";
import { checkUserTimeAccess } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

interface ProfileViewProps {
  initialUser?: SessionUser | null;
}

const AVATAR_PRESETS = [
  { id: "avatar-1", label: "Academic Navy", bg: "from-blue-600 to-indigo-700", text: "👨‍🏫" },
  { id: "avatar-2", label: "Scholar Emerald", bg: "from-emerald-600 to-teal-700", text: "👩‍🎓" },
  { id: "avatar-3", label: "Admin Purple", bg: "from-purple-600 to-violet-800", text: "🏛️" },
  { id: "avatar-4", label: "Orange Pharmacy", bg: "from-[#ff5722] to-amber-600", text: "🔬" },
  { id: "avatar-5", label: "Rose Research", bg: "from-rose-600 to-pink-700", text: "📚" },
];

export function ProfileView({ initialUser }: ProfileViewProps) {
  const { data: profileData, isLoading, refetch, isFetching } = useMyProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const switchRoleMutation = useSwitchRoleMutation();

  const user = profileData?.user || initialUser;
  const roleStats = profileData?.roleStats || {};
  const recentLogs: any[] = profileData?.recentLogs || [];

  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "password" | "security">("overview");

  // Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatar: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "MALE",
    address: "",
    designation: "",
    qualification: "",
    department: "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync state when profile data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        fatherName: user.studentProfile?.fatherName || "",
        motherName: (user.studentProfile as any)?.motherName || "",
        dob: user.studentProfile?.dob || "",
        gender: (user.studentProfile as any)?.gender || "MALE",
        address: (user.studentProfile as any)?.address || "",
        designation: user.teacherProfile?.designation || "Assistant Professor",
        qualification: user.teacherProfile?.qualification || "",
        department: user.teacherProfile?.department || "",
      });
    }
  }, [user]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Profile information updated successfully!");
        refetch();
        setActiveTab("overview");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to update profile");
      },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully! Keep your credentials safe.");
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
          refetch();
          setActiveTab("overview");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update password. Please verify current password.");
        },
      }
    );
  };

  const role = (user?.role || "STUDENT") as UserRole;
  const timeAccess = checkUserTimeAccess(user);

  const getRoleConfig = (r: UserRole) => {
    switch (r) {
      case "SUPER_ADMIN":
        return {
          title: "Super Administrator",
          badge: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Shield,
          gradient: "from-purple-900 via-slate-900 to-indigo-950",
          accent: "#9333ea",
          badgeText: "Institutional Master Clearance",
        };
      case "ADMIN":
        return {
          title: "Exam Controller",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Shield,
          gradient: "from-blue-900 via-slate-900 to-slate-950",
          accent: "#2563eb",
          badgeText: "Examination Controller Clearance",
        };
      case "EXAM_PAPER_CREATOR":
        return {
          title: "Question Paper Creator",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          icon: FileSpreadsheet,
          gradient: "from-amber-950 via-slate-900 to-slate-950",
          accent: "#d97706",
          badgeText: "Paper Creator Desk Clearance",
        };
      case "EXAM_PAPER_EVALUATOR":
        return {
          title: "Chief Exam Evaluator",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: Cpu,
          gradient: "from-emerald-950 via-slate-900 to-slate-950",
          accent: "#059669",
          badgeText: "AI Vision Evaluation Clearance",
        };
      case "EXAM_PAPER_CHECKER":
        return {
          title: "Paper Scrutiny Checker",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
          icon: CheckCircle2,
          gradient: "from-indigo-950 via-slate-900 to-slate-950",
          accent: "#4f46e5",
          badgeText: "2nd-Stage Moderation Clearance",
        };
      case "TEACHER":
        return {
          title: "Faculty Member",
          badge: "bg-teal-100 text-teal-800 border-teal-200",
          icon: Building,
          gradient: "from-teal-950 via-slate-900 to-slate-950",
          accent: "#0d9488",
          badgeText: "Academic Faculty Clearance",
        };
      case "STUDENT":
      default:
        return {
          title: "Enrolled Student",
          badge: "bg-slate-100 text-slate-800 border-slate-200",
          icon: GraduationCap,
          gradient: "from-slate-900 via-slate-900 to-slate-950",
          accent: "#ff5722",
          badgeText: "Enrolled Scholar Clearance",
        };
    }
  };

  const roleConfig = getRoleConfig(role);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SC";

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 25, label: "Weak", color: "bg-rose-500" };
    if (score <= 3) return { score: 60, label: "Moderate", color: "bg-amber-500" };
    if (score <= 4) return { score: 85, label: "Good", color: "bg-emerald-500" };
    return { score: 100, label: "Very Strong", color: "bg-teal-500" };
  };

  const pwdStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="space-y-6">
      {/* Top Header Hero Banner */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${roleConfig.gradient} text-white p-6 sm:p-8 shadow-xl border border-slate-800`}>
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#ff5722]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* User Avatar */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#ff5722] to-[#d84315] text-white flex items-center justify-center text-2xl sm:text-3xl font-heading font-semibold shadow-xl border-2 border-white/20">
                {formData.avatar ? (
                  <span className="text-4xl">{formData.avatar}</span>
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-slate-900 ${
                  user?.isActive !== false ? "bg-emerald-500" : "bg-rose-500"
                }`}
                title={user?.isActive !== false ? "Active Account" : "Inactive"}
              />
            </div>

            {/* User Credentials & Name */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${roleConfig.badge}`}>
                  {roleConfig.title}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified Institutional Account
                </span>

                {user?.isTimeRestricted && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      timeAccess.isAllowed
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {timeAccess.isAllowed ? "Time Gate Open" : "Outside Permitted Hours"}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white">
                {user?.name || "Institutional User"}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-normal">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#ff5722]" />
                  {user?.email}
                </span>

                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}

                {/* Role Specific Identifier Pill */}
                {role === "STUDENT" && user?.studentProfile && (
                  <span className="flex items-center gap-1.5 font-medium text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                    <Fingerprint className="w-3 h-3" />
                    Roll No: {user.studentProfile.rollNo}
                  </span>
                )}

                {(role === "TEACHER" ||
                  role === "EXAM_PAPER_CREATOR" ||
                  role === "EXAM_PAPER_EVALUATOR" ||
                  role === "EXAM_PAPER_CHECKER") &&
                  user?.teacherProfile && (
                    <span className="flex items-center gap-1.5 font-medium text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-500/30">
                      <Briefcase className="w-3 h-3" />
                      Employee ID: {user.teacherProfile.employeeId}
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === "edit"
                  ? "bg-[#ff5722] text-white shadow-lg shadow-orange-950/40 font-semibold"
                  : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs"
              }`}
            >
              Edit Profile
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === "password"
                  ? "bg-[#ff5722] text-white shadow-lg shadow-orange-950/40 font-semibold"
                  : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs"
              }`}
            >
              Change Password
            </button>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh Profile"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Bottom Summary Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-normal">Department / Branch</p>
            <p className="font-semibold text-white mt-0.5">
              {user?.teacherProfile?.department ||
                (user?.studentProfile as any)?.class?.name ||
                "Pharmaceutical Sciences"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-normal">Clearance Designation</p>
            <p className="font-semibold text-white mt-0.5">
              {user?.teacherProfile?.designation || roleConfig.title}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-normal">Affiliation</p>
            <p className="font-semibold text-white mt-0.5">Swathi College of Pharmacy</p>
          </div>
          <div>
            <p className="text-slate-400 font-normal">Access Mode</p>
            <p className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              {user?.isTimeRestricted ? "Scheduled Window" : "24/7 Full Operational"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-[#090f1d] text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "edit"
              ? "bg-[#090f1d] text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Edit Profile &amp; Bio</span>
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "password"
              ? "bg-[#090f1d] text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password &amp; Security</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "security"
              ? "bg-[#090f1d] text-white shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity &amp; Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & FULL ROLE INFORMATION */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Role-Specific Metric Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {role === "STUDENT" && (
              <>
                <div className="kpi-card">
                  <div className="kpi-icon-box bg-blue-50 text-blue-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">
                      {(user?.studentProfile as any)?.class?.name || "B.Pharm"}
                    </p>
                    <p className="kpi-label">
                      Section {(user?.studentProfile as any)?.section?.name || "A"} • Class
                    </p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number text-emerald-700">
                      ₹{roleStats.totalFeesPaid?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="kpi-label">Cleared Examination Fees</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-purple-50 text-purple-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">
                      {(user?.studentProfile as any)?.hallTickets?.length || 0}
                    </p>
                    <p className="kpi-label">QR Hall Tickets Issued</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-amber-50 text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">
                      {roleStats.resultsPublishedCount ||
                        (user?.studentProfile as any)?.examResults?.length ||
                        0}
                    </p>
                    <p className="kpi-label">Published Marksheets</p>
                  </div>
                </div>
              </>
            )}

            {role === "TEACHER" && (
              <>
                <div className="kpi-card">
                  <div className="kpi-icon-box bg-teal-50 text-teal-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">
                      {user?.teacherProfile?.assignments?.length ||
                        roleStats.assignedSubjectsCount ||
                        0}
                    </p>
                    <p className="kpi-label">Assigned Subjects &amp; Classes</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-blue-50 text-blue-600">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number truncate text-lg font-semibold">
                      {user?.teacherProfile?.department || "Pharmaceutics"}
                    </p>
                    <p className="kpi-label">Department / Faculty Wing</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-purple-50 text-purple-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number truncate text-lg font-semibold">
                      {user?.teacherProfile?.qualification || "M.Pharm, Ph.D"}
                    </p>
                    <p className="kpi-label">Academic Qualification</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-amber-50 text-amber-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">Active</p>
                    <p className="kpi-label">CIA Question &amp; Mark Desk</p>
                  </div>
                </div>
              </>
            )}

            {role === "EXAM_PAPER_CREATOR" && (
              <>
                <div className="kpi-card">
                  <div className="kpi-icon-box bg-amber-50 text-amber-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.papersDrafted || 0}</p>
                    <p className="kpi-label">Total Papers Formulated</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.papersApproved || 0}</p>
                    <p className="kpi-label">Approved Question Sets</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-purple-50 text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">AI Vision</p>
                    <p className="kpi-label">Rubric &amp; Solution Modeling</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-blue-50 text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">2-Hour Gate</p>
                    <p className="kpi-label">Controlled Release Engine</p>
                  </div>
                </div>
              </>
            )}

            {role === "EXAM_PAPER_EVALUATOR" && (
              <>
                <div className="kpi-card">
                  <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.sheetsEvaluated || 0}</p>
                    <p className="kpi-label">Scripts Evaluated</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-blue-50 text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.sheetsFinalized || 0}</p>
                    <p className="kpi-label">Finalized Grade Sheets</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-purple-50 text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">Gemini Pro</p>
                    <p className="kpi-label">AI Marking Confidence &gt; 90%</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-amber-50 text-amber-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">Authority</p>
                    <p className="kpi-label">Manual Mark Override Rights</p>
                  </div>
                </div>
              </>
            )}

            {role === "EXAM_PAPER_CHECKER" && (
              <>
                <div className="kpi-card">
                  <div className="kpi-icon-box bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.sheetsModerated || 0}</p>
                    <p className="kpi-label">Scripts Moderated &amp; Checked</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">100%</p>
                    <p className="kpi-label">Scrutiny Accuracy SLA</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-purple-50 text-purple-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">Stage 2</p>
                    <p className="kpi-label">Pre-Publish Verification</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-blue-50 text-blue-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">Clearance</p>
                    <p className="kpi-label">Final Result Certification</p>
                  </div>
                </div>
              </>
            )}

            {(role === "SUPER_ADMIN" || role === "ADMIN") && (
              <>
                <div className="kpi-card">
                  <div className="kpi-icon-box bg-purple-50 text-purple-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.totalExamsManaged || 0}</p>
                    <p className="kpi-label">Total Examinations Managed</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-blue-50 text-blue-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.activeStudents || 0}</p>
                    <p className="kpi-label">Active Enrolled Students</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">{roleStats.activeFaculty || 0}</p>
                    <p className="kpi-label">Active Faculty Members</p>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-box bg-amber-50 text-amber-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="kpi-number">Master</p>
                    <p className="kpi-label">Role Switch &amp; Access Gates</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Deep Information Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Personal & Institutional Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Core Institutional Identification */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 text-[#ff5722] flex items-center justify-center font-bold">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800 font-heading">
                        Institutional Profile &amp; Identity
                      </h2>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Official registration parameters in Swathi College of Pharmacy records
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("edit")}
                    className="text-xs text-[#ff5722] font-semibold hover:underline cursor-pointer"
                  >
                    Edit Information
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-normal block mb-1">Full Legal Name</span>
                    <span className="text-slate-800 font-semibold text-sm">{user?.name}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-normal block mb-1">Institutional Email</span>
                    <span className="text-slate-800 font-semibold text-sm">{user?.email}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-normal block mb-1">Contact Phone</span>
                    <span className="text-slate-800 font-medium">
                      {user?.phone || "Not recorded yet"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-normal block mb-1">Assigned Role Authority</span>
                    <span className="text-slate-800 font-semibold">{roleConfig.title}</span>
                  </div>

                  {/* Student Specific Fields */}
                  {role === "STUDENT" && user?.studentProfile && (
                    <>
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                        <span className="text-amber-800/70 font-normal block mb-1">Hall Ticket Roll Number</span>
                        <span className="text-amber-900 font-bold text-sm">
                          {user.studentProfile.rollNo}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                        <span className="text-amber-800/70 font-normal block mb-1">Student Institutional ID</span>
                        <span className="text-amber-900 font-bold text-sm">
                          {user.studentProfile.studentId}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-normal block mb-1">Class / Degree</span>
                        <span className="text-slate-800 font-medium">
                          {(user.studentProfile as any)?.class?.name || "B.Pharm"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-normal block mb-1">Section &amp; Academic Year</span>
                        <span className="text-slate-800 font-medium">
                          Section {(user.studentProfile as any)?.section?.name || "A"} •{" "}
                          {(user.studentProfile as any)?.academicYear?.name || "2026-2027"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-normal block mb-1">Father's Name</span>
                        <span className="text-slate-800 font-medium">
                          {user.studentProfile.fatherName || "Not provided"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-normal block mb-1">Mother's Name</span>
                        <span className="text-slate-800 font-medium">
                          {(user.studentProfile as any)?.motherName || "Not provided"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-normal block mb-1">Date of Birth &amp; Gender</span>
                        <span className="text-slate-800 font-medium">
                          {user.studentProfile.dob || "—"} • {(user.studentProfile as any)?.gender || "MALE"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-normal block mb-1">Residential Address</span>
                        <span className="text-slate-800 font-medium truncate block">
                          {(user.studentProfile as any)?.address || "Swathi College Campus Hostel"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Teacher Specific Fields */}
                  {(role === "TEACHER" ||
                    role === "EXAM_PAPER_CREATOR" ||
                    role === "EXAM_PAPER_EVALUATOR" ||
                    role === "EXAM_PAPER_CHECKER") &&
                    user?.teacherProfile && (
                      <>
                        <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100">
                          <span className="text-teal-800/70 font-normal block mb-1">Employee Registration Code</span>
                          <span className="text-teal-900 font-bold text-sm">
                            {user.teacherProfile.employeeId}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100">
                          <span className="text-teal-800/70 font-normal block mb-1">Academic Designation</span>
                          <span className="text-teal-900 font-bold text-sm">
                            {user.teacherProfile.designation}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 font-normal block mb-1">Academic Department</span>
                          <span className="text-slate-800 font-medium">
                            {user.teacherProfile.department || "Pharmaceutics"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 font-normal block mb-1">Highest Qualification</span>
                          <span className="text-slate-800 font-medium">
                            {user.teacherProfile.qualification || "M.Pharm"}
                          </span>
                        </div>
                      </>
                    )}
                </div>
              </div>

              {/* Card 2: Role-Specific Detailed Sections */}
              {/* TEACHER ASSIGNED SUBJECTS */}
              {role === "TEACHER" && user?.teacherProfile?.assignments && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800 font-heading">
                          Curricular Teaching Portfolio &amp; Subjects
                        </h2>
                        <p className="text-[11px] text-slate-500 font-normal">
                          Courses and classes assigned to your faculty profile
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      {user.teacherProfile.assignments.length} Course Assignments
                    </span>
                  </div>

                  {user.teacherProfile.assignments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No specific subject assignments mapped yet. Admin will allocate classes.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.teacherProfile.assignments.map((assignment: any) => (
                        <div
                          key={assignment.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#ff5722]/30 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#ff5722] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                              {assignment.subject?.code || "SUB-01"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              {assignment.academicYear?.name || "2026-2027"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800">
                            {assignment.subject?.name || "Pharmaceutical Chemistry"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Class: {assignment.class?.name} • Section: {assignment.section?.name || "All"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STUDENT RECENT MARKSHEETS & HALL TICKETS */}
              {role === "STUDENT" && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800 font-heading">
                          Digital Examination Credentials
                        </h2>
                        <p className="text-[11px] text-slate-500 font-normal">
                          Instant access to your verified QR hall tickets and published results
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <QrCode className="w-4 h-4 text-[#ff5722]" />
                          <span>QR Verified Hall Tickets</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Generated upon complete examination fee clearance.
                        </p>
                      </div>
                      <Link
                        href="/student/hall-tickets"
                        className="btn-outline w-full text-xs py-1.5 justify-center"
                      >
                        View &amp; Download Hall Tickets
                      </Link>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Official Marksheets &amp; GPA</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Digitally signed examination evaluation records.
                        </p>
                      </div>
                      <Link
                        href="/student/results"
                        className="btn-outline w-full text-xs py-1.5 justify-center"
                      >
                        Check Academic Marksheets
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN & PRIVILEGED AUTHORITIES CLEARANCE MATRIX */}
              {(role === "SUPER_ADMIN" ||
                role === "ADMIN" ||
                role === "EXAM_PAPER_CREATOR" ||
                role === "EXAM_PAPER_EVALUATOR" ||
                role === "EXAM_PAPER_CHECKER") && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800 font-heading">
                          Delegated Authority &amp; System Capabilities
                        </h2>
                        <p className="text-[11px] text-slate-500 font-normal">
                          Authorized institutional actions active for this identity
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {role === "SUPER_ADMIN"
                            ? "Complete System Master Clearance"
                            : role === "ADMIN"
                            ? "Examination Scheduling & Publishing"
                            : role === "EXAM_PAPER_CREATOR"
                            ? "Controlled Question Formulation Desk"
                            : role === "EXAM_PAPER_EVALUATOR"
                            ? "AI Vision Answer Booklet Grading"
                            : "2nd-Stage Moderation & Checker Desk"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {role === "SUPER_ADMIN"
                            ? "Can schedule access, override grades, manage faculty & publish"
                            : role === "ADMIN"
                            ? "Can manage exams, fee registers, hall tickets & digital publish"
                            : role === "EXAM_PAPER_CREATOR"
                            ? "Can create main question papers with AI rubrics & answers"
                            : role === "EXAM_PAPER_EVALUATOR"
                            ? "Authorized to evaluate physical booklets via AI vision desk"
                            : "Authorized to verify teacher scores, moderate and finalize results"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Audit Trail &amp; Forensic Logging
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          All paper revisions, grade modifications, and logins are recorded immutably.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Security, Time Window & Quick Switcher */}
            <div className="space-y-6">
              {/* Access Window Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Clock className="w-4 h-4 text-[#ff5722]" />
                  <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-heading">
                    Operational Time-Window
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Access Policy</span>
                    <span className="font-semibold text-slate-800">
                      {user?.isTimeRestricted ? "Scheduled Gate" : "24/7 Unrestricted"}
                    </span>
                  </div>

                  {user?.isTimeRestricted ? (
                    <>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-500">Permitted Daily Hours</span>
                        <span className="font-semibold text-slate-800">
                          {user.dailyStartTime || "09:00"} – {user.dailyEndTime || "18:00"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-500">Current Window State</span>
                        <span
                          className={`font-semibold ${
                            timeAccess.isAllowed ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {timeAccess.isAllowed ? "Open & Active" : "Outside Window"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your identity holds perpetual operational clearance without daily time lock.
                    </p>
                  )}
                </div>
              </div>

              {/* Password & Security Quick Card */}
              <div className="bg-gradient-to-br from-slate-900 to-[#090f1d] text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Lock className="w-4 h-4 text-[#ff5722]" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-heading">
                    Security Credentials
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Your password protects confidential examinations, question authoring, or academic records.
                </p>

                <button
                  onClick={() => setActiveTab("password")}
                  className="w-full py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#f4511e] text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Password Now</span>
                </button>
              </div>

              {/* Fast Persona Switcher (For testing profile across roles) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-semibold text-slate-800 font-heading">
                    Preview Other Role Profiles
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Test and inspect how the institutional profile adapts for each designated campus persona:
                </p>

                <div className="space-y-1.5">
                  {[
                    { role: "SUPER_ADMIN", label: "Super Admin (Principal)", icon: Shield },
                    { role: "ADMIN", label: "Exam Controller", icon: Shield },
                    { role: "EXAM_PAPER_CREATOR", label: "Paper Creator", icon: FileSpreadsheet },
                    { role: "EXAM_PAPER_EVALUATOR", label: "Exam Evaluator", icon: Cpu },
                    { role: "EXAM_PAPER_CHECKER", label: "Scrutiny Checker", icon: CheckCircle2 },
                    { role: "TEACHER", label: "Faculty Member", icon: Building },
                    { role: "STUDENT", label: "Enrolled Student", icon: GraduationCap },
                  ].map((item) => {
                    const isCurrent = role === item.role;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.role}
                        disabled={switchRoleMutation.isPending || isCurrent}
                        onClick={() => {
                          switchRoleMutation.mutate(item.role, {
                            onSuccess: () => {
                              toast.success(`Switched role to ${item.label}`);
                              refetch();
                            },
                          });
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#ff5722]/10 text-[#ff5722] font-bold border border-[#ff5722]/20"
                            : "hover:bg-slate-50 text-slate-700 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-[#ff5722]">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE FORM */}
      {activeTab === "edit" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 font-heading">
                Edit Profile Information
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Update your contact parameters, academic bio, and personal institutional details.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("overview")}
              className="btn-outline text-xs py-1.5"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Avatar Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Choose Profile Avatar Icon
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = formData.avatar === preset.text;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setFormData({ ...formData, avatar: preset.text })}
                      className={`h-12 w-12 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                        isSelected
                          ? "border-[#ff5722] bg-orange-50 scale-110 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {preset.text}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: "" })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Use Initials ({initials})
                </button>
              </div>
            </div>

            {/* Base Contact & Identity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. K. S. Narayana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Student Specific Edit Fields */}
            {role === "STUDENT" && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-heading">
                  Student Family &amp; Residential Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="e.g. S. Venkat Rao"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="e.g. S. Lakshmi Devi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      placeholder="YYYY-MM-DD (e.g. 2004-05-18)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all bg-white"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Residential / Permanent Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter street, city, pin code..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Teacher / Staff Specific Edit Fields */}
            {(role === "TEACHER" ||
              role === "EXAM_PAPER_CREATOR" ||
              role === "EXAM_PAPER_EVALUATOR" ||
              role === "EXAM_PAPER_CHECKER") && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-heading">
                  Faculty &amp; Academic Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Academic Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Associate Professor / HOD"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Academic Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Pharmaceutics / Pharmacology"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Highest Academic Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. M.Pharm, Ph.D in Pharmaceutical Chemistry"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="btn-primary text-xs flex items-center gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PASSWORD CHANGE */}
      {activeTab === "password" && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 font-heading">
                Change Institutional Password
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Ensure your new password is at least 6 characters long and kept confidential.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Current Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordData.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-semibold text-slate-700">{pwdStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pwdStrength.color} transition-all duration-300`}
                      style={{ width: `${pwdStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setActiveTab("overview");
                }}
                className="btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="btn-primary text-xs flex items-center gap-2"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying &amp; Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL & ACTIVITY */}
      {activeTab === "security" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 font-heading">
                  Security Log &amp; Audit Trail
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Immutable chronological record of logins, role switches, and profile changes.
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="btn-outline text-xs py-1.5 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No recent audit trail records captured for this session.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {log.action?.replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Target: {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ""}
                      </p>
                      {log.details && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-md truncate">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal shrink-0">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
