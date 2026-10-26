"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PenTool,
  Save,
  FileCheck2,
  Eye,
  Sliders,
  Award,
  Layers,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { getEvaluationQueue } from "@/lib/api/services.api";

export default function EvaluationDeskPage() {
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});

  // 1. Fetch Queue of Answer Sheets
  const {
    data: queueData,
    isLoading: queueLoading,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ["evaluation", "queue"],
    queryFn: async () => {
      const data = await getEvaluationQueue();
      return Array.isArray(data) ? data : data?.answerSheets || [];
    },
    staleTime: 30 * 1000,
  });

  const sheets: any[] = queueData || [];

  // Automatically select the first sheet if none selected
  useEffect(() => {
    if (!selectedSheetId && sheets.length > 0) {
      setSelectedSheetId(sheets[0].id);
    }
  }, [selectedSheetId, sheets]);

  // 2. Fetch Active Sheet Details
  const {
    data: activeSheetData,
    isLoading: sheetLoading,
    refetch: refetchSheet,
  } = useQuery({
    queryKey: ["evaluation", "sheet", selectedSheetId],
    queryFn: async () => {
      if (!selectedSheetId) return null;
      const res = await apiClient.get(`/evaluation/${selectedSheetId}`);
      return res.data?.sheet || null;
    },
    enabled: !!selectedSheetId,
    staleTime: 30 * 1000,
  });

  const sheet = activeSheetData;
  const questions: any[] =
    sheet?.exam?.papers?.[0]?.questions ||
    sheet?.questionEvaluations ||
    [];

  // Sync scores from sheet when loaded
  useEffect(() => {
    if (sheet) {
      const initialScores: Record<number, number> = {};
      const initialComments: Record<number, string> = {};

      if (Array.isArray(sheet.questionEvaluations)) {
        sheet.questionEvaluations.forEach((qe: any) => {
          initialScores[qe.questionNumber] = qe.teacherMarks ?? qe.aiSuggestedMarks ?? 0;
          initialComments[qe.questionNumber] = qe.teacherComment || qe.aiFeedback || "";
        });
      } else if (Array.isArray(questions)) {
        questions.forEach((q: any) => {
          const qNum = q.questionNumber || q.number || 1;
          initialScores[qNum] = q.teacherMarks ?? q.aiSuggestedMarks ?? 0;
          initialComments[qNum] = q.teacherComment || q.aiFeedback || "";
        });
      }

      setScores(initialScores);
      setComments(initialComments);
    }
  }, [sheet]);

  const handleUpdateMarks = (qNum: number, val: number) => {
    setScores((prev) => ({ ...prev, [qNum]: val }));
  };

  const handleUpdateComment = (qNum: number, text: string) => {
    setComments((prev) => ({ ...prev, [qNum]: text }));
  };

  const handleFinalizeEvaluation = async () => {
    if (!sheet) return;
    setSaving(true);
    try {
      const questionEvaluations = Object.entries(scores).map(([qNum, marks]) => ({
        questionNumber: Number(qNum),
        teacherMarks: Number(marks),
        teacherComment: comments[Number(qNum)] || "",
        isVerified: true,
      }));

      await apiClient.post("/evaluation/submit", {
        answerSheetId: sheet.id,
        questionEvaluations,
        notes: "Evaluated & approved via Central AI Evaluation Terminal.",
      });

      toast.success("Evaluation finalized & saved to PostgreSQL database!");
      refetchSheet();
      refetchQueue();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to finalize evaluation.");
    } finally {
      setSaving(false);
    }
  };

  if (queueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
          <p className="text-xs text-slate-400">Loading Central Evaluation Queue...</p>
        </div>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Evaluation Queue Cleared</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            All scanned student answer booklets have been evaluated and verified. Ingest new bundles from the Scanning Desk to populate scripts.
          </p>
          <div className="pt-2">
            <Link
              href="/answer-sheets"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              Go to Script Ingestion Desk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pages = sheet?.pages || [];
  const activePageObj = pages.find((p: any) => p.pageNumber === activePage) || pages[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Top Bar with Candidate Selector & Metadata */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Booklet: {sheet?.sheetCode || sheet?.id?.slice(0, 10)}
              </span>
              <h1 className="text-base font-bold text-white">
                {sheet?.student?.user?.name || "Student Candidate"}
              </h1>
              <span className="text-xs text-slate-400 font-mono font-bold">
                (Roll: {sheet?.student?.rollNo || "N/A"})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Exam: <strong className="text-slate-200">{sheet?.exam?.title || "Examination"}</strong> • Subject:{" "}
              <strong className="text-emerald-400">
                {sheet?.exam?.subject?.name || sheet?.exam?.subject?.code || "Subject"}
              </strong>
            </p>
          </div>
        </div>

        {/* Script Selection Dropdown & Finalize */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSheetId || ""}
            onChange={(e) => setSelectedSheetId(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden font-mono"
          >
            {sheets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sheetCode || s.id.slice(0, 10)} - {s.student?.user?.name || "Candidate"}
              </option>
            ))}
          </select>

          <button
            onClick={handleFinalizeEvaluation}
            disabled={saving || sheetLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Finalizing..." : "Submit & Save Marks"}</span>
          </button>
        </div>
      </div>

      {sheetLoading ? (
        <div className="p-20 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
          <p className="text-xs">Loading script pages &amp; question rubrics...</p>
        </div>
      ) : (
        /* Dual-Pane Evaluation Desk */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane (7 cols): Scanned Manuscript Viewer */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scanned Answer Booklet
                </span>
              </div>

              {/* Page Controls & Zoom */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl text-xs font-mono">
                  <button
                    onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                    disabled={activePage <= 1}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span>
                    {activePage} / {Math.max(1, pages.length)}
                  </span>
                  <button
                    onClick={() => setActivePage((prev) => Math.min(pages.length, prev + 1))}
                    disabled={activePage >= pages.length}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl text-xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Render Area */}
            <div className="w-full bg-slate-950 rounded-2xl border border-slate-800/80 p-4 min-h-[500px] flex items-center justify-center overflow-auto">
              {activePageObj?.imageUrl ? (
                <img
                  src={activePageObj.imageUrl}
                  alt={`Page ${activePage}`}
                  style={{ width: `${zoomLevel}%` }}
                  className="rounded-lg shadow-2xl transition-all"
                />
              ) : (
                <div className="text-center p-8 space-y-2 text-slate-500">
                  <FileCheck2 className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
                  <p className="text-xs font-medium text-slate-400">
                    No physical scan image attached to page {activePage}.
                  </p>
                  {activePageObj?.ocrRawText && (
                    <div className="mt-4 p-3 bg-slate-900 rounded-xl text-left font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                      {activePageObj.ocrRawText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane (5 cols): AI Rubrics & Question Scoring Desk */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubric &amp; Marks Entry
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {questions.length} Items Configured
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-2xl">
                <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-300">No question blueprint items found.</p>
                <p className="text-[11px] text-slate-500">
                  Total marks will be recorded directly from examiner summary.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const qNum = q.questionNumber || q.number || idx + 1;
                  const maxScore = q.maxScore || q.maxMarks || 10;
                  const currentScore = scores[qNum] ?? 0;
                  const currentComment = comments[qNum] || "";

                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                          Q{qNum}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-400">Awarded Marks:</label>
                          <input
                            type="number"
                            min="0"
                            max={maxScore}
                            value={currentScore}
                            onChange={(e) => handleUpdateMarks(qNum, Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-center font-bold text-white text-xs"
                          />
                          <span className="text-xs text-slate-500 font-mono">/ {maxScore}</span>
                        </div>
                      </div>

                      {q.questionText && (
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          {q.questionText}
                        </p>
                      )}

                      {q.rubricGuide && (
                        <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 text-[11px] text-purple-300 space-y-1">
                          <strong className="block text-purple-400 text-[10px] uppercase font-bold">
                            Model Rubric:
                          </strong>
                          <p>{q.rubricGuide}</p>
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          placeholder="Examiner comments / step marks rationale..."
                          value={currentComment}
                          onChange={(e) => handleUpdateComment(qNum, e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
