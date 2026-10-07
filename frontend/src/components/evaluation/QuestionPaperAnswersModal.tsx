'use client';

import React from 'react';
import { Question } from '@/lib/evaluation-data';
import { X, BookOpen, CheckCircle2, Award } from 'lucide-react';

interface QuestionPaperAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
}

export default function QuestionPaperAnswersModal({
  isOpen,
  onClose,
  questions,
}: QuestionPaperAnswersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Official Examination Question Paper & Rubric Scheme
              </h2>
              <p className="text-xs text-slate-500">
                Swathi College of Pharmacy — Faculty Reference Scheme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                  Section {q.section} — Question {q.number} ({q.type})
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700">
                  Max: {q.maxMarks} Marks
                </span>
              </div>

              <div className="text-sm font-medium text-slate-900 leading-relaxed">
                {q.text}
              </div>

              {/* Options if MCQ */}
              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-xs font-normal border ${
                        opt.startsWith(q.correctAnswer || '')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {/* Model Answer */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Model Answer & Evaluation Rubric:
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {q.modelAnswer}
                </p>
              </div>

              {/* Step Breakdown */}
              {q.markingBreakdown && q.markingBreakdown.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Step-by-step mark distribution:
                  </div>
                  <div className="space-y-1">
                    {q.markingBreakdown.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100"
                      >
                        <span>{step.description}</span>
                        <span className="font-mono font-medium text-teal-700 ml-2">
                          +{step.marks} Marks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
