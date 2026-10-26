"use client";

import React, { useState } from "react";
import {
  Printer,
  GraduationCap,
  CheckCircle2,
  FileText,
  Eye,
} from "lucide-react";
import StudentPaperModal from "@/components/evaluation/StudentPaperModal";
import { AnswerSheet, Question } from "@/lib/evaluation-data";

interface SubjectResult {
  id: string;
  totalMarksObtained: number;
  maxMarksTotal: number;
  grade: string;
  gpa?: number | null;
  resultStatus: string;
  exam: {
    title: string;
    subject: {
      name: string;
      code: string;
      credits: number;
    };
  };
}

interface Props {
  student: {
    rollNo: string;
    studentId: string;
    user: { name: string };
    class: { name: string };
    section?: { name: string } | null;
    academicYear: { name: string };
  };
  results: SubjectResult[];
}

export function ResultMarksheetCard({ student, results }: Props) {
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [selectedSheet] = useState<AnswerSheet>(() => ({
    id: `sheet-${student.rollNo}`,
    examId: results[0]?.exam?.title || "Examination",
    studentId: student.studentId || student.rollNo,
    studentName: student.user.name,
    studentInitials: student.user.name.slice(0, 2).toUpperCase(),
    studentColor: "bg-teal-500",
    rollNo: student.rollNo,
    className: student.class.name,
    uploadedAt: new Date().toISOString(),
    status: "EVALUATED" as const,
    totalPages: 4,
    pages: [],
    aiEvaluation: {
      status: "COMPLETE" as const,
      totalAISuggestedMarks: results[0]?.totalMarksObtained ?? 0,
      totalMaxMarks: results[0]?.maxMarksTotal ?? 100,
      aiSuggestedPercentage: results[0] ? Math.round((results[0].totalMarksObtained / (results[0].maxMarksTotal || 100)) * 100) : 0,
      answers: [],
    },
    totalMarks: results[0]?.totalMarksObtained ?? 0,
  }));

  const handlePrint = () => {
    window.print();
  };

  // Compute SGPA = Sum(credits * gradePoint) / Sum(credits)
  let totalCredits = 0;
  let totalWeightedPoints = 0;
  let totalMarksScored = 0;
  let totalMaxMarks = 0;
  let allPassed = true;

  results.forEach((r) => {
    const credits = r.exam.subject.credits || 3;
    const gradePoint =
      r.gpa ??
      (r.grade === "O"
        ? 10
        : r.grade === "A+"
        ? 9
        : r.grade === "A"
        ? 8
        : r.grade === "B+"
        ? 7
        : r.grade === "B"
        ? 6
        : r.grade === "C"
        ? 5
        : 0);
    totalCredits += credits;
    totalWeightedPoints += credits * gradePoint;
    totalMarksScored += r.totalMarksObtained;
    totalMaxMarks += r.maxMarksTotal;
    if (r.resultStatus !== "PASS") allPassed = false;
  });

  const sgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksScored / totalMaxMarks) * 100) : 0;

  const resultDivision = allPassed
    ? Number(sgpa) >= 8.0
      ? "FIRST CLASS WITH DISTINCTION"
      : Number(sgpa) >= 6.5
      ? "FIRST CLASS"
      : "SECOND CLASS"
    : "SUPPLEMENTARY REQUIRED";

  const evaluatedQuestions: Question[] = results.map((r, i) => ({
    id: r.id,
    number: i + 1,
    section: "A",
    sectionLabel: `${r.exam.subject.code} — ${r.exam.subject.name}`,
    type: "LONG" as const,
    text: `${r.exam.subject.name} Examination Evaluation Scheme`,
    options: null,
    correctAnswer: null,
    maxMarks: r.maxMarksTotal,
    negativeMark: 0,
    keywords: [],
    modelAnswer: `Official evaluation rubric for ${r.exam.subject.name}. Marks Obtained: ${r.totalMarksObtained} / ${r.maxMarksTotal} (${r.grade}).`,
    markingBreakdown: [
      { marks: r.totalMarksObtained, description: `Score awarded: ${r.totalMarksObtained} / ${r.maxMarksTotal} marks` },
    ],
  }));

  return (
    <div className="space-y-4">
      {/* Action Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Official Certified Marksheet • Published by Exam Cell
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScriptModal(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-teal-600" />
            View Evaluated Answer Script & Rubric
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save Transcript
          </button>
        </div>
      </div>

      {/* Grade Card Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Semester SGPA</p>
          <h3 className="text-3xl font-bold text-teal-700 mt-1">{sgpa}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Scale of 10.0</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Marks</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">
            {totalMarksScored} <span className="text-base text-slate-400 font-normal">/ {totalMaxMarks}</span>
          </h3>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">{overallPercentage}% Overall</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Credits Earned</p>
          <h3 className="text-3xl font-bold text-emerald-700 mt-1">{totalCredits}</h3>
          <p className="text-xs text-slate-500 mt-0.5">100% Academic Credits</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Result Classification</p>
          <h3 className="text-sm font-bold text-slate-900 mt-2 leading-tight">{resultDivision}</h3>
          <p className="text-xs text-teal-700 font-medium mt-0.5">Autonomous Certified</p>
        </div>
      </div>

      {/* Official Printed Marksheet Document */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center relative">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-tight">
                Swathi College of Pharmacy
              </h2>
              <p className="text-xs font-medium text-slate-600">
                (Autonomous Institution, Approved by PCI & AICTE, Affiliated to University)
              </p>
              <p className="text-[11px] text-slate-500">
                Main Campus, Examination Cell • Academic Session {student.academicYear?.name || "2026-2027"}
              </p>
            </div>
          </div>

          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-semibold tracking-wider uppercase">
            Official Statement of Marks & Grade Card
          </div>
        </div>

        {/* Student Metadata Table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Candidate Name</span>
            <p className="font-semibold text-slate-900">{student.user.name}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">University Roll No</span>
            <p className="font-mono font-bold text-teal-700">{student.rollNo}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Program & Branch</span>
            <p className="font-medium text-slate-800">{student.class.name}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Academic Session</span>
            <p className="font-medium text-slate-800">AY {student.academicYear?.name || "2026-2027"}</p>
          </div>
        </div>

        {/* Subject-Wise Marks & Grades Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-semibold text-slate-700 uppercase text-[10px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3">Subject Code</th>
                <th className="py-2.5 px-3">Subject Title</th>
                <th className="py-2.5 px-3 text-center">Credits</th>
                <th className="py-2.5 px-3 text-center">Max Marks</th>
                <th className="py-2.5 px-3 text-center">Marks Secured</th>
                <th className="py-2.5 px-3 text-center">Letter Grade</th>
                <th className="py-2.5 px-3 text-center">Grade Point</th>
                <th className="py-2.5 px-3 text-right">Script</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 px-3 font-mono font-semibold text-teal-700">{r.exam.subject.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{r.exam.subject.name}</td>
                  <td className="py-2.5 px-3 text-center">{r.exam.subject.credits}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{r.maxMarksTotal}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-900">{r.totalMarksObtained}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-semibold text-xs bg-slate-100 text-slate-900">
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">{r.gpa?.toFixed(1) ?? "0.0"}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setShowScriptModal(true)}
                      className="px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium text-[11px] border border-teal-200 inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      View Script
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-3 uppercase text-[11px]">
                  Total Summary
                </td>
                <td className="py-3 px-3 text-center">{totalCredits}</td>
                <td className="py-3 px-3 text-center">{totalMaxMarks}</td>
                <td className="py-3 px-3 text-center text-teal-700 font-bold">{totalMarksScored}</td>
                <td colSpan={2} className="py-3 px-3 text-center">
                  SGPA: <span className="text-sm text-teal-700 font-bold">{sgpa}</span>
                </td>
                <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                  {resultDivision}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* UGC 10-Point Grade Key & Signatures */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-end text-xs">
          <div className="space-y-1 text-slate-500 text-[10px]">
            <p className="font-semibold text-slate-700">PCI & UGC 10-Point Grading Standard:</p>
            <p>O (90-100%): 10.0 • A+ (80-89%): 9.0 • A (70-79%): 8.0 • B+ (60-69%): 7.0 • B (50-59%): 6.0 • C (50% Pass): 5.0</p>
          </div>

          <div className="flex justify-between items-center text-center pt-6">
            <div>
              <div className="w-32 border-b border-slate-400 mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold">Verified by Dean Academics</span>
            </div>

            <div>
              <div className="w-36 border-b-2 border-slate-900 mb-1 font-serif text-xs font-bold text-slate-900">
                Examination Cell
              </div>
              <span className="text-[10px] text-slate-700 font-semibold">Controller of Examinations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Script Modal */}
      <StudentPaperModal
        isOpen={showScriptModal}
        onClose={() => setShowScriptModal(false)}
        sheet={selectedSheet}
        questions={evaluatedQuestions}
        isStudentView={true}
      />
    </div>
  );
}
