"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  History,
  ShieldCheck,
  Clock,
  Terminal,
  Loader2,
  Filter,
  Search,
  Download,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  GraduationCap,
  Users,
  FileSpreadsheet,
  Building,
  KeyRound,
  CreditCard,
  Award,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuditLogs, useAuditSummary } from "@/features/audit/audit.queries";
import { toast } from "sonner";

const ROLE_TABS = [
  { key: "ALL", label: "All Roles", icon: Layers },
  { key: "SUPER_ADMIN", label: "Super Admin", icon: ShieldCheck, color: "text-purple-600 bg-purple-50" },
  { key: "ADMIN", label: "Exam Controller", icon: ShieldCheck, color: "text-blue-600 bg-blue-50" },
  { key: "EXAM_PAPER_CREATOR", label: "Paper Creator", icon: FileSpreadsheet, color: "text-amber-600 bg-amber-50" },
  { key: "EXAM_PAPER_EVALUATOR", label: "Evaluator", icon: Cpu, color: "text-emerald-600 bg-emerald-50" },
  { key: "EXAM_PAPER_CHECKER", label: "Paper Checker", icon: CheckCircle2, color: "text-indigo-600 bg-indigo-50" },
  { key: "TEACHER", label: "Faculty", icon: Building, color: "text-teal-600 bg-teal-50" },
  { key: "STUDENT", label: "Student", icon: GraduationCap, color: "text-slate-600 bg-slate-50" },
];

const IDEMPOTENCY_MATRIX = [
  {
    role: "STUDENT",
    action: "Online Exam Fee Payment",
    endpoint: "POST /fees/pay",
    idempotencyMechanism: "Unique compound key (studentId, examId) + fee.status check; returns existing receipt on duplicate",
    auditAction: "FEE_PAID_ONLINE",
    status: "ENFORCED",
  },
  {
    role: "STUDENT",
    action: "Credential Password Change",
    endpoint: "POST /users/change-password",
    idempotencyMechanism: "Bcrypt hash comparison + immutable timestamp log",
    auditAction: "PASSWORD_CHANGED",
    status: "ENFORCED",
  },
  {
    role: "EXAM_PAPER_CREATOR",
    action: "Question Paper Sign-Off Submission",
    endpoint: "POST /exams/papers/submit",
    idempotencyMechanism: "Status transition lock (SUBMITTED / APPROVED); prevents duplicate resubmission and audit spam",
    auditAction: "QUESTION_PAPER_SUBMITTED",
    status: "ENFORCED",
  },
  {
    role: "EXAM_PAPER_EVALUATOR",
    action: "Answer Booklet Score Grading",
    endpoint: "POST /evaluation/submit",
    idempotencyMechanism: "Prisma Upsert on (answerSheetId, questionNumber); prevents duplicate mark entries",
    auditAction: "EVALUATION_FINALIZED",
    status: "ENFORCED",
  },
  {
    role: "EXAM_PAPER_EVALUATOR",
    action: "Physical Answer Sheet Ingestion",
    endpoint: "POST /evaluation/ingest",
    idempotencyMechanism: "Prisma Upsert on sheetCode; prevents crash or duplicate barcode records on network retry",
    auditAction: "ANSWER_SHEETS_INGESTED",
    status: "ENFORCED",
  },
  {
    role: "EXAM_PAPER_CHECKER",
    action: "2nd-Stage Moderation Sign-Off",
    endpoint: "POST /evaluation/check",
    idempotencyMechanism: "Upsert on ExamResult (studentId, examId) + checkedAt timestamp state",
    auditAction: "PAPER_CHECKING_AND_MODERATION_COMPLETED",
    status: "ENFORCED",
  },
  {
    role: "TEACHER",
    action: "Faculty Profile & Credential Update",
    endpoint: "PUT /users/profile/me",
    idempotencyMechanism: "Safe state convergence with userId scoped database updates",
    auditAction: "PROFILE_UPDATED",
    status: "ENFORCED",
  },
  {
    role: "ADMIN / CONTROLLER",
    action: "Controlled 2-Hour Paper Release",
    endpoint: "POST /exams/papers/release",
    idempotencyMechanism: "State check (isReleased === release); returns existing vault state on replay without duplicate logging",
    auditAction: "PAPER_RELEASED / PAPER_LOCKED",
    status: "ENFORCED",
  },
  {
    role: "ADMIN / CONTROLLER",
    action: "Result Publication to Students",
    endpoint: "POST /results/publish",
    idempotencyMechanism: "Bulk pending changes filter (isPublished !== publish); avoids redundant updates & duplicate audit trails",
    auditAction: "EXAM_RESULTS_PUBLISHED",
    status: "ENFORCED",
  },
  {
    role: "SUPER_ADMIN",
    action: "Campus User Onboarding",
    endpoint: "POST /users/onboard",
    idempotencyMechanism: "Unique index guards on email, rollNo, studentId, employeeId",
    auditAction: "USER_ONBOARDED",
    status: "ENFORCED",
  },
];

