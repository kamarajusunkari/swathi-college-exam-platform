'use client';

import React from 'react';
import { Question } from '@/lib/evaluation-data';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface QuestionSelectorProps {
  questions: Question[];
  currentQuestionId: string;
  onSelectQuestion: (questionId: string) => void;
  marksEntered: Record<string, number>;
  onOpenSubmitModal: () => void;
}

export default function QuestionSelector({
  questions,
  currentQuestionId,
  onSelectQuestion,
  marksEntered,
  onOpenSubmitModal,
}: QuestionSelectorProps) {
  const sections = Array.from(new Set(questions.map((q) => q.section)));

  const totalMaxMarks = questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
  const totalEnteredMarks = Object.values(marksEntered).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(marksEntered).length;
  const remainingCount = Math.max(0, totalQuestions - answeredCount);
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-full overflow-hidden select-none shrink-0 text-slate-800">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Questions ({totalQuestions})
          </h3>
          <p className="text-[11px] text-slate-400">Click to focus paper area</p>
        </div>
        <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
          {answeredCount}/{totalQuestions}
        </span>
      </div>

      {/* Question List Grouped by Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {sections.map((sectionKey) => {
          const sectionQuestions = questions.filter((q) => q.section === sectionKey);
          const firstQ = sectionQuestions[0];

          return (
            <div key={sectionKey} className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                {firstQ?.sectionLabel || `Section ${sectionKey}`}
              </div>

              <div className="space-y-1.5">
                {sectionQuestions.map((q) => {
                  const isActive = q.id === currentQuestionId;
                  const marksVal = marksEntered[q.id];
                  const hasMarks = marksVal !== undefined;
                  const isFullMarks = hasMarks && marksVal === q.maxMarks;
                  const isZeroMarks = hasMarks && marksVal === 0;

                  return (
                    <div
                      key={q.id}
                      onClick={() => onSelectQuestion(q.id)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all duration-150 relative border ${
                        isActive
                          ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                          : hasMarks
                          ? 'bg-emerald-50/40 border-emerald-200/70 hover:border-emerald-300'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r" />
                      )}

                      <div className="flex items-center justify-between mb-1 pl-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              isActive
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Q{q.number}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {q.type}
                          </span>
                        </div>

                        {/* Status / Marks pill */}
                        <div>
                          {hasMarks ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                                isFullMarks
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isZeroMarks
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {marksVal}/{q.maxMarks}M
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              —/{q.maxMarks}M
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 font-normal pl-1 line-clamp-1">
                        {q.text || `Question ${q.number}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Status summary */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Evaluation Progress</span>
          <span className="font-mono font-semibold text-slate-800">
            {totalEnteredMarks} / {totalMaxMarks} M
          </span>
        </div>

        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <button
          onClick={onOpenSubmitModal}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
            remainingCount === 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {remainingCount === 0 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Finalize Evaluation
            </>
          ) : (
            <>
              Save Evaluation ({remainingCount} Left)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
