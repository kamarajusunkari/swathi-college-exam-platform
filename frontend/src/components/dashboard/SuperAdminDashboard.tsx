"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Play,
  FileText,
  Cpu,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatTime, formatDateTime, formatCurrency } from "@/lib/utils";
import { useTogglePaperReleaseMutation } from "@/features/exams/exams.queries";

interface SuperAdminDashboardProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalExams: number;
    activeExams: number;
    totalAnswerSheets: number;
    evaluatedSheets: number;
    totalFeeCollected: number;
    pendingEvaluations: number;
  };
  upcomingExams: any[];
  auditLogs: any[];
}

export function SuperAdminDashboard({ stats, upcomingExams, auditLogs }: SuperAdminDashboardProps) {
  const router = useRouter();
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const togglePaperReleaseMutation = useTogglePaperReleaseMutation();

  const handleManualPaperRelease = async (examId: string, examTitle: string) => {
    setReleasingId(examId);
    try {
      await togglePaperReleaseMutation.mutateAsync({
        examId,
        release: true,
      });
      toast.success(`Exam Paper Released for ${examTitle}!`, {
        description: "Authorized staff and students in release window can now access the paper.",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to release paper");
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A6F34] via-[#085a2a] to-[#316421] p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[#D9E739] text-xs sm:text-sm font-bold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D9E739]" />
              Executive Super Admin Console
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Examination &amp; Evaluation Hub
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Real-time monitoring of offline examinations, 2-hour controlled question paper releases, answer booklet ingestion, AI evaluation, and verified results.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/exams"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0A6F34] hover:bg-slate-50 text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-105"
            >
              <CalendarDays className="w-4 h-4 text-[#0A6F34]" />
              Schedule Exam
            </Link>
            <Link
              href="/admin/evaluation"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white border border-white/25 text-xs sm:text-sm font-semibold transition-all"
            >
              <Cpu className="w-4 h-4 text-[#D9E739]" />
              AI Evaluation Desk
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex-1">
            <span className="kpi-label">Total Students</span>
            <p className="kpi-number mt-1">{stats.totalStudents}</p>
            <p className="text-[11px] text-[#ff5722] mt-1 font-medium">UG &amp; Pharmacy Batches</p>
          </div>
          <div className="kpi-icon-box bg-orange-50 text-[#ff5722]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex-1">
            <span className="kpi-label">Active Examinations</span>
            <p className="kpi-number mt-1">{stats.activeExams} / {stats.totalExams}</p>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">2-Hr Release Window Active</p>
          </div>
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex-1">
            <span className="kpi-label">Answer Booklets</span>
            <p className="kpi-number mt-1">{stats.totalAnswerSheets}</p>
            <p className="text-[11px] text-purple-600 mt-1 font-medium">{stats.evaluatedSheets} AI Evaluated</p>
          </div>
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex-1">
            <span className="kpi-label">Fees Reconciled</span>
            <p className="kpi-number mt-1">{formatCurrency(stats.totalFeeCollected)}</p>
            <p className="text-[11px] text-blue-600 mt-1 font-medium">QR Hall Tickets Enabled</p>
          </div>
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2-Hour Controlled Paper Release Engine & Active Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#0A6F34]/10 border border-[#0A6F34]/20 text-[#0A6F34]">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">2-Hour Controlled Paper Release Console</h2>
                <p className="text-xs text-slate-500">
                  Enforces automated and manual security release 120 minutes prior to exam commencement.
                </p>
              </div>
            </div>
            <Link
              href="/exams"
              className="text-xs font-bold text-[#0A6F34] hover:underline flex items-center gap-1"
            >
              All Exams <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingExams.map((exam) => {
              const isReleased = exam.releaseStatus === "RELEASED";
              return (
                <div
                  key={exam.id}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#0A6F34] bg-[#0A6F34]/10 px-2 py-0.5 rounded border border-[#0A6F34]/20">
                        {exam.examCode}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{exam.title}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isReleased
                            ? "bg-emerald-50 text-[#0A6F34] border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isReleased ? "PAPER RELEASED" : "2-HR LOCK ACTIVE"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>Subject: <strong className="text-slate-800">{exam.subject?.name || "General"}</strong></span>
                      <span>Total Marks: <strong className="text-slate-800">{exam.maxMarks}</strong></span>
                      <span>Scheduled: <strong className="text-slate-800">{formatDateTime(exam.startTime)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isReleased ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0A6F34] border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Print
                      </span>
                    ) : (
                      <button
                        onClick={() => handleManualPaperRelease(exam.id, exam.title)}
                        disabled={releasingId === exam.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A6F34] hover:bg-[#316421] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {releasingId === exam.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Releasing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Authorize 2-Hr Release</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-slate-900">Security Audit Log</h2>
            <Link href="/audit" className="text-xs font-bold text-[#0A6F34] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 font-mono text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatTime(log.createdAt)}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{log.entity}: {log.entityId?.slice(0, 14)}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