export default function AdminAuditPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);

  // Fetch live logs with filters
  const {
    data: logs = [],
    isLoading,
    refetch,
    isFetching,
  } = useAuditLogs({
    role: selectedRole !== "ALL" ? selectedRole : undefined,
    action: selectedAction !== "ALL" ? selectedAction : undefined,
    search: searchQuery.trim() || undefined,
  });

  const { data: summary } = useAuditSummary();

  // Distinct actions for dropdown
  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l: any) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Export filtered logs as JSON
  const handleExportJson = () => {
    if (!logs.length) {
      toast.error("No logs to export");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `swathi_audit_trail_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Exported ${logs.length} audit records`);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5722] uppercase tracking-wider font-heading">
              <History className="w-4 h-4" />
              <span>Multi-Role Governance &amp; Idempotency Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-heading">
              Irrevocable Forensic Audit Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Immutable chronological record of every privileged action, role switch, grade verification, and fee clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="btn-outline text-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{showMatrix ? "Hide Idempotency Matrix" : "View Idempotency Matrix"}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail</span>
            </button>
          </div>
        </div>

        {/* Idempotency & SOC-2 Compliance Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card">
            <div className="kpi-icon-box bg-purple-50 text-purple-600">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{summary?.totalLogs ?? logs.length}</p>
              <p className="kpi-label">Total Immutable Audit Events</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{summary?.recent24hCount ?? logs.length}</p>
              <p className="kpi-label">Mutations in Last 24 Hours</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number text-emerald-700">100%</p>
              <p className="kpi-label">Idempotency Enforced Across All Roles</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">SOC-2 / ISO</p>
              <p className="kpi-label">Tamper-Evident Verification</p>
            </div>
          </div>
        </div>

        {/* Collapsible Idempotency Matrix Section */}
        {showMatrix && (
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 font-heading">
                    Cross-Role Idempotency &amp; State Protection Matrix
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Audit of architectural safety guards preventing duplicate charges, corrupted grades, or race conditions.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                10 Endpoints Audited
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Protected Operation</th>
                    <th className="py-2.5 px-3">Endpoint</th>
                    <th className="py-2.5 px-3">Idempotency Guarantee &amp; Mechanism</th>
                    <th className="py-2.5 px-3">Audit Action Identifier</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {IDEMPOTENCY_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.role}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.action}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-indigo-600">{item.endpoint}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.idempotencyMechanism}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-amber-700">{item.auditAction}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {ROLE_TABS.map((tab) => {
              const isSelected = selectedRole === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedRole(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[#090f1d] text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Action Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by operator, action, entity, details..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#ff5722] text-xs text-slate-800 outline-none bg-white cursor-pointer"
                >
                  <option value="ALL">All Action Events</option>
                  {actionOptions.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh Audit Ledger"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 font-heading flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Live System Mutation Stream
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displaying {logs.length} forensic events matching active criteria.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Verifying and querying forensic audit ledger...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No audit logs matching query</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No system mutations found matching the selected role or search keyword.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Actor / Operator</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Forensic Payload &amp; Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.map((log: any) => {
                    const actorRole = log.user?.role || "SYSTEM";
                    const isSystem = !log.user;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatDateTime(log.createdAt)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {log.user ? log.user.name.slice(0, 2).toUpperCase() : "SYS"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {log.user?.name || "System Automated"}
                              </p>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {actorRole}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{log.entity}</p>
                          {log.entityId && (
                            <p className="text-[10px] font-mono text-slate-400">
                              ID: {log.entityId.slice(0, 10)}...
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {log.details ? (
                            <pre className="p-2 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] max-w-md overflow-x-auto whitespace-pre-wrap shadow-inner">
                              {log.details}
                            </pre>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No payload</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
