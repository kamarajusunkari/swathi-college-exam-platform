"use client";

import React, { useState } from "react";
import {
  X,
  Shield,
  Clock,
  Key,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/lib/types";
import { useUpdateUserRoleMutation } from "@/features/users/users.queries";
import { updateUserRoleSchema } from "@/features/users/users.schema";

interface EditUserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole | string;
    permissions?: string[];
    isActive?: boolean;
    isTimeRestricted?: boolean;
    timeWindowStart?: string | null;
    timeWindowEnd?: string | null;
    dailyStartTime?: string | null;
    dailyEndTime?: string | null;
  } | null;
}

export const ALL_PERMISSIONS: { key: string; label: string; description: string; category: string }[] = [
  {
    key: "CREATE_MAIN_PAPER",
    label: "Create Main Exam Papers",
    description: "Draft, format, and structure main institutional question papers and rubrics",
    category: "Paper Management",
  },
  {
    key: "APPROVE_MAIN_PAPER",
    label: "Approve & Version Question Papers",
    description: "Verify rubric schemes and authorize paper release for printing/digital dispatch",
    category: "Paper Management",
  },
  {
    key: "EVALUATE_MAIN_SHEETS",
    label: "Evaluate Main Answer Sheets",
    description: "Verify AI grading, score student answer booklets, and submit for checking",
    category: "Evaluation Desk",
  },
  {
    key: "CHECK_MAIN_SHEETS",
    label: "Check & Moderate Evaluated Papers",
    description: "Perform 2nd-stage scrutiny on evaluator marks, verify totals & rubric compliance",
    category: "Evaluation Desk",
  },
  {
    key: "FINALIZE_MAIN_MARKS",
    label: "Finalize & Sign-off Official Marks",
    description: "Commit final verified evaluation scores to university registry",
    category: "Evaluation Desk",
  },
  {
    key: "CREATE_INTERNAL_PAPER",
    label: "Create Class Internal Papers",
    description: "Design Unit Tests, Internal Mid-terms, and Class Quizzes for assigned classes",
    category: "Faculty Internals",
  },
  {
    key: "EVALUATE_INTERNAL_MARKS",
    label: "Assign Class Internal Marks",
    description: "Record continuous internal assessment (CIA) and class practical scores",
    category: "Faculty Internals",
  },
  {
    key: "MANAGE_EXAMS",
    label: "Schedule Examinations",
    description: "Create exam timetables, allocate halls, and set release triggers",
    category: "Administration",
  },
  {
    key: "MANAGE_USERS",
    label: "Manage Staff & Authority Identity",
    description: "Onboard faculty, assign roles, configure permissions and time windows",
    category: "Administration",
  },
  {
    key: "MANAGE_FEES",
    label: "Fee Management & Clearance",
    description: "Verify offline counter collections, reconcile payment gateways",
    category: "Administration",
  },
  {
    key: "ISSUE_HALL_TICKETS",
    label: "Generate & Issue QR Hall Tickets",
    description: "Authorize student admit cards with secure cryptographic QR verification",
    category: "Administration",
  },
  {
    key: "PUBLISH_RESULTS",
    label: "Publish Official Marksheets",
    description: "Release semester scorecards and official digital transcripts",
    category: "Administration",
  },
  {
    key: "AUDIT_ACCESS",
    label: "Institutional Audit & Security Logs",
    description: "Inspect immutable system events and administrative action logs",
    category: "Administration",
  },
];

export const ROLE_PRESET_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS.map((p) => p.key),
  ADMIN: [
    "MANAGE_EXAMS",
    "APPROVE_MAIN_PAPER",
    "MANAGE_FEES",
    "ISSUE_HALL_TICKETS",
    "PUBLISH_RESULTS",
    "AUDIT_ACCESS",
  ],
  EXAM_PAPER_CREATOR: ["CREATE_MAIN_PAPER", "APPROVE_MAIN_PAPER"],
  EXAM_PAPER_EVALUATOR: ["EVALUATE_MAIN_SHEETS"],
  EXAM_PAPER_CHECKER: ["CHECK_MAIN_SHEETS", "FINALIZE_MAIN_MARKS"],
  TEACHER: ["CREATE_INTERNAL_PAPER", "EVALUATE_INTERNAL_MARKS"],
  STUDENT: [],
};

