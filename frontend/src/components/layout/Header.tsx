"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  FileSpreadsheet,
  Cpu,
  GraduationCap,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SessionUser, UserRole } from "@/lib/types";
import { checkUserTimeAccess } from "@/lib/permissions";
import { toast } from "sonner";
import * as api from "@/lib/api/services.api";
import { useLogoutMutation, useSwitchRoleMutation } from "@/features/auth/auth.queries";

interface HeaderProps {
  user: SessionUser | null;
}

const SWITCH_ROLES = [
  {
    key: "superadmin",
    name: "Dr. K. S. Narayana",
    role: "SUPER_ADMIN",
    label: "Super Admin",
    desc: "Master clearance & Role Scheduler",
    icon: Shield,
    color: "text-purple-600 bg-purple-50",
  },
  {
    key: "admin",
    name: "M. Venkat Rao",
    role: "ADMIN",
    label: "Exam Controller",
    desc: "Exams, Hall Tickets & Publishing",
    icon: Shield,
    color: "text-blue-600 bg-blue-50",
  },
  {
    key: "creator",
    name: "Dr. S. K. Verma",
    role: "EXAM_PAPER_CREATOR",
    label: "Exam Paper Creator",
    desc: "Question Papers & AI Rubrics",
    icon: FileSpreadsheet,
    color: "text-amber-600 bg-amber-50",
  },
  {
    key: "evaluator",
    name: "Dr. Sunita Deshmukh",
    role: "EXAM_PAPER_EVALUATOR",
    label: "Exam Paper Evaluator",
    desc: "Answer Sheet Grading & AI Vision",
    icon: Cpu,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "checker",
    name: "Dr. P. V. Ramana",
    role: "EXAM_PAPER_CHECKER",
    label: "Paper Checker",
    desc: "2nd-Stage Scrutiny & Moderation",
    icon: CheckCircle2,
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    key: "teacher",
    name: "Prof. Ramesh Kumar",
    role: "TEACHER",
    label: "Teacher (Faculty)",
    desc: "Class Internals & CIA Marks",
    icon: Users,
    color: "text-teal-600 bg-teal-50",
  },
  {
    key: "student",
    name: "Rahul Sharma",
    role: "STUDENT",
    label: "Student",
    desc: "Timetable, Hall Ticket & Results",
    icon: GraduationCap,
    color: "text-slate-600 bg-slate-50",
  },
];

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const logoutMutation = useLogoutMutation();
  const switchRoleMutation = useSwitchRoleMutation();
  const switching = switchRoleMutation.isPending;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success("Logged out successfully.");
        router.push("/login");
        router.refresh();
      },
    });
  };

  const handleSwitchRole = (roleKey: string) => {
    const targetRoleObj = SWITCH_ROLES.find((r) => r.key === roleKey);
    const targetRole = targetRoleObj ? targetRoleObj.role : roleKey;

    switchRoleMutation.mutate(targetRole, {
      onSuccess: (data) => {
        if (data && data.success && data.user) {
          toast.success(`Switched role to ${data.user.name} (${data.user.role})`);
          setIsSwitcherOpen(false);

          if (data.user.role === "EXAM_PAPER_CREATOR") {
            router.push("/creator/dashboard");
          } else if (data.user.role === "EXAM_PAPER_EVALUATOR") {
            router.push("/evaluator/dashboard");
          } else if (data.user.role === "EXAM_PAPER_CHECKER") {
            router.push("/checker/dashboard");
          } else if (data.user.role === "TEACHER") {
            router.push("/teacher/dashboard");
          } else if (data.user.role === "STUDENT") {
            router.push("/student/dashboard");
          } else {
            router.push("/admin/dashboard");
          }
          router.refresh();
        } else {
          toast.error("Failed to switch role");
        }
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to switch role");
      },
    });
  };

  const name = user?.name || "Dr. K. S. Narayana";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getGreeting = () => {
    if (!mounted) return "Welcome";
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = mounted
    ? new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Academic Portal";

  const timeAccess = checkUserTimeAccess(user);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 flex items-center justify-between shadow-xs transition-all">
      {/* Left: Back button & Greeting with Date */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col justify-center" suppressHydrationWarning>
          <div className="flex items-center gap-1.5" suppressHydrationWarning>
            <h1 className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight leading-none font-heading truncate max-w-[180px] sm:max-w-none" suppressHydrationWarning>
              {getGreeting()}, {name}!
            </h1>
            <span className="text-xs hidden sm:inline">👋</span>
          </div>
          <p className="text-[10px] text-slate-400 font-normal mt-0.5" suppressHydrationWarning>
            {formattedDate} • <span className="text-slate-500 font-medium">swathi-college-of-pharmacy</span>
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exams, rubrics, students..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#ff5722]/50 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/15 transition-all shadow-xs font-normal"
          />
        </div>
      </div>

      {/* Right: Role Switcher, Status Badge, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fast Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Switch Testing Persona"
          >
            <Shield className="w-3.5 h-3.5 text-[#ff5722]" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-slate-900 font-semibold truncate max-w-[100px] sm:max-w-none">
              {user?.role?.replace("_", " ") || "SUPER ADMIN"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Persona
                </p>
                <p className="text-[11px] text-slate-500">
                  Instantly verify permissions &amp; dashboards
                </p>
              </div>

              <div className="space-y-1">
                {SWITCH_RORoles_MAP(SWITCH_ROLES, user?.role, handleSwitchRole, switching)}
              </div>
            </div>
          )}
        </div>

        {/* Time-Window Badge if Restricted */}
        {user?.isTimeRestricted && (
          <div
            className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              timeAccess.isAllowed
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{timeAccess.isAllowed ? "Time Gate Open" : "Outside Window"}</span>
          </div>
        )}

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer relative"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-[#ff5722] text-white text-[8px] sm:text-[9px] font-medium flex items-center justify-center border-2 border-white shadow-xs">
            3
          </span>
        </button>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            title={`${name} (${user?.role || "SUPER_ADMIN"})`}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#ff5722] text-white font-medium text-xs flex items-center justify-center shadow-xs cursor-default font-heading"
          >
            {initials}
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function SWITCH_RORoles_MAP(
  roles: typeof SWITCH_ROLES,
  currentRole: string | undefined,
  handleSwitch: (key: string) => void,
  switching: boolean
) {
  return roles.map((r) => {
    const isCurrent = currentRole === r.role;
    const Icon = r.icon;
    return (
      <button
        key={r.key}
        disabled={switching}
        onClick={() => handleSwitch(r.key)}
        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
          isCurrent
            ? "bg-[#ff5722]/10 text-[#ff5722] font-bold"
            : "hover:bg-slate-50 text-slate-700"
        }`}
      >
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${r.color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-xs font-bold leading-tight truncate">{r.label}</p>
          <p className="text-[10px] text-slate-400 truncate">{r.desc}</p>
        </div>
        {isCurrent && <span className="text-[10px] text-[#ff5722] font-bold">Active</span>}
      </button>
    );
  });
}

