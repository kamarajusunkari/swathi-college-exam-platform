"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Plus,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ArrowRight,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useExams, useTogglePaperReleaseMutation } from "@/features/exams/exams.queries";

export default function ExamsPage() {
  const { data: rawExams, isLoading, refetch } = useExams();
  const toggleReleaseMutation = useTogglePaperReleaseMutation();
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const exams: any[] = Array.isArray(rawExams)
    ? rawExams
    : Array.isArray((rawExams as any)?.exams)
    ? (rawExams as any).exams
    : [];

  const handleReleasePaper = async (examId: string, examTitle: string) => {
    setReleasingId(examId);
    try {
      await toggleReleaseMutation.mutateAsync({
        examId,
        release: true,
      });
      toast.success(`Question Paper for "${examTitle}" Released!`, {
        description: "2-Hour security release window unlocked for authorized staff.",
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to trigger release.");
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-400 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            2-Hour Controlled Paper Release System
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Examination Engine &amp; Paper Release Console
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Controlled paper release window (120 minutes prior to exam commencement), question paper version management, and rubric definitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/exams/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Schedule Examination
          </Link>
        </div>
      </div>

      {/* 2-Hour Release Protocol Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Institutional Security Protocol — 2-Hour Release Window</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Examination question papers remain in encrypted <span className="font-semibold text-amber-400 font-mono">SCHEDULED</span> state until exactly 120 minutes prior to the scheduled start time. Super Admin &amp; Exam Controllers can trigger or adjust the release window. Students and non-evaluator staff cannot access question content prior to authorized release.
        </p>
      </div>

      {/* Examination List */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
          <p className="text-xs">Loading scheduled university examinations from database...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">No Examinations Scheduled</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No active examination schedules found in the database. Schedule an examination using the button above to initialize blueprints and paper vaults.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/exams/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Schedule New Examination
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {exams.map((exam) => {
            const isReleased = exam.paperStatus === "RELEASED" || exam.releaseStatus === "RELEASED";
            const papers = exam.papers || [];

            return (
              <div
                key={exam.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                        {exam.examCode || exam.subject?.code || "EXAM"}
                      </span>
                      <h2 className="text-lg font-bold text-white">{exam.title}</h2>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          isReleased
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {isReleased ? "RELEASED" : exam.status || "SCHEDULED"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span>
                        Subject: <strong className="text-slate-200">{exam.subject?.name || exam.title}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Program: <strong className="text-slate-200">{exam.class?.name || "All Cohorts"}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Date: <strong className="text-slate-200">{exam.examDate ? formatDate(exam.examDate) : "Scheduled Session"}</strong>
                      </span>
                      {exam.startTime && (
                        <>
                          <span>•</span>
                          <span>
                            Slot: <strong className="text-slate-200">{exam.startTime} - {exam.endTime}</strong>
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        Max Marks: <strong className="text-emerald-400">{exam.maxMarks || 100}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!isReleased ? (
                      <button
                        onClick={() => handleReleasePaper(exam.id, exam.title)}
                        disabled={releasingId === exam.id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {releasingId === exam.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Authorize Early Release</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Released to Hall Superintendents
                      </span>
                    )}
                  </div>
                </div>

                {/* Papers in this Exam */}
                <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>
                      {papers.length > 0
                        ? `${papers.length} Question Paper Blueprint(s) Cataloged`
                        : "No PDF Question Paper Uploaded Yet"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/exams`}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Open in Admin Console <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