export function EditUserRoleModal({ isOpen, onClose, onSuccess, user }: EditUserRoleModalProps) {
  const [role, setRole] = useState<UserRole>((user?.role as UserRole) || "ADMIN");
  const [permissions, setPermissions] = useState<string[]>(user?.permissions || []);
  const [isActive, setIsActive] = useState<boolean>(user?.isActive ?? true);
  const [isTimeRestricted, setIsTimeRestricted] = useState<boolean>(user?.isTimeRestricted ?? false);
  const [timeWindowStart, setTimeWindowStart] = useState<string>(
    user?.timeWindowStart ? new Date(user.timeWindowStart).toISOString().slice(0, 10) : ""
  );
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>(
    user?.timeWindowEnd ? new Date(user.timeWindowEnd).toISOString().slice(0, 10) : ""
  );
  const [dailyStartTime, setDailyStartTime] = useState<string>(user?.dailyStartTime || "09:00");
  const [dailyEndTime, setDailyEndTime] = useState<string>(user?.dailyEndTime || "18:00");
  const updateMutation = useUpdateUserRoleMutation();
  const loading = updateMutation.isPending;

  // Sync when user prop changes
  React.useEffect(() => {
    if (user) {
      setRole((user.role as UserRole) || "ADMIN");
      setPermissions(user.permissions || ROLE_PRESET_PERMISSIONS[user.role] || []);
      setIsActive(user.isActive ?? true);
      setIsTimeRestricted(user.isTimeRestricted ?? false);
      setTimeWindowStart(
        user.timeWindowStart ? new Date(user.timeWindowStart).toISOString().slice(0, 10) : ""
      );
      setTimeWindowEnd(
        user.timeWindowEnd ? new Date(user.timeWindowEnd).toISOString().slice(0, 10) : ""
      );
      setDailyStartTime(user.dailyStartTime || "09:00");
      setDailyEndTime(user.dailyEndTime || "18:00");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Apply recommended preset
    const preset = ROLE_PRESET_PERMISSIONS[newRole] || [];
    setPermissions(preset);
    if (newRole === "EXAM_PAPER_CREATOR" || newRole === "EXAM_PAPER_EVALUATOR" || newRole === "EXAM_PAPER_CHECKER") {
      setIsTimeRestricted(true);
    }
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const applyPreset = (presetRole: string) => {
    const preset = ROLE_PRESET_PERMISSIONS[presetRole] || [];
    setPermissions(preset);
    toast.info(`Applied ${presetRole.replace("_", " ")} permission preset`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = updateUserRoleSchema.safeParse({
      userId: user.id,
      role,
      permissions,
      isActive,
      isTimeRestricted,
      timeWindowStart: timeWindowStart ? new Date(timeWindowStart).toISOString() : null,
      timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd).toISOString() : null,
      dailyStartTime: isTimeRestricted ? dailyStartTime : null,
      dailyEndTime: isTimeRestricted ? dailyEndTime : null,
    });

    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      await updateMutation.mutateAsync(parseResult.data);
      toast.success(`Updated role & permissions for ${user.name}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Network error while updating role");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configure Authority Role, Permissions &amp; Time Access
              </h2>
              <p className="text-xs text-slate-500">
                Authorizing <strong className="text-slate-800">{user.name}</strong> ({user.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Primary Authority Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Assigned Authority Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: "SUPER_ADMIN",
                  title: "Super Administrator",
                  desc: "Unrestricted master clearance & role management",
                  badge: "bg-purple-50 text-purple-700 border-purple-200",
                },
                {
                  id: "ADMIN",
                  title: "Exam Controller (Admin)",
                  desc: "Exam scheduling, hall tickets, fee & results publishing",
                  badge: "bg-blue-50 text-blue-700 border-blue-200",
                },
                {
                  id: "EXAM_PAPER_CREATOR",
                  title: "Exam Paper Creator",
                  desc: "Creates main exam papers, rubrics & model keys",
                  badge: "bg-amber-50 text-amber-700 border-amber-200",
                },
                {
                  id: "EXAM_PAPER_EVALUATOR",
                  title: "Exam Paper Evaluator",
                  desc: "Evaluates main answer sheets & verifies AI scores",
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                },
                {
                  id: "EXAM_PAPER_CHECKER",
                  title: "Exam Paper Checker (Moderator)",
                  desc: "2nd-stage scrutiny of evaluated papers & mark verification",
                  badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
                },
              ].map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id as UserRole)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#ff5722] bg-[#ff5722]/5 ring-2 ring-[#ff5722]/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{r.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#ff5722]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Time-Based Access Control Window */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-orange-50/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ff5722]" />
                <h3 className="font-bold text-slate-900 text-xs">
                  Time-Based Access Control &amp; Scheduling
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTimeRestricted}
                  onChange={(e) => setIsTimeRestricted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff5722]"></div>
                <span className="ml-2 text-xs font-semibold text-slate-700">
                  {isTimeRestricted ? "Restricted Window Active" : "Unrestricted"}
                </span>
              </label>
            </div>

            {isTimeRestricted && (
              <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in">
                <p className="text-[11px] text-slate-600">
                  Specify the date window and daily operational hours this staff member can access their dashboard and tools.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Valid From (Date)
                    </label>
                    <input
                      type="date"
                      value={timeWindowStart}
                      onChange={(e) => setTimeWindowStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Valid Until (Date)
                    </label>
                    <input
                      type="date"
                      value={timeWindowEnd}
                      onChange={(e) => setTimeWindowEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Daily Access Start Time (24h)
                    </label>
                    <input
                      type="time"
                      value={dailyStartTime}
                      onChange={(e) => setDailyStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Daily Access End Time (24h)
                    </label>
                    <input
                      type="time"
                      value={dailyEndTime}
                      onChange={(e) => setDailyEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Granular Permission Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-600" />
                <label className="text-xs font-bold text-slate-900">
                  Granular Permission Matrix ({permissions.length} active)
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("EXAM_PAPER_CREATOR")}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Creator
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("EXAM_PAPER_EVALUATOR")}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Evaluator
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("EXAM_PAPER_CHECKER")}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Checker
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-purple-50/50 border-purple-300/80 text-purple-900"
                        : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs leading-tight">{perm.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{perm.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Account Clearance Status</span>
              <span className="text-[11px] text-slate-500">
                {isActive ? "User can authenticate and perform allowed duties." : "Account is suspended."}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#f4511e] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-orange-950/20 transition-all cursor-pointer hover:scale-102"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Permissions...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Role &amp; Access Window</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
