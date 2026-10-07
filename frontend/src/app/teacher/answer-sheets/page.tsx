import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileSpreadsheet,
  CheckCircle2,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherAnswerSheetsPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{ bundles: any[] }>("/evaluation/bundles/all", {
    fallback: { bundles: [] },
  });
  const bundles = res.bundles || [];

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
              Answer Booklet Bundles & Scan Records
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
              Scanned Booklet Bundles & Barcode Verification
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Bundle Code</th>
                  <th className="py-3 px-4">Subject & Exam</th>
                  <th className="py-3 px-4">Booklet Count</th>
                  <th className="py-3 px-4">Scanning Center Operator</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bundles.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {b.bundleCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{b.exam.subject.name}</p>
                      <p className="text-[10px] text-slate-400">{b.exam.title}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {b.totalSheets} Booklets
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {b.uploadedBy.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> {b.scanStatus}
                      </span>
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
