"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  Cpu,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  FileCheck2,
  PenTool,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { getEvaluationQueue } from "@/lib/api/services.api";

export default function AnswerSheetsPage() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query for live answer sheets from evaluation queue
  const {
    data: sheetsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["answer-sheets", "queue"],
    queryFn: async () => {
      const data = await getEvaluationQueue();
      return Array.isArray(data) ? data : data?.answerSheets || [];
    },
    staleTime: 30 * 1000,
  });

  const sheets: any[] = sheetsData || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const res = await apiClient.post("/evaluation/bundles", {
        totalSheets: files.length,
        scanStatus: "COMPLETED",
      });
      toast.success(
        res.data?.message || `Ingested bundle of ${files.length} scripts into database successfully!`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to ingest booklet batch");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.zip"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Digitization &amp; OCR Mapping Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Offline Answer Sheet Scanning &amp; Student Mapping
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Ingest physical scanned answer sheets, automatically extract student roll numbers from barcodes/QR, map to enrolled rosters, and dispatch to AI Evaluation desk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Ingesting & Cataloging..." : "Upload Scanned Booklet Batch"}
          </button>
        </div>
      </div>

      {/* Batch Ingestion Drag & Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl bg-slate-900/40 p-8 text-center cursor-pointer transition-all hover:bg-slate-900/60 group space-y-3"
      >
        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            Click or Drag High-Resolution Scanned Answer Sheet Bundles (PDF / ZIP)
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports multi-page ADF scanner uploads with auto-split and barcode student mapping.
          </p>
        </div>
        <span className="inline-block text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          OCR Barcode Extraction Active
        </span>
      </div>

      {/* Ingested Answer Sheets Register */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Scanned Booklet &amp; Mapping Register</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sheets.length} Answer Sheets In Queue
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
            <p className="text-xs">Loading scanned answer sheets from database...</p>
          </div>
        ) : sheets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl">
            <FileSpreadsheet className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No answer sheets in queue.</p>
            <p className="text-xs text-slate-500">
              Upload scanned scripts using the button above to begin barcode OCR mapping and evaluation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Booklet Barcode</th>
                  <th className="pb-3 px-3">Mapped Student</th>
                  <th className="pb-3 px-3">Roll No</th>
                  <th className="pb-3 px-3">Exam / Subject</th>
                  <th className="pb-3 px-3">Total Pages</th>
                  <th className="pb-3 px-3">Evaluation Status</th>
                  <th className="pb-3 px-3">Score</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sheets.map((sheet) => {
                  const studentName = sheet.student?.user?.name || "Student Booklet";
                  const rollNo = sheet.student?.rollNo || "Unmapped";
                  const examTitle = sheet.exam?.title || sheet.exam?.subject?.name || "Exam";
                  const isDone =
                    sheet.evaluationStatus === "FINALIZED" || sheet.evaluationStatus === "AI_EVALUATED";

                  return (
                    <tr key={sheet.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-400">
                        {sheet.sheetCode || sheet.id.slice(0, 12)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {studentName}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                        {rollNo}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {examTitle}
                      </td>
                      <td className="py-3 px-3">{sheet.totalPages || sheet.pages?.length || 1} Pages</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            isDone
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {sheet.evaluationStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">
                        {sheet.finalScore !== null && sheet.finalScore !== undefined ? (
                          <span className="text-emerald-400">
                            {sheet.finalScore} Marks
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/teacher/evaluation/${sheet.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          Evaluate Desk
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
  );
}
