"use client";

import React from "react";
import Link from "next/link";
import {
  Cpu,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  PenTool,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Search,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { checkUserTimeAccess } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

interface EvaluatorDashboardProps {
  user: SessionUser | null;
  pendingAnswerSheets: any[];
  evaluatedSheetsCount: number;
}

export function EvaluatorDashboard({
  user,
  pendingAnswerSheets,
  evaluatedSheetsCount,
}: EvaluatorDashboardProps) {
  const timeAccess = checkUserTimeAccess(user);

  return (
    <div className="space-y-6">
      {/* Time-Window Notification Banner */}
      {user?.isTimeRestricted && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            timeAccess.isAllowed
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                timeAccess.isAllowed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs">
                {timeAccess.isAllowed ? "Authorized Evaluation Window Active" : "Scheduled Access Restriction"}
              </p>
              <p className="text-[11px] opacity-85">
                {timeAccess.message} • Operational Slot: {user.dailyStartTime || "08:00"} to {user.dailyEndTime || "20:00"} IST
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              timeAccess.isAllowed
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            {timeAccess.isAllowed ? "● Evaluation Desk Open" : "● Window Closed"}
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0f766e] p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-bold backdrop-blur-xs">
              <Cpu className="w-4 h-4 text-emerald-300" />
              Central Answer Sheet Evaluation &amp; Moderation Authority
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Welcome, {user?.name || "Dr. Sunita Deshmukh"}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl font-normal">
              Review scanned student answer booklets, verify Gemini Vision AI scoring, override marks with rubric notes, and finalize batch evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/evaluation"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/20 transition-all hover:scale-105"
            >
              <Cpu className="w-4 h-4 text-emerald-700" />
              Launch AI Evaluation Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{pendingAnswerSheets.length + evaluatedSheetsCount || 2}</p>
            <p className="kpi-label">Total Assigned Booklets</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{pendingAnswerSheets.length || 1}</p>
            <p className="kpi-label">Pending Verification</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{evaluatedSheetsCount || 1}</p>
            <p className="kpi-label">Finalized &amp; Moderated</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">98.4%</p>
            <p className="kpi-label">AI OCR Alignment Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evaluation Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="data-container p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  Answer Booklets Evaluation Queue
                </h2>
                <p className="page-header-subtitle">
                  Click on any student booklet to open the dual-pane OCR inspection and marking desk.
                </p>
              </div>

              <Link
                href="/admin/evaluation"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
              >
                Open Full Desk <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingAnswerSheets.length > 0 ? (
                pendingAnswerSheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sheet.sheetCode}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {sheet.student?.user?.name || "Student Booklet"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Exam: <strong className="text-slate-800">{sheet.exam?.title || "Pharmaceutics-I Regular"}</strong> • Roll: <strong className="text-slate-800">{sheet.student?.rollNo || "26BPH001"}</strong> • Pages: {sheet.totalPages || 4}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">AI Suggestion</span>
                        <strong className="text-xs text-emerald-700 font-bold">{sheet.aiTotalScore || 24} / 25 Marks</strong>
                      </div>

                      <Link
                        href="/admin/evaluation"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all hover:scale-105"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Verify &amp; Grade
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">All pending answer booklets evaluated!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">New scanned bundles will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Moderation Standards */}
        <div className="space-y-6">
          <div className="data-container p-5 space-y-4">
            <h2 className="section-title flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Evaluation Moderation Protocols
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensure fair and transparent scoring following the standardized moderation guidelines:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                <p className="font-bold text-emerald-900">1. Verification of AI Marks</p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Always inspect the scanned manuscript page alongside the Gemini OCR interpretation before confirming marks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-1">
                <p className="font-bold text-blue-900">2. Fractional Step Marking</p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Award partial marks for formulas, method correctness, and unit conversions even if final arithmetic differs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/60 space-y-1">
                <p className="font-bold text-purple-900">3. Immutable Audit Trails</p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Every override and finalized score is cryptographically signed and stored in institutional audit records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
