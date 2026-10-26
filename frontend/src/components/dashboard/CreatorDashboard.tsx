"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers,
  HelpCircle,
  Send,
  Eye,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { checkUserTimeAccess } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useSubmitPaperMutation } from "@/features/exams/exams.queries";

interface CreatorDashboardProps {
  user: SessionUser | null;
  exams: any[];
  papers: any[];
}

export function CreatorDashboard({ user, exams, papers }: CreatorDashboardProps) {
  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || "");

  const timeAccess = checkUserTimeAccess(user);

  const draftPapersCount = papers.filter((p) => p.status === "DRAFT").length;
  const submittedPapersCount = papers.filter((p) => p.status === "SUBMITTED").length;
  const approvedPapersCount = papers.filter((p) => p.status === "APPROVED" || p.status === "RELEASED").length;

  const [submittingPaperId, setSubmittingPaperId] = useState<string | null>(null);
  const submitPaperMutation = useSubmitPaperMutation();

  const handleQuickSubmit = async (paperId: string, paperTitle: string) => {
    setSubmittingPaperId(paperId);
    try {
      const data = await submitPaperMutation.mutateAsync(paperId);
      toast.success(data?.message || `Submitted "${paperTitle}" for Exam Controller review & sign-off.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit paper");
    } finally {
      setSubmittingPaperId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time-Window Notification Banner */}
      {user?.isTimeRestricted && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            timeAccess.isAllowed
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                timeAccess.isAllowed ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs">
                {timeAccess.isAllowed ? "Authorized Paper Creation Window Active" : "Scheduled Access Restriction"}
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
            {timeAccess.isAllowed ? "● Gate Open" : "● Window Closed"}
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#44403c] p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold backdrop-blur-xs">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              Question Paper Formulation &amp; Rubrics Authority
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Welcome, {user?.name || "Paper Creator"}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl font-normal">
              You are authorized by Super Administration to formulate question papers, model answers, and AI-assisted grading rubrics for university examinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/exams/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              Draft New Exam Paper
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-stone-100 text-stone-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{papers.length}</p>
            <p className="kpi-label">Papers in System</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{draftPapersCount}</p>
            <p className="kpi-label">Drafting In Progress</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{submittedPapersCount}</p>
            <p className="kpi-label">Awaiting Controller Sign-off</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{approvedPapersCount}</p>
            <p className="kpi-label">Approved &amp; Scheduled</p>
          </div>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Papers Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="data-container p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                  Assigned Question Papers Workspace
                </h2>
                <p className="page-header-subtitle">
                  Formulate question items, step rubrics, and model answers for upcoming examinations.
                </p>
              </div>

              <span className="badge-amber font-bold">
                Active Cycle 2026-2027
              </span>
            </div>

            <div className="space-y-3">
              {papers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-1">
                  <FileSpreadsheet className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">No Question Papers Assigned</p>
                  <p className="text-[11px] text-slate-500">
                    Draft a new examination paper using the button above to begin formulating questions.
                  </p>
                </div>
              ) : (
                papers.map((paper: any, idx: number) => (
                  <div
                    key={paper.id || idx}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-amber-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                            {paper.exam?.examCode || "EXAM"}
                          </span>
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {paper.title || "Question Paper"}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {paper.exam?.title || "Examination"} • Version v{paper.version || 1}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={
                            paper.status === "RELEASED" || paper.status === "APPROVED"
                              ? "badge-emerald"
                              : paper.status === "SUBMITTED"
                              ? "badge-blue"
                              : "badge-amber"
                          }
                        >
                          {paper.status || "DRAFT"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Questions Formulated</span>
                        <strong className="text-slate-800">{paper.questions?.length ?? 0} Items</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">AI Rubric Guide</span>
                        <strong className="text-emerald-700">Configured &amp; Verified</strong>
                      </div>
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleQuickSubmit(paper.id, paper.title)}
                        disabled={submittingPaperId === paper.id || paper.status !== "DRAFT"}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          paper.status === "DRAFT"
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {submittingPaperId === paper.id
                          ? "Submitting..."
                          : paper.status === "DRAFT"
                          ? "Submit for Approval"
                          : paper.status || "Submitted"}
                      </button>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>

        {/* Right Col: Formulation Guidelines & Rubric Standard */}
        <div className="space-y-6">
          <div className="data-container p-5 space-y-4">
            <h2 className="section-title flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              AI Rubric Standard Best Practices
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              When creating question items, follow standard guidelines to enable instant AI Vision evaluation for examiners:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  1. Explicit Step Breakdown
                </p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Assign specific fractional marks to formulas, chemical equations, stoichiometric ratios, and final units.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/60 space-y-1">
                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  2. Synonymous Keyword Anchors
                </p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Include pharmacopoeial terminology (e.g. IP / BP / USP definitions) in the rubric guide.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-1">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  3. Model Derivations
                </p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Provide complete derivation steps so AI can perform OCR comparison against student booklets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
