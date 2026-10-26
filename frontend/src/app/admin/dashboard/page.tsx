"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getDashboardStats } from "@/lib/api/services.api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  CalendarDays,
  Sparkles,
  ArrowRight,
  Users,
  Building,
  GraduationCap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);

  // TanStack React Query for live server-calculated dashboard statistics (no client calculations)
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res?.stats || {};
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const totalStudents = data?.totalStudents ?? 0;
  const totalTeachers = data?.totalTeachers ?? 0;
  const totalClasses = data?.totalClasses ?? 0;
  const totalExams = data?.totalExams ?? 0;
  const activeExams = data?.activeExams ?? 0;
  const totalAnswerSheets = data?.totalAnswerSheets ?? 0;
  const evaluatedSheets = data?.evaluatedSheets ?? 0;
  const totalFeeCollected = data?.totalFeeCollected ?? 0;
  const upcomingExams: any[] = data?.upcomingExams ?? [];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Top Control Bar with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header-title">
              Executive Examination Console
            </h1>
            <p className="page-header-subtitle">
              Live operational overview for Swathi College of Pharmacy examination lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/exams"
              className="btn-primary"
            >
              <CalendarDays className="w-4 h-4" />
              Schedule Exam
            </Link>

            <Link
              href="/admin/evaluation"
              className="btn-outline"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Evaluation Desk
            </Link>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card">
            <div className="kpi-icon-box bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-7 w-16 bg-slate-100 animate-pulse rounded my-1" />
              ) : (
                <p className="kpi-number">{totalStudents}</p>
              )}
              <p className="kpi-label">Enrolled Students</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-7 w-16 bg-slate-100 animate-pulse rounded my-1" />
              ) : (
                <p className="kpi-number">{totalTeachers}</p>
              )}
              <p className="kpi-label">Pharmacy Faculty</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-purple-50 text-purple-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-7 w-16 bg-slate-100 animate-pulse rounded my-1" />
              ) : (
                <p className="kpi-number">{totalClasses}</p>
              )}
              <p className="kpi-label">Academic Programs</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-7 w-24 bg-slate-100 animate-pulse rounded my-1" />
              ) : (
                <p className="kpi-number">{formatCurrency(totalFeeCollected)}</p>
              )}
              <p className="kpi-label">Fee Reconciled</p>
            </div>
          </div>
        </div>

        {/* Live Examination Engine Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active 2-Hour Release Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="badge-orange">
                  2-HOUR RELEASE ENGINE
                </span>
                <span className="badge-emerald">
                  <CheckCircle2 className="w-3 h-3" />
                  Cryptographically Active
                </span>
              </div>

              <h2 className="section-title text-base sm:text-lg">
                Controlled Examination Paper Release Workflow
              </h2>
              <p className="text-body">
                Automated lock window releases encrypted question papers to authorized superintendents exactly 120 minutes prior to exam commencement.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Clock className="w-4 h-4 text-[#ff5722]" />
                <span>{isLoading ? "..." : activeExams} Active Papers Released</span>
              </div>

              <Link
                href="/admin/exams"
                className="btn-secondary btn-sm"
              >
                Manage Releases <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* AI Evaluation Queue Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-blue">
                  AI OCR Processing Desk
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {isLoading ? "..." : `${evaluatedSheets}/${totalAnswerSheets} Evaluated`}
                </span>
              </div>

              <h3 className="section-title">
                Answer Booklet OCR & Rubric Scoring
              </h3>
              <p className="text-body">
                Double-blind OCR transcription matching student step derivations against verified faculty rubrics.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                {isLoading ? "..." : `${Math.max(0, totalAnswerSheets - evaluatedSheets)} Sheets in Queue`}
              </span>

              <Link
                href="/admin/evaluation"
                className="text-xs font-medium text-[#ff5722] hover:text-[#f4511e] flex items-center gap-1 transition-colors"
              >
                Open Desk <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scheduled Examinations Table */}
        <div className="data-container">
          <div className="data-header">
            <div>
              <h2 className="section-title">
                Scheduled Pharmacy Examinations
              </h2>
              <p className="page-header-subtitle">
                Upcoming board and semester final papers in current session.
              </p>
            </div>

            <Link
              href="/admin/exams"
              className="text-xs font-medium text-[#ff5722] hover:underline flex items-center gap-1"
            >
              View All Exams ({isLoading ? "..." : totalExams}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-th">EXAM CODE & TITLE</th>
                  <th className="table-th">PROGRAM & SUBJECT</th>
                  <th className="table-th">DATE & TIMING</th>
                  <th className="table-th">RELEASE STATUS</th>
                  <th className="table-th text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#ff5722]" />
                        <span>Loading examinations...</span>
                      </div>
                    </td>
                  </tr>
                ) : upcomingExams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No examinations scheduled.
                    </td>
                  </tr>
                ) : (
                  upcomingExams.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-td">
                        <p className="font-medium text-slate-900 text-xs sm:text-sm">{ex.title}</p>
                        <p className="text-[11px] font-mono text-[#ff5722] font-medium mt-0.5">
                          {ex.examCode}
                        </p>
                      </td>
                      <td className="table-td">
                        <p className="font-medium text-slate-800">{ex.subject?.name || "N/A"}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{ex.class?.name || "All Batches"}</p>
                      </td>
                      <td className="table-td">
                        <p className="font-medium text-slate-800">
                          {formatDate(ex.examDate)}
                        </p>
                        <p className="text-[11px] text-slate-400 font-normal">
                          {ex.startTime} - {ex.endTime} ({ex.durationMinutes} mins)
                        </p>
                      </td>
                      <td className="table-td">
                        <span
                          className={
                            ex.releaseStatus === "RELEASED"
                              ? "badge-emerald"
                              : "badge-amber"
                          }
                        >
                          {ex.releaseStatus}
                        </span>
                      </td>
                      <td className="table-td text-right">
                        <Link
                          href="/admin/exams"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-[#ff5722] transition-colors"
                        >
                          Manage <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
