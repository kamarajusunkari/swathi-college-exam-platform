"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileCheck2,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Plus,
  Cpu,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

export default function AdminEvaluationPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "evaluation-desk"],
    queryFn: async () => {
      const [sheetsRes, usersRes, bundlesRes] = await Promise.all([
        apiClient.get("/evaluation/queue").catch(() => ({ data: { answerSheets: [] } })),
        apiClient.get("/users").catch(() => ({ data: { users: [] } })),
        apiClient.get("/evaluation/bundles/all").catch(() => ({ data: { bundles: [] } })),
      ]);
      return {
        answerSheets: sheetsRes.data?.answerSheets || [],
        teachers: (usersRes.data?.users || []).filter((u: any) => u.role === "TEACHER"),
        bundles: bundlesRes.data?.bundles || [],
      };
    },
    staleTime: 30 * 1000,
  });

  const answerSheets = data?.answerSheets || [];
  const teachers = data?.teachers || [];

  const totalScripts = answerSheets.length;
  const evaluatedScripts = answerSheets.filter(
    (s: any) => s.evaluationStatus === "FINALIZED" || s.evaluationStatus === "AI_EVALUATED"
  ).length;
  const pendingScripts = answerSheets.filter(
    (s: any) => s.evaluationStatus === "PENDING" || s.evaluationStatus === "UNDER_REVIEW"
  ).length;
  const evaluationProgress = totalScripts > 0 ? Math.round((evaluatedScripts / totalScripts) * 100) : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#ff5722] uppercase tracking-wider font-mono">
              <FileCheck2 className="w-4 h-4" />
              Central Evaluation Desk
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight mt-1 font-heading">
              Digital Script Evaluation &amp; Moderation Board
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Live tracking of barcode script bundles, evaluator workloads, AI rubrics, and marks verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/exams/create"
              className="btn-outline btn-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create / Scan Exam
            </Link>

            <Link
              href="/teacher/evaluation"
              className="btn-primary btn-sm"
            >
              <Cpu className="w-3.5 h-3.5" />
              Open Live Evaluation Terminal
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="kpi-card">
            <div className="kpi-icon-box bg-slate-100 text-slate-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{totalScripts}</p>
              <p className="kpi-label">Total Scripts Cataloged</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number text-emerald-700">{evaluatedScripts}</p>
              <p className="kpi-label">Evaluated ({evaluationProgress}%)</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number text-amber-700">{pendingScripts}</p>
              <p className="kpi-label">Pending Moderation</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number text-purple-700">{teachers.length}</p>
              <p className="kpi-label">Faculty Evaluators</p>
            </div>
          </div>
        </div>

        {/* Section: Live Answer Script Evaluation Ledger */}
        <div className="data-container">
          <div className="data-header">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-800 font-heading">
                Live Candidate Answer Scripts &amp; Grading Records
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Complete student answer script ledger with question-level breakdown and evaluator remarks.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono font-normal">
              {answerSheets.length} Registered Scripts
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#ff5722]" />
              <span className="text-xs">Loading candidate answer scripts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50/80 text-slate-400 font-normal border-b border-slate-100">
                  <tr>
                    <th className="table-th">Script Barcode / ID</th>
                    <th className="table-th">Student &amp; Roll No</th>
                    <th className="table-th">Subject &amp; Exam</th>
                    <th className="table-th">Assigned Evaluator</th>
                    <th className="table-th">Marks Obtained</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {answerSheets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="table-td py-10 text-center text-slate-400 font-normal">
                        No physical answer scripts scanned yet. Use &quot;+ Create / Scan Exam&quot; or ingest barcode bundles.
                      </td>
                    </tr>
                  ) : (
                    answerSheets.map((sheet: any) => {
                      const isEvaluated =
                        sheet.evaluationStatus === "FINALIZED" || sheet.evaluationStatus === "AI_EVALUATED";
                      return (
                        <tr key={sheet.id} className="hover:bg-slate-50/70 transition">
                          <td className="table-td font-mono font-medium text-[#ff5722]">
                            {sheet.sheetCode || sheet.id.slice(0, 10)}
                          </td>
                          <td className="table-td">
                            <p className="font-medium text-slate-800">{sheet.student?.user?.name || "Candidate"}</p>
                            <p className="text-[11px] text-slate-400 font-normal">
                              {sheet.student?.rollNo || "Unmapped"} • {sheet.student?.class?.name || ""}
                            </p>
                          </td>
                          <td className="table-td">
                            <p className="text-slate-800 font-medium">{sheet.exam?.subject?.name || sheet.exam?.title}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{sheet.exam?.title}</p>
                          </td>
                          <td className="table-td">
                            <p className="text-slate-700 font-medium">{sheet.evaluatedBy?.name || "Unassigned"}</p>
                            <p className="text-[11px] text-slate-400 font-normal">
                              {sheet.verifiedAt ? formatDate(sheet.verifiedAt) : "Pending"}
                            </p>
                          </td>
                          <td className="table-td font-mono">
                            {isEvaluated ? (
                              <div>
                                <span className="font-medium text-slate-800">
                                  {sheet.finalScore ?? sheet.teacherTotalScore ?? "--"}
                                </span>
                                <span className="text-slate-400 text-xs"> / {sheet.exam?.maxMarks || 100}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Not Graded</span>
                            )}
                          </td>
                          <td className="table-td">
                            {isEvaluated ? (
                              <span className="badge-emerald font-mono">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {sheet.evaluationStatus}
                              </span>
                            ) : (
                              <span className="badge-amber font-mono">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                In Queue
                              </span>
                            )}
                          </td>
                          <td className="table-td text-right">
                            <Link
                              href={`/teacher/evaluation/${sheet.id}`}
                              className="btn-primary btn-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect &amp; Moderate
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
