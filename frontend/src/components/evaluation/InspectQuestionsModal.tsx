'use client';

import React, { useState } from 'react';
import {
  Question,
  MarkingBreakdownStep,
  saveStoredQuestions,
  getExamById,
  saveStoredExam,
} from '@/lib/evaluation-data';
import {
  X,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Sparkles,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

interface InspectQuestionsModalProps {
  examId: string;
  examTitle: string;
  initialQuestions: Question[];
  onClose: () => void;
  onQuestionsSaved: (updatedQuestions: Question[]) => void;
}

export default function InspectQuestionsModal({
  examId,
  examTitle,
  initialQuestions,
  onClose,
  onQuestionsSaved,
}: InspectQuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [activeQIdx, setActiveQIdx] = useState<number>(0);
  const [newKeyword, setNewKeyword] = useState('');

  const activeQ = questions[activeQIdx] || questions[0];

  const updateActiveQuestion = (updates: Partial<Question>) => {
    const updated = [...questions];
    updated[activeQIdx] = { ...updated[activeQIdx], ...updates };
    setQuestions(updated);
  };

  const handleAddQuestion = (type: 'MCQ' | 'SHORT' | 'LONG') => {
    const nextNum = questions.length + 1;
    const section = nextNum <= 2 ? 'A' : nextNum <= 4 ? 'B' : 'C';
    const sectionLabel =
      section === 'A'
        ? 'Section A — Objective & MCQ'
        : section === 'B'
        ? 'Section B — Short Pharmaceutical Essays'
        : 'Section C — Detailed Derivations & Calculations';
    const maxMarks = type === 'MCQ' ? 1 : type === 'SHORT' ? 5 : 10;

    const newQ: Question = {
      id: `q-${Date.now()}`,
      section,
      sectionLabel,
      number: nextNum,
      type,
      text: '',
      options: type === 'MCQ' ? ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'] : null,
      correctAnswer: type === 'MCQ' ? 'A' : null,
      maxMarks,
      negativeMark: 0,
      keywords: [],
      modelAnswer: '',
      markingBreakdown: [
        { marks: Math.ceil(maxMarks / 2), description: 'Chemical reactions and core equations' },
        { marks: Math.floor(maxMarks / 2) || 1, description: 'Clinical and therapeutic applications' },
      ],
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    setActiveQIdx(updated.length - 1);
    toast.success(`Question ${nextNum} added`);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.error('Exam blueprint must contain at least 1 question');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, number: i + 1 }));
    setQuestions(updated);
    if (activeQIdx >= updated.length) setActiveQIdx(Math.max(0, updated.length - 1));
    toast.success('Question removed');
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !activeQ) return;
    const currentKws = activeQ.keywords || [];
    updateActiveQuestion({ keywords: [...currentKws, newKeyword.trim()] });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kwIdx: number) => {
    if (!activeQ || !activeQ.keywords) return;
    updateActiveQuestion({ keywords: activeQ.keywords.filter((_, i) => i !== kwIdx) });
  };

  const handleSaveAndClose = () => {
    saveStoredQuestions(questions, examId);
    onQuestionsSaved(questions);
    toast.success('Updated question paper blueprint saved successfully!');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#ff5722] flex items-center justify-center font-medium">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-800 font-heading">
                Inspect &amp; Edit Question Scheme
              </h2>
              <p className="text-xs text-slate-500 font-normal">{examTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndClose}
              className="btn-primary btn-sm"
            >
              <Save size={14} /> Save Changes
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Column: Questions List */}
          <div className="w-full md:w-60 border-r border-slate-200 bg-slate-50/40 p-3.5 space-y-3 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
                Questions ({questions.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAddQuestion('MCQ')}
                  className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-200/80 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                  title="Add MCQ"
                >
                  +MCQ
                </button>
                <button
                  onClick={() => handleAddQuestion('SHORT')}
                  className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-200/80 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                  title="Add Short Essay"
                >
                  +Short
                </button>
                <button
                  onClick={() => handleAddQuestion('LONG')}
                  className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-200/80 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                  title="Add Long Calculation"
                >
                  +Long
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQIdx(idx)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    idx === activeQIdx
                      ? 'bg-white border-[#ff5722] shadow-xs text-slate-900 font-medium'
                      : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-5 w-5 rounded bg-orange-50 text-[#ff5722] border border-orange-200/80 flex items-center justify-center font-mono text-[10px] shrink-0 font-medium">
                      Q{q.number}
                    </span>
                    <span className="truncate text-xs font-normal">
                      {q.text ? q.text.slice(0, 22) + '...' : `Question ${q.number}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 font-normal">
                    {q.maxMarks}M
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Active Question Editor */}
          {activeQ && (
            <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-orange font-mono font-medium">
                    Q{activeQ.number}
                  </span>
                  <input
                    type="text"
                    value={activeQ.sectionLabel}
                    onChange={(e) => updateActiveQuestion({ sectionLabel: e.target.value })}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <select
                    value={activeQ.type}
                    onChange={(e) => updateActiveQuestion({ type: e.target.value as any })}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="SHORT">Short Essay</option>
                    <option value="LONG">Long Derivation</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 font-normal">Marks:</span>
                    <input
                      type="number"
                      value={activeQ.maxMarks}
                      onChange={(e) => updateActiveQuestion({ maxMarks: Number(e.target.value) })}
                      className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-center font-mono bg-white"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveQuestion(activeQIdx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="form-label font-medium">
                  Question Text
                </label>
                <textarea
                  rows={2}
                  value={activeQ.text}
                  onChange={(e) => updateActiveQuestion({ text: e.target.value })}
                  placeholder="Enter question text..."
                  className="form-input text-xs font-normal"
                />
              </div>

              {/* MCQ Options */}
              {activeQ.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="form-label font-medium">
                    MCQ Choices &amp; Correct Answer
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((optKey, optIdx) => (
                      <div
                        key={optKey}
                        className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <input
                          type="radio"
                          name="correct-opt"
                          checked={activeQ.correctAnswer === optKey}
                          onChange={() => updateActiveQuestion({ correctAnswer: optKey })}
                          className="accent-[#ff5722] cursor-pointer"
                        />
                        <span className="text-xs font-medium font-mono text-slate-600">{optKey})</span>
                        <input
                          type="text"
                          value={activeQ.options?.[optIdx] || ''}
                          onChange={(e) => {
                            const nextOpts = [...(activeQ.options || ['', '', '', ''])];
                            nextOpts[optIdx] = e.target.value;
                            updateActiveQuestion({ options: nextOpts });
                          }}
                          placeholder={`Option ${optKey}`}
                          className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Answer */}
              <div className="space-y-1">
                <label className="form-label font-medium">
                  Model Solution / Reference Rubric
                </label>
                <textarea
                  rows={2}
                  value={activeQ.modelAnswer}
                  onChange={(e) => updateActiveQuestion({ modelAnswer: e.target.value })}
                  placeholder="Reference answer for auto-evaluator matching..."
                  className="form-input text-xs font-normal"
                />
              </div>

              {/* Target Keywords */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="form-label font-medium flex items-center gap-1.5">
                    <Tag size={13} className="text-[#ff5722]" /> Target AI Keywords
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(activeQ.keywords || []).map((kw, kwIdx) => (
                    <span
                      key={kwIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-normal border border-orange-200/80"
                    >
                      <span>{kw}</span>
                      <button
                        onClick={() => handleRemoveKeyword(kwIdx)}
                        className="hover:text-rose-600 font-bold text-[10px] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    placeholder="Type keyword and press Enter..."
                    className="form-input text-xs"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="btn-secondary btn-sm shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
