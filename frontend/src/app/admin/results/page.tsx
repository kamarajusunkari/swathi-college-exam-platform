import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { PublishResultsButton } from "./PublishResultsButton";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let results: any[] = [];
  let exams: any[] = [];

  try {
    const [resultsData, examsData] = await Promise.all([
      serverFetch<{ results: any[] }>("/results").catch(() => ({ results: [] })),
      serverFetch<{ exams: any[] }>("/exams").catch(() => ({ exams: [] })),
    ]);
    results = resultsData.results || [];
    exams = examsData.exams || [];
  } catch (err) {
    console.error("Failed to load results data:", err);
  }

  const totalResults = results.length;
  const passedResults = results.filter((r) => r.resultStatus === "PASS").length;
  const publishedResults = results.filter((r) => r.isPublished).length;
  const passPercentage = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Examination Results & Moderation Board
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Final Grade Computation & Result Publication
            </h1>
            <p className="text-sm text-slate-500">
              Review subject-wise marks, verify grade point calculations, and publish official marks transcripts.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Computed Results</p>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{totalResults}</h3>
            <p className="text-xs text-slate-500 mt-1">Subject Mark Entries</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Institutional Pass Rate</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{passPercentage}%</h3>
            <p className="text-xs text-slate-500 mt-1">{passedResults} of {totalResults} Passed</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published to Students</p>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-2">{publishedResults}</h3>
            <p className="text-xs text-slate-500 mt-1">Live in Student Portals</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Moderation</p>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-2">{totalResults - publishedResults}</h3>
            <p className="text-xs text-slate-500 mt-1">Held for Final Review</p>
          </div>
        </div>

        {/* Section: Cohort Result Publication Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-indigo-600" />
            Batch Result Publication Controller
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Publish all verified results for an examination session to make them visible to students.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const examResults = results.filter((r) => r.examId === exam.id);
              const isAllPublished = examResults.length > 0 && examResults.every((r) => r.isPublished);

              return (
                <div key={exam.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {exam.examCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{exam.title}</h3>
                    <p className="text-xs text-slate-500">
                      Subject: {exam.subject.name} • AY {exam.academicYear.name}
                    </p>
                  </div>

                  <PublishResultsButton
                    examId={exam.id}
                    isPublished={isAllPublished}
                    hasResults={examResults.length > 0}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Result Records Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Verified Marks & Grading Registry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject-wise scores, grade point allocations (10-point UGC scale), and publication status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">Exam Session</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4">Grade Point</th>
                  <th className="py-3 px-4">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No results computed yet. Complete answer sheet evaluation first.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{r.student.user.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {r.student.rollNo} • {r.student.class.name}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{r.exam.subject.name}</p>
                        <p className="text-[10px] text-slate-400">{r.exam.subject.code}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-700">{r.exam.title}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {r.totalMarksObtained}
                        </span>
                        <span className="text-slate-400 text-xs"> / {r.maxMarksTotal}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold text-xs ${
                          r.grade === "O" || r.grade === "A+" || r.grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.grade === "B+" || r.grade === "B" || r.grade === "C"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {r.gpa?.toFixed(1) ?? "0.0"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {r.isPublished ? "PUBLISHED" : "HELD"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
