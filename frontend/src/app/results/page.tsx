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
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function ResultsPage() {
  const [isPublished, setIsPublished] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const [results, setResults] = useState([
    {
      id: "res-1",
      studentName: "Rahul Sharma",
      rollNo: "261001",
      studentId: "SWC-2026-1001",
      className: "Grade 10 (Secondary)",
      section: "Section A",
      group: "Science (MPC)",
      fatherName: "Sanjay Sharma",
      examTitle: "Mid-Term Mathematics Board Examination 2026",
      examCode: "EXAM-2026-MID-MTH",
      subjectName: "Mathematics - Pure & Applied",
      subjectCode: "MTH-101",
      maxMarks: 100,
      passMarks: 35,
      marksObtained: 94,
      percentage: 94.0,
      gpa: 9.4,
      grade: "A+",
      resultStatus: "PASS",
      publishedAt: "22 Sep 2026",
    },
    {
      id: "res-2",
      studentName: "Sneha Reddy",
      rollNo: "261002",
      studentId: "SWC-2026-1002",
      className: "Grade 10 (Secondary)",
      section: "Section A",
      group: "Science (MPC)",
      fatherName: "K. R. Reddy",
      examTitle: "Mid-Term Mathematics Board Examination 2026",
      examCode: "EXAM-2026-MID-MTH",
      subjectName: "Mathematics - Pure & Applied",
      subjectCode: "MTH-101",
      maxMarks: 100,
      passMarks: 35,
      marksObtained: 84,
      percentage: 84.0,
      gpa: 8.4,
      grade: "A",
      resultStatus: "PASS",
      publishedAt: "22 Sep 2026",
    },
  ]);

  const handleTogglePublish = async () => {
    setPublishing(true);
    const targetState = !isPublished;
    try {
      const res = await fetch("/api/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: targetState }),
      });
      setIsPublished(targetState);
      if (targetState) {
        toast.success("Results Officially Published!", {
          description: "Students can now view their scorecards & download verified marksheets.",
        });
      } else {
        toast.info("Results Withheld for Moderation", {
          description: "Student portal result access disabled temporarily.",
        });
      }
    } catch {
      setIsPublished(targetState);
      toast.success(targetState ? "Results Published (Simulated)!" : "Results Withheld (Simulated)!");
    } finally {
      setPublishing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeStudent = results[0];

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
            disabled={publishing}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105 ${
              isPublished
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {isPublished ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{isPublished ? "Withhold Results" : "Publish Official Results"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
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
            Status: {isPublished ? "PUBLISHED TO STUDENTS" : "WITHHELD"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="pb-3 px-3">Student Name</th>
                <th className="pb-3 px-3">Roll No</th>
                <th className="pb-3 px-3">Subject & Code</th>
                <th className="pb-3 px-3">Max Marks</th>
                <th className="pb-3 px-3">Marks Obtained</th>
                <th className="pb-3 px-3">Percentage</th>
                <th className="pb-3 px-3">Grade & GPA</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{r.studentName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">{r.rollNo}</td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    {r.subjectName}
                    <span className="block text-[11px] text-slate-400 font-mono">{r.subjectCode}</span>
                  </td>
                  <td className="py-3 px-3">{r.maxMarks}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400 text-sm">{r.marksObtained}</td>
                  <td className="py-3 px-3 font-bold">{r.percentage}%</td>
                  <td className="py-3 px-3 font-bold text-indigo-400">
                    {r.grade} ({r.gpa} GPA)
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {r.resultStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Marksheet Document */}
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
              SL. NO: SWC-2026-98124
            </p>
          </div>
        </div>

        {/* Candidate & Batch Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Candidate Name:</span>
            <strong className="text-sm font-semibold text-slate-900">{activeStudent.studentName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Roll Number:</span>
            <strong className="text-sm font-semibold font-mono text-indigo-700">{activeStudent.rollNo}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Father's Name:</span>
            <strong className="text-slate-900 font-medium">{activeStudent.fatherName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Academic Year:</span>
            <strong className="text-slate-900 font-medium">2026–2027</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Course & Class:</span>
            <strong className="text-slate-900 font-medium">{activeStudent.className}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Section / Group:</span>
            <strong className="text-slate-900 font-medium">{activeStudent.section} ({activeStudent.group})</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Examination:</span>
            <strong className="text-slate-900 font-medium">Mid-Term Board Exam 2026</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal block text-[11px]">Date of Issue:</span>
            <strong className="text-slate-900 font-medium">22 September 2026</strong>
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
                <td className="py-3.5 px-3 font-mono font-medium text-indigo-700">MTH-101</td>
                <td className="py-3.5 px-3 font-medium">Pharmaceutics - Theory</td>
                <td className="py-3.5 px-3">100</td>
                <td className="py-3.5 px-3">35</td>
                <td className="py-3.5 px-3 font-semibold text-sm text-emerald-800">94</td>
                <td className="py-3.5 px-3 font-medium">A+</td>
                <td className="py-3.5 px-3 font-medium">9.4</td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-mono font-medium text-indigo-700">PHY-101</td>
                <td className="py-3.5 px-3 font-medium">Pharmaceutical Chemistry</td>
                <td className="py-3.5 px-3">100</td>
                <td className="py-3.5 px-3">35</td>
                <td className="py-3.5 px-3 font-semibold text-sm text-emerald-800">88</td>
                <td className="py-3.5 px-3 font-medium">A</td>
                <td className="py-3.5 px-3 font-medium">8.8</td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-mono font-medium text-indigo-700">CHE-101</td>
                <td className="py-3.5 px-3 font-medium">Pharmacology &amp; Toxicology</td>
                <td className="py-3.5 px-3">100</td>
                <td className="py-3.5 px-3">35</td>
                <td className="py-3.5 px-3 font-semibold text-sm text-emerald-800">91</td>
                <td className="py-3.5 px-3 font-medium">A+</td>
                <td className="py-3.5 px-3 font-medium">9.1</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-900 text-xs">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-right uppercase">
                  Grand Aggregate Total:
                </td>
                <td className="py-3 px-3">300</td>
                <td className="py-3 px-3">—</td>
                <td className="py-3 px-3 font-semibold text-emerald-900 text-sm">273 / 300</td>
                <td className="py-3 px-3 text-emerald-800">A+</td>
                <td className="py-3 px-3 font-semibold text-indigo-900">9.10 CGPA</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Result Outcome & Cryptographic Verification Seal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center pt-2">
          <div className="md:col-span-3 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">FINAL RESULT:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded border border-emerald-300">
                PASSED IN FIRST CLASS WITH DISTINCTION (A+)
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
              Prof. Ramesh Kumar
            </div>
            <span className="font-medium text-[11px]">Tabulated & Checked by</span>
          </div>

          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
              M. Venkat Rao
            </div>
            <span className="font-medium text-[11px]">Controller of Examinations</span>
          </div>

          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
              Dr. K. S. Narayana
            </div>
            <span className="font-medium text-[11px]">Principal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
