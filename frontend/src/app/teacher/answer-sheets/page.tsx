"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function TeacherAnswerSheetsPage() {
  const user = useAuthStore((state) => state.user);

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["teacher", "evaluation-bundles"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluation/bundles/all");
      return res.data?.bundles || [];
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4" />
              Physical Script Digitization
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Answer Booklet Bundles &amp; Scan Records
            </h1>
            <p className="text-sm text-slate-500">
              Track physical script bundles from examination halls to high-speed scanning stations.
            </p>
          </div>
        </div>

        {/* Bundles Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Scanned Booklet Bundles &amp; Barcode Verification
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs">Loading script bundles...</span>
            </div>
          ) : bundles.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No answer booklet bundles found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No physical script bundles have been digitized or uploaded for this examination session.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Bundle Code</th>
                    <th className="py-3 px-4">Subject &amp; Exam</th>
                    <th className="py-3 px-4">Booklet Count</th>
                    <th className="py-3 px-4">Scanning Center Operator</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bundles.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {b.bundleCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{b.exam?.subject?.name || "Exam Session"}</p>
                        <p className="text-[10px] text-slate-400">{b.exam?.title || "Semester End"}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {b.totalSheets} Booklets
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {b.uploadedBy?.name || "Scanning Center"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> {b.scanStatus || "VERIFIED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
