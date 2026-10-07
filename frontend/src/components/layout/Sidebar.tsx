"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
  Award,
  Users,
  CreditCard,
  QrCode,
  History,
  FolderKanban,
  LogOut,
  Cpu,
  ShieldCheck,
  Building,
  Zap,
  BookOpen,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { hasUserPermission } from "@/lib/permissions";
import { toast } from "sonner";
import * as api from "@/lib/api/services.api";

interface SidebarProps {
  user: SessionUser | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = user?.role || "SUPER_ADMIN";

  const handleLogout = async () => {
    try {
      await api.logout();
      document.cookie = "swathi_auth_user=; path=/; max-age=0; SameSite=Lax";
      localStorage.removeItem("auth_token");
      toast.success("Logged out successfully.");
      router.push("/login");
      router.refresh();
    } catch {
      document.cookie = "swathi_auth_user=; path=/; max-age=0; SameSite=Lax";
      router.push("/login");
    }
  };

  const getNavSections = (): Array<{
    title: string;
    items: Array<{
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
  }> => {
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      return [
        {
          title: "CORE DIRECTORY",
          items: [
            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { name: "Academic Programs", href: "/admin/academic", icon: Building },
            { name: "Subjects & Curriculum", href: "/admin/subjects", icon: BookOpen },
            { name: "Faculty Directory", href: "/admin/users/teachers", icon: Users },
            { name: "Students Roster", href: "/admin/users/students", icon: GraduationCap },
            { name: "Authority Control", href: "/admin/users/admins", icon: ShieldCheck },
          ],
        },
        {
          title: "EXAMINATION ENGINE",
          items: [
            { name: "Exam Scheduling", href: "/admin/exams", icon: CalendarDays },
            { name: "QR Hall Tickets", href: "/admin/hall-tickets", icon: QrCode },
            { name: "Answer Sheets", href: "/admin/answer-sheets", icon: FileSpreadsheet },
            { name: "AI Evaluation Desk", href: "/admin/evaluation", icon: Cpu },
            { name: "Results & Moderation", href: "/admin/results", icon: Award },
          ],
        },
        {
          title: "INSTITUTIONAL",
          items: [
            { name: "Fee Management", href: "/admin/fees", icon: CreditCard },
            { name: "Audit & Security", href: "/admin/audit", icon: History },
          ],
        },
      ];
    }

    if (role === "EXAM_PAPER_CREATOR") {
      return [
        {
          title: "PAPER CREATOR WORKSPACE",
          items: [
            { name: "Creator Dashboard", href: "/creator/dashboard", icon: LayoutDashboard },
            { name: "Draft Exam Paper", href: "/admin/exams/create", icon: CalendarDays },
            { name: "Question Papers List", href: "/admin/exams", icon: FileSpreadsheet },
            { name: "Curriculum Resources", href: "/teacher/academic", icon: FolderKanban },
          ],
        },
      ];
    }

    if (role === "EXAM_PAPER_EVALUATOR") {
      return [
        {
          title: "EVALUATION AUTHORITY",
          items: [
            { name: "Evaluator Dashboard", href: "/evaluator/dashboard", icon: LayoutDashboard },
            { name: "AI Evaluation Desk", href: "/admin/evaluation", icon: Cpu },
            { name: "Answer Sheet Batches", href: "/admin/answer-sheets", icon: FileSpreadsheet },
            { name: "Moderated Results", href: "/admin/results", icon: Award },
          ],
        },
      ];
    }

    if (role === "EXAM_PAPER_CHECKER") {
      return [
        {
          title: "PAPER SCRUTINY & MODERATION",
          items: [
            { name: "Checker Dashboard", href: "/checker/dashboard", icon: LayoutDashboard },
            { name: "Scrutiny Queue", href: "/checker/dashboard", icon: ShieldCheck },
            { name: "AI Evaluation Desk", href: "/admin/evaluation", icon: Cpu },
            { name: "Answer Sheet Batches", href: "/admin/answer-sheets", icon: FileSpreadsheet },
            { name: "Verified Results", href: "/admin/results", icon: Award },
          ],
        },
      ];
    }

    if (role === "TEACHER") {
      const sections: any[] = [
        {
          title: "FACULTY & INTERNALS",
          items: [
            { name: "Faculty Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
            { name: "Class Internal Tests", href: "/teacher/dashboard", icon: FileSpreadsheet },
            { name: "Assigned Subjects", href: "/teacher/academic", icon: FolderKanban },
          ],
        },
      ];

      const delegatedItems: any[] = [];
      if (hasUserPermission(user, "CREATE_MAIN_PAPER")) {
        delegatedItems.push({ name: "Main Paper Studio", href: "/creator/dashboard", icon: FileSpreadsheet });
      }
      if (hasUserPermission(user, "EVALUATE_MAIN_SHEETS")) {
        delegatedItems.push({ name: "AI Evaluation Desk", href: "/evaluator/dashboard", icon: Cpu });
      }
      if (hasUserPermission(user, "CHECK_MAIN_SHEETS")) {
        delegatedItems.push({ name: "Scrutiny & Moderation", href: "/checker/dashboard", icon: ShieldCheck });
      }

      if (delegatedItems.length > 0) {
        sections.push({
          title: "DELEGATED AUTHORITIES",
          items: delegatedItems,
        });
      }

      return sections;
    }

    // Student
    return [
      {
        title: "STUDENT PORTAL",
        items: [
          { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { name: "Exam Timetable", href: "/student/exams", icon: CalendarDays },
          { name: "Fee Clearance", href: "/student/fees", icon: CreditCard },
          { name: "QR Hall Ticket", href: "/student/hall-tickets", icon: QrCode },
          { name: "Marksheet & Result", href: "/student/results", icon: Award },
        ],
      },
    ];
  };

  const portalSubtitle = {
    SUPER_ADMIN: "Pharmacy Super Admin",
    ADMIN: "Exam Controller",
    EXAM_PAPER_CREATOR: "Paper Creator Desk",
    EXAM_PAPER_EVALUATOR: "Chief Evaluator Desk",
    EXAM_PAPER_CHECKER: "Chief Scrutiny Desk",
    TEACHER: "Pharmacy Faculty",
    STUDENT: "Student Portal",
  }[role] || "Portal";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DK";

  return (
    <aside className="w-68 bg-[#090f1d] text-slate-300 shrink-0 hidden md:flex flex-col justify-between py-5 px-3.5 h-screen sticky top-0 select-none border-r border-slate-800/80 z-30">
      {/* Top Branding Section (Fixed) */}
      <div className="shrink-0 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 px-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5722] to-[#f4511e] flex items-center justify-center text-white shadow-md shadow-orange-950/30 shrink-0">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white font-heading tracking-tight leading-none flex items-center gap-1">
              <span>Swathi</span>
              <span className="text-[#ff5722]">Pharmacy</span>
            </h2>
            <p className="text-[11px] font-normal text-slate-400 mt-1">
              {portalSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Navigation Area (Scrollable without visible scrollbar line) */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 no-scrollbar">
        {getNavSections().map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-heading">
              {section.title}
            </p>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name + item.href}
                    href={item.href}
                    prefetch={true}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all ${
                      isActive
                        ? "bg-[#1c2438] text-white font-medium border-l-3 border-[#ff5722]"
                        : "text-slate-300 font-normal hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4.5 h-4.5 transition-transform group-hover:scale-105 ${
                          isActive ? "text-[#ff5722]" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span className={isActive ? "text-white font-medium" : "text-slate-300"}>
                        {item.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Profile Card (Sticky Fixed) */}
      <div className="shrink-0 pt-3 border-t border-slate-800/90 bg-[#090f1d]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#111827] border border-slate-800/90">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-full bg-[#ff5722] text-white font-medium text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border-2 border-[#111827]" />
            </div>

            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {user?.name || "Dr. K. S. Narayana"}
              </p>
              <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5 font-normal">
                {user?.role?.toLowerCase().replace("_", " ") || "Super Administrator"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
