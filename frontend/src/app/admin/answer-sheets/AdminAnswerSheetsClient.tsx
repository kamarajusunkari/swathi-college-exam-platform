"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  QrCode,
  Layers,
  Eye,
  UploadCloud,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";
import UploadZone from "@/components/evaluation/UploadZone";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

interface Props {
  bundles: any[];
  answerSheets: any[];
}

export function AdminAnswerSheetsClient({ bundles, answerSheets }: Props) {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bundleList, setBundleList] = useState(bundles);
  const [sheetList, setSheetList] = useState(answerSheets);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    try {
      const res = await apiClient.post("/evaluation/bundles", {
        totalSheets: files.length || 1,
        scanStatus: "COMPLETED",
      });
      const data = res.data;

      setBundleList((prev) => [data.bundle, ...prev]);
      setShowUploadModal(false);
      toast.success(`Bundle ${data.bundle.bundleCode} saved in database with ${files.length} scripts.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to catalog bundle");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            Physical Answer Booklets & Digitization
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Answer Sheet Bundle Ingestion & Barcode Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Track physical booklet bundles scanned at high-speed centers and cataloged for digital evaluation.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Ingest New Bundle / Camera Scan
        </button>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundleList.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                {b.bundleCode}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> {b.scanStatus}
                </span>
                <button
                  onClick={() =>
                    setDeleteTarget({
                      type: "bundle",
                      id: b.id,
                      name: `Bundle ${b.bundleCode}`,
                      url: `/api/evaluation/bundles/${b.id}`,
                    })
                  }
                  title={`Delete ${b.bundleCode}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{b.exam.subject.name}</h3>
              <p className="text-xs text-slate-500">{b.exam.title}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Booklets Scanned</span>
              <span className="font-mono font-semibold text-slate-900">{b.totalSheets} Booklets</span>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Scripts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-teal-600" />
            Cataloged Candidate Scripts ({sheetList.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Auto-Deskew &amp; Barcode Verified</span>
        </div>

        {sheetList.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Answer Booklets Ingested Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Ingest New Bundle / Camera Scan&quot; to upload physical answer booklets for evaluation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Barcode / Script ID</th>
                  <th className="p-3.5">Student Roll No</th>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Class / Subject</th>
                  <th className="p-3.5">Evaluation Status</th>
                  <th className="p-3.5 text-right">Score</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sheetList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-semibold text-teal-700">
                      {s.sheetCode || `SCR-${s.id.slice(0, 6)}`}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800">{s.student?.rollNo || s.sheetCode || "—"}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{s.student?.user?.name || "Unassigned"}</td>
                    <td className="p-3.5 text-slate-600">
                      <div>{s.exam?.subject?.name || "Examination Subject"}</div>
                      <div className="text-[10px] text-slate-400">{s.student?.class?.name || "Cohort"}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {s.evaluationStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-900">
                      {s.finalScore !== null && s.finalScore !== undefined ? `${s.finalScore} / ${s.exam?.maxMarks || 100} M` : "Pending"}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: "sheet",
                            id: s.id,
                            name: `Answer Booklet ${s.sheetCode || s.id.slice(0, 8)}`,
                            url: `/api/evaluation/${s.id}`,
                          })
                        }
                        title={`Delete booklet ${s.sheetCode || s.id}`}
                        className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ingest Answer Sheet Scans & Barcode Bundles
                </h3>
                <p className="text-xs text-slate-500">
                  Upload PDF batches, ZIP archives, or use your camera to scan page-by-page
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <UploadZone onFilesSelected={handleFilesSelected} isBulk={true} />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          if (deleteTarget?.type === "bundle") {
            setBundleList((prev) => prev.filter((b) => b.id !== deleteTarget.id));
          } else {
            setSheetList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
          }
          router.refresh();
        }}
        title={`Delete ${deleteTarget?.type === "bundle" ? "Answer Sheet Bundle" : "Candidate Answer Booklet"}`}
        description={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        itemIdentifier={deleteTarget?.name || ""}
        deleteUrl={deleteTarget?.url || ""}
      />
    </div>
  );
}
