'use client';

import React from 'react';
import { Question, AnswerSheet } from '@/lib/evaluation-data';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Award,
} from 'lucide-react';

interface MarksEntryProps {
  question: Question;
  sheet?: AnswerSheet;
  currentMarks: number | undefined;
  onUpdateMarks: (questionId: string, marks: number) => void;
  currentComment: string;
  onUpdateComment: (questionId: string, comment: string) => void;
  stepCheckedState: Record<number, boolean>;
  onToggleStep: (stepIndex: number, marks: number) => void;
  onOpenModelAnswer: () => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export default function MarksEntry({
  question,
  sheet,
  currentMarks,
  onUpdateMarks,
  currentComment,
  onUpdateComment,
  stepCheckedState,
  onToggleStep,
  onOpenModelAnswer,
  onNextQuestion,
  onPrevQuestion,
  isFirstQuestion,
  isLastQuestion,
}: MarksEntryProps) {
  const maxMarks = question.maxMarks || 5;
  const aiAnswer = sheet?.aiEvaluation?.answers?.find((a) => a.questionId === question.id);

  // Quick mark buttons
  const quickMarks = [0];
  if (maxMarks >= 2) quickMarks.push(Math.round(maxMarks / 2));
  if (maxMarks >= 5) quickMarks.push(maxMarks - 1);
  quickMarks.push(maxMarks);

  return (
    <div className="w-80 md:w-96 bg-white border-l border-slate-200/80 flex flex-col h-full overflow-hidden select-none shrink-0 text-slate-800">
      {/* Header with question info */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-teal-600 text-white text-xs font-semibold">
              Question {question.number}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Max: {maxMarks} {maxMarks === 1 ? 'Mark' : 'Marks'}
            </span>
          </div>

          <button
            onClick={onOpenModelAnswer}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Model Answer
          </button>
        </div>

        <p className="text-xs text-slate-700 font-normal leading-relaxed line-clamp-3">
          {question.text}
        </p>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI Suggested Evaluation Pill */}
        {aiAnswer && (
          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                AI Assistant Suggestion
              </div>
              <span className="text-xs font-bold font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                {aiAnswer.aiSuggestedMarks} / {maxMarks} M
              </span>
            </div>

            <p className="text-xs text-purple-950/80 font-normal leading-relaxed">
              {aiAnswer.aiComment}
            </p>

            {/* Keyword badges */}
            {aiAnswer.keywordsFound.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {aiAnswer.keywordsFound.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-medium"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                    {kw}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => onUpdateMarks(question.id, aiAnswer.aiSuggestedMarks)}
              className="w-full py-1 text-xs font-medium text-purple-700 hover:bg-purple-100/80 rounded-lg transition border border-purple-200"
            >
              Apply AI Suggested Marks
            </button>
          </div>
        )}

        {/* Step-by-Step Marking Breakdown */}
        {question.markingBreakdown && question.markingBreakdown.length > 0 && (
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Step-by-Step Rubric Criteria
            </label>

            <div className="space-y-1.5">
              {question.markingBreakdown.map((step, index) => {
                const isChecked = !!stepCheckedState[index];
                return (
                  <label
                    key={index}
                    onClick={() => onToggleStep(index, step.marks)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                      isChecked
                        ? 'bg-teal-50/50 border-teal-300 text-slate-900'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-normal text-slate-700">{step.description}</span>
                      <span className="font-mono font-semibold text-teal-700 ml-2 shrink-0">
                        +{step.marks}M
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Mark Input & Quick Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Awarded Marks
          </label>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={maxMarks}
              step={0.5}
              value={currentMarks !== undefined ? currentMarks : ''}
              onChange={(e) => onUpdateMarks(question.id, parseFloat(e.target.value) || 0)}
              placeholder="0.0"
              className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-center font-mono font-bold text-lg text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
            />
            <span className="text-xs font-medium text-slate-400">/ {maxMarks} Marks</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickMarks.map((qm) => (
              <button
                key={qm}
                onClick={() => onUpdateMarks(question.id, qm)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  currentMarks === qm
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {qm} M
              </button>
            ))}
          </div>
        </div>

        {/* Teacher Feedback / Remarks */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Evaluator Remarks & Annotations
          </label>
          <textarea
            value={currentComment}
            onChange={(e) => onUpdateComment(question.id, e.target.value)}
            placeholder="Add detailed feedback for student review..."
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden resize-none"
          />

          <div className="flex flex-wrap gap-1">
            {['Clear mechanism', 'Step missing', 'Calculation error', 'Good reasoning'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  const updated = currentComment ? `${currentComment} ${preset}.` : `${preset}.`;
                  onUpdateComment(question.id, updated);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-normal"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Prev / Next Question Nav */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onPrevQuestion}
          disabled={isFirstQuestion}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>

        <button
          onClick={onNextQuestion}
          disabled={isLastQuestion}
          className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
