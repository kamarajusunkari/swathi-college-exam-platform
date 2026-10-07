'use client';

import React, { useState } from 'react';
import { Question } from '@/lib/evaluation-data';
import {
  Sparkles,
  CheckCircle2,
  Tag,
  Key,
  HelpCircle,
  ArrowLeft,
  Save,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
} from 'lucide-react';

interface MarkingSchemeProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  onBack: () => void;
  onSaveExam: () => void;
}

export default function MarkingScheme({
  questions,
  onUpdateQuestions,
  onBack,
  onSaveExam,
}: MarkingSchemeProps) {
  const [expandedQId, setExpandedQId] = useState<string | null>(questions[0]?.id || null);
  const [keywordInputs, setKeywordInputs] = useState<Record<string, string>>({});

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
  const sectionSummary = questions.reduce((acc, q) => {
    acc[q.section] = (acc[q.section] || 0) + (Number(q.maxMarks) || 0);
    return acc;
  }, {} as Record<string, number>);

  const handleAddKeyword = (qId: string) => {
    const raw = keywordInputs[qId]?.trim();
    if (!raw) return;

    const newKeywords = raw
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const updated = questions.map((q) => {
      if (q.id === qId) {
        const set = new Set([...q.keywords, ...newKeywords]);
        return { ...q, keywords: Array.from(set) };
      }
      return q;
    });

    onUpdateQuestions(updated);
    setKeywordInputs({ ...keywordInputs, [qId]: '' });
  };

  const handleRemoveKeyword = (qId: string, kwToRemove: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        return { ...q, keywords: q.keywords.filter((k) => k !== kwToRemove) };
      }
      return q;
    });
    onUpdateQuestions(updated);
  };

  return (
    <div className="space-y-6">
      {/* Marking Scheme Summary Banner - Clean Swathi College Style */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="badge-orange font-mono">
            <Sparkles size={13} className="text-[#ff5722]" />
            <span>AI Rubric &amp; Marking Scheme</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 font-heading">
            Verify Model Answers, Step Rubrics &amp; Keywords
          </h2>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Swathi AI compares student handwritten scripts against these model solutions, step rubrics, and essential scientific keywords during automated evaluation.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50/80 px-4 py-3 rounded-xl border border-slate-200/80 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-medium text-slate-400 tracking-wider font-mono">Total Max Marks</div>
            <div className="text-2xl font-normal text-slate-800 font-heading leading-none mt-0.5">{totalMarks}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-xs space-y-0.5 text-slate-600 font-normal">
            {Object.entries(sectionSummary).map(([sec, marks]) => (
              <div key={sec}>
                Section {sec}: <span className="font-mono text-slate-800 font-medium">{marks}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Questions Scheme Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 font-heading">All Examination Questions ({questions.length})</h3>
            <p className="text-xs text-slate-400 font-normal mt-0.5">Click any question to view its AI checking criteria and target keywords.</p>
          </div>
          <span className="badge-emerald font-mono">
            ✓ Auto-Sync Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {questions.map((q) => {
            const isExpanded = expandedQId === q.id;
            return (
              <div key={q.id} className="transition-colors hover:bg-slate-50/30">
                {/* Header row */}
                <div
                  onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-7 w-7 rounded-lg bg-orange-50 text-[#ff5722] border border-orange-200/80 font-mono font-medium text-xs flex items-center justify-center shrink-0">
                      Q{q.number}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {q.sectionLabel}
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-100">
                          {q.type}
                        </span>
                      </div>
                      <p className="text-xs font-normal text-slate-700 truncate mt-1">
                        {q.text || 'No question text provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-800 font-mono">{q.maxMarks} Marks</span>
                      <div className="text-[10px] text-slate-400 font-normal">{q.keywords.length} AI keywords</div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    {/* Model Answer */}
                    <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-medium font-heading">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Model Answer &amp; Key Working
                      </div>
                      <p className="text-xs text-emerald-950 font-mono whitespace-pre-wrap leading-relaxed">
                        {q.modelAnswer || (q.correctAnswer ? `Correct Option: ${q.correctAnswer}` : 'No model answer provided')}
                      </p>
                    </div>

                    {/* Step Breakdown */}
                    {q.markingBreakdown && q.markingBreakdown.length > 0 && (
                      <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2">
                        <div className="text-xs font-medium text-slate-700 uppercase tracking-wider font-heading">
                          Evaluation Step Points &amp; Rubrics
                        </div>
                        <div className="space-y-1.5">
                          {q.markingBreakdown.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-slate-600 font-normal">{step.description}</span>
                              <span className="font-medium text-[#ff5722] font-mono">+{step.marks} mark</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Keywords */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 font-heading">
                          <Tag size={13} className="text-[#ff5722]" />
                          AI Target Keywords (Evaluator searches for these concepts in student handwriting)
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {q.keywords.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No keywords added yet</span>
                        ) : (
                          q.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-normal border border-orange-200/80"
                            >
                              <span>{kw}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveKeyword(q.id, kw)}
                                className="hover:text-rose-600 font-bold text-[11px] leading-none cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={keywordInputs[q.id] || ''}
                          onChange={(e) => setKeywordInputs({ ...keywordInputs, [q.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddKeyword(q.id);
                            }
                          }}
                          placeholder="Type keyword and press Enter (or comma separated, e.g. Acetylation, H2SO4, Analgesic)"
                          className="form-input text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddKeyword(q.id)}
                          className="btn-secondary btn-sm"
                        >
                          Add Keyword
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <button
          onClick={onBack}
          className="btn-outline"
        >
          <ArrowLeft size={15} /> Edit Questions
        </button>

        <button
          onClick={onSaveExam}
          className="btn-primary"
        >
          <Save size={15} />
          <span>Save Exam Blueprint &amp; Open Workspace →</span>
        </button>
      </div>
    </div>
  );
}
