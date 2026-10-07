import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Award,
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherResultsPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{ results: any[] }>("/results", {
    fallback: { results: [] },
  });
  const results = res.results || [];

  const totalEvaluated = results.length;
  const passed = results.filter((r) => r.resultStatus === "PASS").length;
  const passRate = totalEvaluated > 0 ? Math.round((passed / totalEvaluated) * 100) : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Faculty Marks Verification
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Class Performance & Subject Grade Distribution
            </h1>
            <p className="text-sm text-slate-500">
              Review evaluated student scores, grade boundaries, and statistical pass metrics.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluated Records</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalEvaluated}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Subject Mark Entries</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Pass Rate</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{passRate}%</h3>
              <p className="text-xs text-slate-500 mt-0.5">{passed} Passed Candidates</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grade Scale</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-0.5">O, A+, A, B</h3>
              <p className="text-xs text-slate-500 mt-0.5">UGC 10-Point System</p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Evaluated Student Grade Sheets
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Candidate & Roll</th>
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">Exam Session</th>
                  <th className="py-3 px-4">Marks Awarded</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{r.student.user.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">{r.student.rollNo}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{r.exam.subject.name}</p>
                      <p className="text-[10px] text-slate-400">{r.exam.subject.code}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{r.exam.title}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {r.totalMarksObtained} <span className="text-slate-400 text-xs font-normal">/ {r.maxMarksTotal}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {r.gpa?.toFixed(1) ?? "0.0"}
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
