"use client";

import React, { useState } from "react";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PenTool,
  Save,
  FileCheck2,
  Eye,
  Sliders,
  Award,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function EvaluationDeskPage() {
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [ocrView, setOcrView] = useState(false);
  const [saving, setSaving] = useState(false);

  // Question evaluations state
  const [questions, setQuestions] = useState([
    {
      questionNumber: 1,
      section: "Section A (Algebra & Quadratics)",
      questionText:
        "Solve for x: 2x² - 7x + 3 = 0 using the quadratic formula or factorization. Show all step-by-step calculations.",
      maxScore: 10,
      rubricGuide:
        "Factorization: (2x - 1)(x - 3) = 0 (+4 marks). Roots: x = 1/2 and x = 3 (+4 marks). Final verification (+2 marks).",
      modelAnswer: "2x² - 6x - x + 3 = 0 => (2x - 1)(x - 3) = 0. Therefore, x = 1/2 or x = 3.",
      aiSuggestedMarks: 10,
      aiConfidence: 0.96,
      aiFeedback: "Exact factorization steps and correct root determination.",
      teacherMarks: 10,
      teacherComment: "Flawless algebraic derivation.",
      isVerified: true,
    },
    {
      questionNumber: 2,
      section: "Section A (Trigonometry)",
      questionText:
        "Prove that (sin θ / (1 + cos θ)) + ((1 + cos θ) / sin θ) = 2 cosec θ.",
      maxScore: 15,
      rubricGuide:
        "Taking common LCM: sin²θ + (1 + cos θ)² / (sin θ(1 + cos θ)) (+5 marks). Expansion and applying sin²θ + cos²θ = 1 (+5 marks). Cancelling (1 + cos θ) factor and yielding 2/sin θ = 2 cosec θ (+5 marks).",
      modelAnswer:
        "LHS = [sin²θ + 1 + 2cos θ + cos²θ] / [sin θ(1 + cos θ)] = [2 + 2cos θ] / [sin θ(1 + cos θ)] = 2/sin θ = 2 cosec θ = RHS.",
      aiSuggestedMarks: 15,
      aiConfidence: 0.94,
      aiFeedback: "Correct LCM expansion, trigonometric identity substitution, and cancellation.",
      teacherMarks: 15,
      teacherComment: "Clean identity proof.",
      isVerified: true,
    },
    {
      questionNumber: 3,
      section: "Section B (Calculus / Coordinate Geometry)",
      questionText:
        "Find the equation of the line passing through points (2, 3) and (6, 11). Also find its slope and y-intercept.",
      maxScore: 15,
      rubricGuide:
        "Slope formula m = (y2 - y1)/(x2 - x1) = (11-3)/(6-2) = 8/4 = 2 (+5 marks). Point-slope form (y - 3) = 2(x - 2) (+5 marks). Simplification to y = 2x - 1, y-intercept = -1 (+5 marks).",
      modelAnswer:
        "Slope m = (11 - 3)/(6 - 2) = 2. Equation: y - 3 = 2(x - 2) => y = 2x - 1. Slope = 2, Y-intercept = -1.",
      aiSuggestedMarks: 14,
      aiConfidence: 0.92,
      aiFeedback: "Slope calculation and intercept verified. Minor step omitted in point substitution.",
      teacherMarks: 14,
      teacherComment: "Accepted AI evaluation.",
      isVerified: true,
    },
    {
      questionNumber: 4,
      section: "Section B (Probability & Statistics)",
      questionText:
        "Two unbiased dice are rolled simultaneously. Calculate the probability of getting: (i) A doublet, (ii) Sum of numbers greater than 9.",
      maxScore: 10,
      rubricGuide:
        "Total outcomes = 36 (+2 marks). (i) Doublets: (1,1)..(6,6) = 6/36 = 1/6 (+4 marks). (ii) Sum > 9: (4,6),(5,5),(5,6),(6,4),(6,5),(6,6) = 6/36 = 1/6 (+4 marks).",
      modelAnswer:
        "Total sample space n(S) = 36. (i) Event A = {(1,1),(2,2),(3,3),(4,4),(5,5),(6,6)}, P(A) = 6/36 = 1/6. (ii) Event B = {(4,6),(5,5),(5,6),(6,4),(6,5),(6,6)}, P(B) = 6/36 = 1/6.",
      aiSuggestedMarks: 9,
      aiConfidence: 0.95,
      aiFeedback: "Correct favorable outcomes and reduced fractions.",
      teacherMarks: 8,
      teacherComment: "Deducted 1 mark for missing explicit sample space listing.",
      isVerified: true,
    },
  ]);

  // Scanned page images
  const scannedPages = [
    {
      page: 1,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80",
      ocr: "Question 1: Given equation: 2x² - 7x + 3 = 0. By factorization, 2x² - 6x - x + 3 = 0 => 2x(x - 3) - 1(x - 3) = 0 => (2x - 1)(x - 3) = 0 => x = 1/2 or x = 3.",
    },
    {
      page: 2,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1000&auto=format&fit=crop&q=80",
      ocr: "Question 2: LHS = (sin θ / (1 + cos θ)) + ((1 + cos θ) / sin θ) = [sin²θ + (1 + cos θ)²] / [sin θ(1 + cos θ)] = [sin²θ + 1 + 2cos θ + cos²θ] / [sin θ(1 + cos θ)] = [2 + 2cos θ]/[sin θ(1 + cos θ)] = 2/sin θ = 2 cosec θ = RHS. Proved.",
    },
    {
      page: 3,
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80",
      ocr: "Question 3: Slope m = (11 - 3)/(6 - 2) = 8/4 = 2. Equation: y - 3 = 2(x - 2) => y = 2x - 1. Slope = 2, y-intercept = -1.",
    },
    {
      page: 4,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&auto=format&fit=crop&q=80",
      ocr: "Question 4: Total sample space = 36. (i) Doublets: 6/36 = 1/6. (ii) Sum > 9: {(4,6),(5,5),(5,6),(6,4),(6,5),(6,6)} = 6/36 = 1/6.",
    },
  ];

  // Calculate live total marks & grade
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.teacherMarks) || 0), 0);
  const maxTotal = questions.reduce((sum, q) => sum + q.maxScore, 0);
  const percentage = Math.round((totalMarks / maxTotal) * 100 * 10) / 10;

  let grade = "C";
  if (percentage >= 90) grade = "A+ (Outstanding)";
  else if (percentage >= 80) grade = "A (Excellent)";
  else if (percentage >= 70) grade = "B+ (Very Good)";
  else if (percentage >= 60) grade = "B (Good)";
  else if (percentage >= 50) grade = "C (Satisfactory)";
  else if (percentage >= 35) grade = "D (Pass)";
  else grade = "F (Fail)";

  const handleUpdateMarks = (qNum: number, marks: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.questionNumber === qNum ? { ...q, teacherMarks: marks, isVerified: true } : q))
    );
  };

  const handleUpdateComment = (qNum: number, comment: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.questionNumber === qNum ? { ...q, teacherComment: comment } : q))
    );
  };

  const handleAcceptAllAI = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        teacherMarks: q.aiSuggestedMarks,
        teacherComment: `Accepted AI Suggestion (${Math.round(q.aiConfidence * 100)}% Confidence)`,
        isVerified: true,
      }))
    );
    toast.success("AI Scores Accepted for all Questions", {
      description: "Teacher verified marks populated based on rubric evaluation.",
    });
  };

  const handleFinalizeEvaluation = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/answer-sheets/sheet-1/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionScores: questions.map((q) => ({
            questionNumber: q.questionNumber,
            maxMarks: q.maxScore,
            marks: q.teacherMarks,
            comment: q.teacherComment,
          })),
        }),
      });

      toast.success("Evaluation Finalized & Verified!", {
        description: `Total Marks: ${totalMarks}/${maxTotal} (${percentage}% - ${grade}). Result staged for publication.`,
      });
    } catch {
      toast.success("Evaluation Finalized Successfully (Simulated)!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Top Bar with Student Details & Actions */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Booklet: ANS-2026-8801
              </span>
              <h1 className="text-base font-bold text-white">Rahul Sharma</h1>
              <span className="text-xs text-slate-400 font-mono font-bold">(Roll: 261001)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Exam: <strong className="text-slate-200">Mid-Term Mathematics (EXAM-2026-MID-MTH)</strong> • Evaluator: <strong className="text-emerald-400">Prof. Ramesh Kumar (HOD)</strong>
            </p>
          </div>
        </div>

        {/* Live Score Summary Badge & Finalize Action */}
        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Aggregate Score</span>
            <span className="text-lg font-bold text-emerald-400">
              {totalMarks} / {maxTotal} ({percentage}%)
            </span>
          </div>

          <button
            onClick={handleAcceptAllAI}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Accept AI Scores
          </button>

          <button
            onClick={handleFinalizeEvaluation}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            {saving ? "Finalizing..." : "Finalize & Verify Marks"}
          </button>
        </div>
      </div>

      {/* Split-Screen Evaluation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (7 COLS): Scanned Answer Booklet Viewer */}
        <div className="lg:col-span-6 xl:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col h-[820px]">
          {/* Viewer Toolbar */}
          <div className="bg-slate-800/80 border-b border-slate-700/80 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                Scanned Booklet
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300">
                Page {activePage} of {scannedPages.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOcrView(!ocrView)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  ocrView
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700"
                }`}
              >
                {ocrView ? "Show Scanned Image" : "OCR Text Preview"}
              </button>

              <button
                onClick={() => setZoomLevel((prev) => Math.max(75, prev - 15))}
                className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-slate-400 w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(150, prev + 15))}
                className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Image / OCR Display Area */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60">
            {ocrView ? (
              <div className="w-full h-full p-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed space-y-4">
                <div className="flex items-center justify-between text-[11px] text-purple-400 border-b border-slate-800 pb-2">
                  <span>OCR Barcode & Handwriting Extractor</span>
                  <span>Confidence: 98%</span>
                </div>
                <p className="whitespace-pre-wrap">{scannedPages[activePage - 1].ocr}</p>
              </div>
            ) : (
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                className="transition-transform duration-150 rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-white max-w-full"
              >
                <img
                  src={scannedPages[activePage - 1].image}
                  alt={`Answer Sheet Page ${activePage}`}
                  className="w-full h-auto object-contain max-h-[700px]"
                />
              </div>
            )}
          </div>

          {/* Page Navigation Footer */}
          <div className="bg-slate-800/80 border-t border-slate-700/80 p-3 flex items-center justify-between text-xs">
            <button
              onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center gap-1 border border-slate-600 font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Prev Page
            </button>

            <div className="flex items-center gap-1.5">
              {scannedPages.map((p) => (
                <button
                  key={p.page}
                  onClick={() => setActivePage(p.page)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                    activePage === p.page
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
                  }`}
                >
                  {p.page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActivePage((prev) => Math.min(scannedPages.length, prev + 1))}
              disabled={activePage === scannedPages.length}
              className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center gap-1 border border-slate-600 font-medium"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT PANE (5 COLS): Question-by-Question Scoring & AI Rubrics */}
        <div className="lg:col-span-6 xl:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-5 h-[820px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>Question Marking & Rubrics</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Review AI suggestions, model answer guides, and assign verified marks.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Grade: {grade}
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.questionNumber}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3 hover:border-slate-600 transition-all"
              >
                {/* Question Header & Marks Allocation */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      {q.section}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-0.5">
                      Question {q.questionNumber} (Max: {q.maxScore} Marks)
                    </h3>
                  </div>

                  {/* Marks Input & Overrides */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">Marks:</span>
                    <input
                      type="number"
                      min={0}
                      max={q.maxScore}
                      value={q.teacherMarks}
                      onChange={(e) => handleUpdateMarks(q.questionNumber, Number(e.target.value))}
                      className="w-16 h-8 text-center font-bold text-sm bg-slate-900 border border-emerald-500/60 text-emerald-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{q.questionText}</p>

                {/* AI Suggestion Box */}
                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      AI Suggested: <strong className="text-white">{q.aiSuggestedMarks} / {q.maxScore}</strong>
                    </span>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.2 rounded">
                      {(q.aiConfidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{q.aiFeedback}</p>
                </div>

                {/* Model Rubric Guide Drawer */}
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-300 block">Marking Rubric:</span>
                  <p>{q.rubricGuide}</p>
                </div>

                {/* Teacher Comment / Annotation */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium">Faculty Annotation & Comment:</span>
                  <input
                    type="text"
                    value={q.teacherComment}
                    onChange={(e) => handleUpdateComment(q.questionNumber, e.target.value)}
                    placeholder="Enter grading rationale..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
