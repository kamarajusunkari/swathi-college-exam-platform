"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function AnswerSheetsPage() {
  const [uploading, setUploading] = useState(false);

  const [sheets, setSheets] = useState([
    {
      id: "sheet-1",
      sheetCode: "ANS-2026-8801",
      examCode: "EXAM-2026-MID-MTH",
      studentName: "Rahul Sharma",
      rollNo: "261001",
      totalPages: 4,
      isMapped: true,
      mappingConfidence: 0.98,
      evaluationStatus: "FINALIZED",
      aiScore: 48,
      finalScore: 94,
      grade: "A+",
    },
    {
      id: "sheet-2",
      sheetCode: "ANS-2026-8802",
      examCode: "EXAM-2026-MID-MTH",
      studentName: "Sneha Reddy",
      rollNo: "261002",
      totalPages: 4,
      isMapped: true,
      mappingConfidence: 0.95,
      evaluationStatus: "AI_EVALUATED",
      aiScore: 42,
      finalScore: 84,
      grade: "A",
    },
    {
      id: "sheet-3",
      sheetCode: "ANS-2026-8803",
      examCode: "EXAM-2026-MID-MTH",
      studentName: "Vikram Varma",
      rollNo: "261003",
      totalPages: 4,
      isMapped: true,
      mappingConfidence: 0.92,
      evaluationStatus: "PENDING",
      aiScore: null,
      finalScore: null,
      grade: null,
    },
  ]);

  const handleSimulateBatchUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success("Scanned Booklet Bundle Ingested Successfully!", {
        description: "3 answer booklets scanned, OCR barcodes detected & mapped to enrolled students.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Digitization & OCR Mapping Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Offline Answer Sheet Scanning & Student Mapping
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Ingest physical scanned answer sheets, automatically extract student roll numbers from barcodes/QR, map to enrolled rosters, and dispatch to AI Evaluation desk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateBatchUpload}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Ingesting & Running OCR..." : "Upload Scanned Booklet Batch"}
          </button>
        </div>
      </div>

      {/* Batch Ingestion Drag & Drop Zone */}
      <div
        onClick={handleSimulateBatchUpload}
        className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl bg-slate-900/40 p-8 text-center cursor-pointer transition-all hover:bg-slate-900/60 group space-y-3"
      >
        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            Drag and Drop High-Resolution Scanned Answer Sheet Bundles (PDF / ZIP)
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
            <h2 className="text-base font-bold text-white">Scanned Booklet & Mapping Register</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Exam: EXAM-2026-MID-MTH</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="pb-3 px-3">Booklet Barcode</th>
                <th className="pb-3 px-3">Mapped Student</th>
                <th className="pb-3 px-3">Roll No</th>
                <th className="pb-3 px-3">OCR Confidence</th>
                <th className="pb-3 px-3">Total Pages</th>
                <th className="pb-3 px-3">Evaluation Status</th>
                <th className="pb-3 px-3">Score & Grade</th>
                <th className="pb-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sheets.map((sheet) => (
                <tr key={sheet.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">
                    {sheet.sheetCode}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {sheet.studentName}
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                    {sheet.rollNo}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-400 font-semibold">
                      {(sheet.mappingConfidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">{sheet.totalPages} Pages</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        sheet.evaluationStatus === "FINALIZED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : sheet.evaluationStatus === "AI_EVALUATED"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {sheet.evaluationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold">
                    {sheet.finalScore !== null ? (
                      <span className="text-emerald-400">
                        {sheet.finalScore}% ({sheet.grade})
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/evaluation`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Open in Evaluation Desk
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
