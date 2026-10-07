import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  let totalStudents = 0;
  let totalTeachers = 0;
  let totalClasses = 0;
  let totalExams = 0;
  let activeExams = 0;
  let totalAnswerSheets = 0;
  let evaluatedSheets = 0;
  let totalFeeCollected = 0;
  let upcomingExams: any[] = [];

  try {
    const [usersData, academicData, examsData, evalData, feesData] = await Promise.all([
      serverFetch<{ users: any[] }>("/users").catch(() => ({ users: [] })),
      serverFetch<{ classes: any[] }>("/academic").catch(() => ({ classes: [] })),
      serverFetch<{ exams: any[] }>("/exams").catch(() => ({ exams: [] })),
      serverFetch<{ answerSheets: any[] }>("/evaluation/queue").catch(() => ({ answerSheets: [] })),
      serverFetch<{ fees: any[] }>("/fees").catch(() => ({ fees: [] })),
    ]);

    const usersList = usersData.users || [];
    totalStudents = usersList.filter((u) => u.role === "STUDENT").length;
    totalTeachers = usersList.filter((u) => u.role === "TEACHER").length;
    totalClasses = (academicData.classes || []).length;

    const examsList = examsData.exams || [];
    totalExams = examsList.length;
    activeExams = examsList.filter((e) => e.releaseStatus === "RELEASED").length;
    upcomingExams = examsList.slice(0, 4);

    const sheetsList = evalData.answerSheets || [];
    totalAnswerSheets = sheetsList.length;
    evaluatedSheets = sheetsList.filter((s) => s.evaluationStatus === "FINALIZED").length;

    const feesList = feesData.fees || [];
    totalFeeCollected = feesList
      .filter((f) => f.status === "PAID")
      .reduce((acc, f) => acc + (f.amount || 0), 0);
  } catch (err) {
    console.error("Dashboard data load error:", err);
  }

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
              <p className="kpi-number">{totalStudents}</p>
              <p className="kpi-label">Enrolled Students</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{totalTeachers}</p>
              <p className="kpi-label">Pharmacy Faculty</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-purple-50 text-purple-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{totalClasses}</p>
              <p className="kpi-label">Academic Programs</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{formatCurrency(totalFeeCollected)}</p>
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
                <span>{activeExams} Active Papers Released</span>
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
                  {evaluatedSheets}/{totalAnswerSheets} Evaluated
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
                {totalAnswerSheets - evaluatedSheets} Sheets in Queue
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
              View All Exams ({totalExams}) <ArrowRight className="w-3.5 h-3.5" />
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
                {upcomingExams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <p className="font-medium text-slate-900 text-xs sm:text-sm">{ex.title}</p>
                      <p className="text-[11px] font-mono text-[#ff5722] font-medium mt-0.5">
                        {ex.examCode}
                      </p>
                    </td>
                    <td className="table-td">
                      <p className="font-medium text-slate-800">{ex.subject.name}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{ex.class.name}</p>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
