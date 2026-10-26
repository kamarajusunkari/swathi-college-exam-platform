"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Lock,
  Unlock,
  Plus,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

export default function TeacherExamsPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["teacher", "exams-vault"],
    queryFn: async () => {
      const [papersRes, examsRes] = await Promise.all([
        apiClient.get("/exams/papers/vault").catch(() => ({ data: { papers: [] } })),
        apiClient.get("/exams").catch(() => ({ data: { exams: [] } })),
      ]);
      return {
        papers: papersRes.data?.papers || [],
        exams: examsRes.data?.exams || [],
      };
    },
    staleTime: 30 * 1000,
  });

  const papers = data?.papers || [];
  const exams = data?.exams || [];

  const vaultSecuredCount = papers.filter((p: any) => !p.isReleased && p.status !== "RELEASED").length;
  const releasedCount = papers.filter((p: any) => p.isReleased || p.status === "RELEASED").length;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5722] uppercase tracking-wider font-mono">
              <CalendarDays className="w-4 h-4" />
              Faculty Examination Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight mt-1 font-heading">
              Examination Schedules &amp; AI Question Blueprints
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Create question blueprints, configure AI rubrics, and map exams directly with the Controller of Examinations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/exams/create"
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              + Schedule &amp; Create Exam
            </Link>
          </div>
        </div>

        {/* Security & Mapping Notice */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-purple-50 border border-orange-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 text-[#ff5722] border border-orange-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 font-heading">
                  Direct Admin &amp; 2-Hour Vault Synchronization
                </h3>
                <span className="badge-emerald text-[10px] font-mono">ACTIVE INTEGRATION</span>
              </div>
              <p className="text-xs text-slate-500 font-normal max-w-3xl leading-relaxed">
                When you create an exam or upload a question paper PDF, it is automatically cataloged in the encrypted examination vault. Admin Exam Controllers can verify rubrics and authorize the 2-Hour secure center release.
              </p>
            </div>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="kpi-card">
            <div className="kpi-icon-box bg-slate-100 text-slate-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{exams.length}</p>
              <p className="kpi-label">Total Examinations</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-amber-50 text-amber-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number text-amber-700">{vaultSecuredCount}</p>
              <p className="kpi-label">2-Hr Vault Encrypted</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number text-emerald-700">{releasedCount}</p>
              <p className="kpi-label">Released Papers</p>
            </div>
          </div>
        </div>

        {/* Examinations & Blueprints Table */}
        <div className="data-container">
          <div className="data-header">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-800 font-heading">
                All Examination Schedules &amp; Question Paper Blueprints
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Faculty-authored blueprints and institutional timetables mapped to Admin
              </p>
            </div>
            <Link
              href="/teacher/exams/create"
              className="text-xs text-[#ff5722] hover:text-[#f4511e] font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Blueprint
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#ff5722]" />
              <span className="text-xs">Loading examination schedules...</span>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No examination schedules found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active exams have been scheduled yet. Click &quot;Schedule &amp; Create Exam&quot; to begin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50/80 text-slate-400 font-normal border-b border-slate-100">
                  <tr>
                    <th className="table-th">Subject &amp; Exam Code</th>
                    <th className="table-th">Target Cohort</th>
                    <th className="table-th">Date &amp; Timing</th>
                    <th className="table-th">Author / Created By</th>
                    <th className="table-th">Max Marks</th>
                    <th className="table-th">Vault Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {exams.map((exam: any) => {
                    const paper = exam.papers?.[0];
                    const isReleased = paper?.isReleased || paper?.status === "RELEASED" || exam.releaseStatus === "RELEASED";
                    const isMine = user?.id && paper?.uploadedById === user.id;

                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/70 transition">
                        <td className="table-td">
                          <div className="font-medium text-slate-800">{exam.subject?.name || exam.title}</div>
                          <div className="font-mono text-[11px] text-[#ff5722] mt-0.5 font-medium">
                            {exam.examCode} • {exam.subject?.code}
                          </div>
                        </td>

                        <td className="table-td">
                          <span className="font-medium text-slate-700">{exam.class?.name || "All Batches"}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {exam.academicYear?.name || "Current AY"}
                          </span>
                        </td>

                        <td className="table-td">
                          <div className="font-medium text-slate-800 font-mono">
                            {exam.examDate ? formatDate(exam.examDate) : "TBD"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono font-normal">
                            {exam.durationMinutes} Mins ({exam.startTime || "09:30"} – {exam.endTime || "12:30"})
                          </div>
                        </td>

                        <td className="table-td">
                          {isMine ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              You (Faculty Author)
                            </span>
                          ) : (
                            <span className="text-slate-600 font-normal">
                              {paper?.uploadedBy?.name || "Department Board"}
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Mapped to Admin Console
                          </span>
                        </td>

                        <td className="table-td font-mono font-medium text-slate-800">
                          {exam.maxMarks} Marks
                        </td>

                        <td className="table-td">
                          {isReleased ? (
                            <span className="badge-emerald font-mono">
                              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                              Released
                            </span>
                          ) : (
                            <span className="badge-amber font-mono">
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              2-Hr Vault Encrypted
                            </span>
                          )}
                        </td>

                        <td className="table-td text-right">
                          <Link
                            href="/teacher/evaluation"
                            className="btn-outline btn-sm inline-flex items-center gap-1 text-slate-700"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Evaluate
                          </Link>
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
