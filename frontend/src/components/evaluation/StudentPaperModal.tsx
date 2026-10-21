'use client';

import React, { useState } from 'react';
import { AnswerSheet, Question } from '@/lib/evaluation-data';
import { generateSyntheticSheetSvg } from '@/lib/ocr-utils';
import {
  X,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Award,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: AnswerSheet;
  questions: Question[];
  isStudentView?: boolean;
}

export default function StudentPaperModal({
  isOpen,
  onClose,
  sheet,
  questions,
  isStudentView = true,
}: StudentPaperModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('q-003');
  const [showRevalForm, setShowRevalForm] = useState(false);
  const [revalReason, setRevalReason] = useState('');

  if (!isOpen) return null;

  const totalPages = sheet.pages?.length || 4;
  const activeQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];
  const marksAwarded = sheet.marksEntered?.[selectedQuestionId] ?? (activeQuestion?.maxMarks === 1 ? 1 : 4.5);
  const feedback = sheet.commentsEntered?.[selectedQuestionId] || 'Good formulation reasoning and accurate biochemical mechanisms.';

  const handleRequestReval = async () => {
    if (!revalReason.trim()) {
      toast.error('Please enter a brief justification for revaluation.');
      return;
    }
    try {
      const res = await fetch('/api/evaluation/revaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerSheetId: sheet.id,
          reason: revalReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit revaluation request');
      toast.success(data.message || 'Revaluation request submitted successfully to Examination Cell.');
      setShowRevalForm(false);
      setRevalReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit revaluation request');
    }
  };

  const currentPageSvg = generateSyntheticSheetSvg(
    currentPage,
    sheet.studentName,
    sheet.rollNo,
    activeQuestion.number
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {sheet.studentName} ({sheet.rollNo})
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  Score: {sheet.totalMarks ?? 29.5} / {sheet.totalMaxMarks ?? 32} (
                  {sheet.percentage ?? 92}%)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {sheet.className} • Evaluated by {sheet.evaluatedBy || 'Prof. Ramesh K. (HOD)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStudentView && (
              <button
                onClick={() => setShowRevalForm(!showRevalForm)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Apply for Revaluation
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Revaluation Drawer */}
        {showRevalForm && (
          <div className="bg-amber-50/80 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1 space-y-1">
              <span className="font-semibold text-amber-900">
                Submit Formal Answer Script Re-checking Request
              </span>
              <p className="text-amber-700">
                Fee: ₹250 per paper. Scrutiny committee will re-verify total marks and un-evaluated steps within 48 hours.
              </p>
              <input
                type="text"
                value={revalReason}
                onChange={(e) => setRevalReason(e.target.value)}
                placeholder="Mention specific questions to be scrutinized (e.g. Q3 and Q5 reaction steps)..."
                className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleRequestReval}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowRevalForm(false)}
                className="px-3 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Questions Navigator */}
          <div className="w-64 bg-slate-50 border-r border-slate-200/80 p-3 overflow-y-auto space-y-2 select-none">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Questions & Awarded Marks
            </div>

            {questions.map((q) => {
              const isActive = q.id === selectedQuestionId;
              const qMarks = sheet.marksEntered?.[q.id] ?? (q.maxMarks === 1 ? 1 : 4.5);

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    if (q.answerAreaBoundingBox?.pageNo) {
                      setCurrentPage(q.answerAreaBoundingBox.pageNo);
                    }
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer border transition ${
                    isActive
                      ? 'bg-teal-50 border-teal-500 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">Q.{q.number} ({q.type})</span>
                    <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {qMarks}/{q.maxMarks}M
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{q.text}</p>
                </div>
              );
            })}
          </div>

          {/* Center: Graded Script Viewer with Annotations */}
          <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden relative">
            {/* Toolbar */}
            <div className="h-10 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(60, z - 20))}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-600">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(250, z + 20))}
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="bg-white shadow-lg rounded border border-slate-300 relative"
              >
                <img
                  src={currentPageSvg}
                  alt={`Student Script Page ${currentPage}`}
                  className="w-[740px] h-[1050px] object-contain block pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Right: Detailed Question Breakdown & Feedback */}
          <div className="w-80 bg-white border-l border-slate-200/80 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div>
                <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                  Question {activeQuestion.number} Breakdown
                </span>
                <p className="text-xs text-slate-800 font-medium mt-2 leading-relaxed">
                  {activeQuestion.text}
                </p>
              </div>

              {/* Awarded Score */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Awarded Marks
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-900">
                  {marksAwarded} / {activeQuestion.maxMarks} Marks
                </div>
              </div>

              {/* Evaluator Feedback */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Faculty Feedback & Notes
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-normal">
                  {feedback}
                </p>
              </div>

              {/* Rubric Breakdown Steps */}
              {activeQuestion.markingBreakdown && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Rubric Marking Scheme
                  </span>
                  <div className="space-y-1">
                    {activeQuestion.markingBreakdown.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                      >
                        <span>{step.description}</span>
                        <span className="font-mono font-medium text-teal-700 ml-2">
                          +{step.marks}M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Close Script Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
