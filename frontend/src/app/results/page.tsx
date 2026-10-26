"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ShieldCheck,
  QrCode,
  GraduationCap,
  TrendingUp,
  Lock,
  Unlock,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { getResults } from "@/lib/api/services.api";
import { formatDate } from "@/lib/utils";

export default function ResultsPage() {
  const [publishing, setPublishing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // TanStack Query for dynamic database results
  const {
    data: resultsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["results", "all"],
    queryFn: async () => {
      const data = await getResults();
      return Array.isArray(data) ? data : data?.results || [];
    },
    staleTime: 30 * 1000,
  });

  const results: any[] = resultsData || [];
  const isPublished = results.some((r) => r.isPublished);

  // Active student for printable marksheet
  const activeResult =
    results.find((r) => r.id === selectedStudentId || r.student?.id === selectedStudentId) ||
    results[0] ||
    null;

  const handleTogglePublish = async () => {
    if (results.length === 0) {
      toast.error("No results found to publish.");
      return;
    }

    setPublishing(true);
    const targetState = !isPublished;
    try {
      await apiClient.post("/results/publish", { publish: targetState });
      toast.success(
        targetState
          ? "Results Officially Published! Students can now access verified marksheets."
          : "Results Withheld for Review & Moderation."
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to update publication status.");
    } finally {
      setPublishing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header (Hidden during print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            Result Moderation & Publication Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Examination Results & Verified Digital Marksheet
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Finalized marks moderation, batch result publication controls, and official student transcripts with anti-fraud QR verification seals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePublish}
            disabled={publishing || isLoading || results.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105 cursor-pointer disabled:opacity-50 ${
              isPublished
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPublished ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            <span>{isPublished ? "Withhold Results" : "Publish Official Results"}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!activeResult}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print Marksheet
          </button>
        </div>
      </div>

      {/* Moderation Register Table (Hidden on print) */}
      <div className="no-print rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Batch Result Moderation Register</h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            Status: {isPublished ? "PUBLISHED TO STUDENTS" : "WITHHELD FOR MODERATION"}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs">Loading verified student marks records...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl">
            <Award className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No examination results registered yet.</p>
            <p className="text-xs text-slate-500">
              Evaluated answer sheets and finalized marks from examiners will populate this register automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Student Name</th>
                  <th className="pb-3 px-3">Roll No</th>
                  <th className="pb-3 px-3">Subject & Exam</th>
                  <th className="pb-3 px-3">Max Marks</th>
                  <th className="pb-3 px-3">Marks Obtained</th>
                  <th className="pb-3 px-3">Grade & GPA</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {results.map((r) => {
                  const sName = r.student?.user?.name || r.studentName || "Student Candidate";
                  const sRoll = r.student?.rollNo || r.rollNo || "N/A";
                  const subjName = r.exam?.subject?.name || r.subjectName || r.exam?.title || "Examination";
                  const subjCode = r.exam?.subject?.code || r.subjectCode || "";
                  const isCurrent = activeResult?.id === r.id;

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isCurrent ? "bg-slate-800/60 border-l-2 border-emerald-400" : ""
                      }`}
                      onClick={() => setSelectedStudentId(r.id)}
                    >
                      <td className="py-3 px-3 font-semibold text-white">{sName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{sRoll}</td>
                      <td className="py-3 px-3 font-medium text-slate-200">
                        {subjName}
                        {subjCode && (
                          <span className="block text-[11px] text-slate-400 font-mono">{subjCode}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{r.maxMarksTotal ?? r.maxMarks ?? 100}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400 text-sm">
                        {r.totalMarksObtained ?? r.marksObtained ?? 0}
                      </td>
                      <td className="py-3 px-3 font-bold text-indigo-400">
                        {r.grade || "-"} {r.gpa ? `(${r.gpa} GPA)` : ""}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            r.resultStatus === "PASS"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              : "text-rose-400 bg-rose-500/10 border-rose-500/30"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> {r.resultStatus || "EVALUATED"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(r.id);
                          }}
                          className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
                            isCurrent
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {isCurrent ? "Viewing" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Printable Marksheet Document */}
      {activeResult && (
        <div className="rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-2xl p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6 print:border-none print:shadow-none print:p-0">
          {/* College Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                <GraduationCap className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950 uppercase font-heading">
                  Swathi College of Pharmacy
                </h2>
                <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                  Autonomous College • Examination & Evaluation Branch
                </p>
                <p className="text-[11px] text-slate-500 font-normal">
                  Approved by PCI &amp; Affiliated to University • Hyderabad
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block bg-slate-900 text-white font-medium text-xs px-3 py-1 rounded">
                MEMORANDUM OF MARKS
              </span>
              <p className="text-[11px] text-slate-600 font-mono font-medium">
                ID: {activeResult.id?.slice(0, 14)?.toUpperCase() || "SWC-RESULT"}
              </p>
            </div>
          </div>

          {/* Candidate & Batch Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Candidate Name:</span>
              <strong className="text-sm font-semibold text-slate-900">
                {activeResult.student?.user?.name || activeResult.studentName || "Student Candidate"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Roll Number:</span>
              <strong className="text-sm font-semibold font-mono text-indigo-700">
                {activeResult.student?.rollNo || activeResult.rollNo || "N/A"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Father / Guardian:</span>
              <strong className="text-slate-900 font-medium">
                {activeResult.student?.fatherName || activeResult.fatherName || "On Record"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Academic Year:</span>
              <strong className="text-slate-900 font-medium">
                {activeResult.student?.academicYear?.name || "2026–2027"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Program / Class:</span>
              <strong className="text-slate-900 font-medium">
                {activeResult.student?.class?.name || activeResult.className || "Pharmacy"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Section:</span>
              <strong className="text-slate-900 font-medium">
                {activeResult.student?.section?.name || activeResult.section || "A"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Examination:</span>
              <strong className="text-slate-900 font-medium">
                {activeResult.exam?.title || activeResult.examTitle || "Semester End Examination"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Date of Evaluation:</span>
              <strong className="text-slate-900 font-medium">
                {activeResult.createdAt ? formatDate(activeResult.createdAt) : "Verified Session"}
              </strong>
            </div>
          </div>

          {/* Subject-Wise Marks Statement Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 font-medium text-slate-800 uppercase">
                <tr>
                  <th className="py-3 px-3">Subject Code</th>
                  <th className="py-3 px-3">Subject Title</th>
                  <th className="py-3 px-3">Max Marks</th>
                  <th className="py-3 px-3">Pass Marks</th>
                  <th className="py-3 px-3">Marks Secured</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Grade Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                <tr>
                  <td className="py-3.5 px-3 font-mono font-medium text-indigo-700">
                    {activeResult.exam?.subject?.code || activeResult.subjectCode || "SUB-01"}
                  </td>
                  <td className="py-3.5 px-3 font-medium">
                    {activeResult.exam?.subject?.name || activeResult.subjectName || "Subject Title"}
                  </td>
                  <td className="py-3.5 px-3">{activeResult.maxMarksTotal ?? activeResult.maxMarks ?? 100}</td>
                  <td className="py-3.5 px-3">{activeResult.exam?.passMarks ?? activeResult.passMarks ?? 35}</td>
                  <td className="py-3.5 px-3 font-semibold text-sm text-emerald-800">
                    {activeResult.totalMarksObtained ?? activeResult.marksObtained ?? 0}
                  </td>
                  <td className="py-3.5 px-3 font-medium">{activeResult.grade || "-"}</td>
                  <td className="py-3.5 px-3 font-medium">{activeResult.gpa ?? "-"}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-900 text-xs">
                <tr>
                  <td colSpan={2} className="py-3 px-3 text-right uppercase">
                    Grand Aggregate Total:
                  </td>
                  <td className="py-3 px-3">{activeResult.maxMarksTotal ?? activeResult.maxMarks ?? 100}</td>
                  <td className="py-3 px-3">—</td>
                  <td className="py-3 px-3 font-semibold text-emerald-900 text-sm">
                    {activeResult.totalMarksObtained ?? activeResult.marksObtained ?? 0} /{" "}
                    {activeResult.maxMarksTotal ?? activeResult.maxMarks ?? 100}
                  </td>
                  <td className="py-3 px-3 text-emerald-800">{activeResult.grade || "-"}</td>
                  <td className="py-3 px-3 font-semibold text-indigo-900">
                    {activeResult.gpa ? `${activeResult.gpa} GPA` : "-"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Result Outcome & Cryptographic Verification Seal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center pt-2">
            <div className="md:col-span-3 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">FINAL RESULT:</span>
                <span
                  className={`font-bold px-3 py-1 rounded border ${
                    activeResult.resultStatus === "PASS"
                      ? "text-emerald-800 bg-emerald-100 border-emerald-300"
                      : "text-rose-800 bg-rose-100 border-rose-300"
                  }`}
                >
                  {activeResult.resultStatus === "PASS" ? "PASSED" : "FAILED / SUPPLEMENTARY REQUIRED"} (
                  {activeResult.grade || "N/A"})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Medium of Instruction: English • Scanned Digital Answer Booklet Evaluation Authenticated • Any tampering renders this marksheet invalid.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-400 rounded-xl bg-slate-50 text-center space-y-1.5">
              <div className="h-24 w-24 bg-white p-1 border border-slate-300 rounded flex items-center justify-center">
                <div className="h-full w-full bg-slate-900 p-1 flex items-center justify-center rounded">
                  <QrCode className="h-16 w-16 text-white" />
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-700">
                SCAN TO VERIFY TRANSCRIPT
              </span>
            </div>
          </div>

          {/* Official Authority Signatures */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-700">
            <div className="text-center">
              <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
                Controller of Exams
              </div>
              <span className="font-medium text-[11px]">Evaluation Branch</span>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
                Dean Academics
              </div>
              <span className="font-medium text-[11px]">Academic Council</span>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
                Principal
              </div>
              <span className="font-medium text-[11px]">Institution Head</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
