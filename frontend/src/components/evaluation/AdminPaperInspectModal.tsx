"use client";

import React, { useState } from "react";
import {
  FileText,
  Lock,
  Unlock,
  Edit3,
  Eye,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Clock,
  Calendar,
  Layers,
  X,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  useUpdateExamMutation,
  useTogglePaperReleaseMutation,
} from "@/features/exams/exams.queries";
import { updateExamSchema } from "@/features/exams/exams.schema";

interface QuestionItemData {
  id?: string;
  questionNumber: number;
  sectionName?: string;
  questionText: string;
  maxScore: number;
  rubricGuide?: string | null;
  modelAnswer?: string | null;
  type?: "MCQ" | "SHORT" | "LONG";
  markingBreakdown?: { marks: number; description: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exam: any;
  onExamUpdated?: (updatedExam: any) => void;
}

export default function AdminPaperInspectModal({
  isOpen,
  onClose,
  exam,
  onExamUpdated,
}: Props) {
  if (!isOpen || !exam) return null;

  // --- TanStack Query Mutations ---
  const updateExamMutation = useUpdateExamMutation();
  const togglePaperReleaseMutation = useTogglePaperReleaseMutation();

  const paper = exam.papers?.[0];
  const uploader = paper?.uploadedBy;
  const isTeacher = uploader?.role === "TEACHER";
  const isReleased = paper?.isReleased || paper?.status === "RELEASED" || exam.releaseStatus === "RELEASED";

  const [mode, setMode] = useState<"VIEW" | "EDIT">("VIEW");
  const saving = updateExamMutation.isPending;
  const releasing = togglePaperReleaseMutation.isPending;

  // Form State for editing
  const [title, setTitle] = useState(exam.title || "");
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes || 180);
  const [passMarks, setPassMarks] = useState(exam.passMarks || 35);
  const [instructions, setInstructions] = useState(exam.instructions || "");

  // Parse questions
  const parseQuestions = (): QuestionItemData[] => {
    if (paper?.questions && Array.isArray(paper.questions) && paper.questions.length > 0) {
      return paper.questions.map((q: any) => {
        let breakdown: { marks: number; description: string }[] = [];
        try {
          if (q.rubricGuide) {
            breakdown = JSON.parse(q.rubricGuide);
          }
        } catch {
          breakdown = [{ marks: q.maxScore || 1, description: "Standard evaluation criteria" }];
        }
        return {
          id: q.id,
          questionNumber: q.questionNumber,
          sectionName: q.sectionName || "Section A",
          questionText: q.questionText || "",
          maxScore: Number(q.maxScore) || 1,
          rubricGuide: q.rubricGuide,
          modelAnswer: q.modelAnswer || "",
          type: (q.maxScore === 1 ? "MCQ" : q.maxScore <= 5 ? "SHORT" : "LONG") as any,
          markingBreakdown: Array.isArray(breakdown) ? breakdown : [],
        };
      });
    }

    return [];
  };

  const [questions, setQuestions] = useState<QuestionItemData[]>(parseQuestions);

  const totalCalculatedMarks = questions.reduce(
    (acc, q) => acc + (Number(q.maxScore) || 0),
    0
  );

  const handleAddQuestion = (type: "MCQ" | "SHORT" | "LONG") => {
    const nextNum = questions.length + 1;
    const maxScore = type === "MCQ" ? 1 : type === "SHORT" ? 5 : 10;
    const newQ: QuestionItemData = {
      questionNumber: nextNum,
      sectionName: nextNum <= 2 ? "Section A" : nextNum <= 4 ? "Section B" : "Section C",
      questionText: "",
      maxScore,
      modelAnswer: "",
      type,
      markingBreakdown: [
        { marks: Math.ceil(maxScore / 2), description: "Criterion 1: Theoretical formula & structure" },
        { marks: Math.floor(maxScore / 2) || 1, description: "Criterion 2: Applications & rationale" },
      ],
    };
    setQuestions([...questions, newQ]);
    toast.success(`Question ${nextNum} added`);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions
      .filter((_, i) => i !== index)
      .map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setQuestions(updated);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuestionItemData>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const handleAddBreakdownStep = (qIdx: number) => {
    const q = questions[qIdx];
    const steps = q.markingBreakdown ? [...q.markingBreakdown] : [];
    steps.push({ marks: 1, description: `Step ${steps.length + 1}: Criteria description` });
    handleUpdateQuestion(qIdx, { markingBreakdown: steps });
  };

  const handleRemoveBreakdownStep = (qIdx: number, sIdx: number) => {
    const q = questions[qIdx];
    if (!q.markingBreakdown) return;
    const steps = q.markingBreakdown.filter((_, i) => i !== sIdx);
    handleUpdateQuestion(qIdx, { markingBreakdown: steps });
  };

  const handleUpdateBreakdownStep = (
    qIdx: number,
    sIdx: number,
    updates: { marks?: number; description?: string }
  ) => {
    const q = questions[qIdx];
    if (!q.markingBreakdown) return;
    const steps = [...q.markingBreakdown];
    steps[sIdx] = { ...steps[sIdx], ...updates };
    handleUpdateQuestion(qIdx, { markingBreakdown: steps });
  };

  const handleSaveChanges = async () => {
    const payload = {
      id: exam.id,
      title,
      durationMinutes: Number(durationMinutes),
      passMarks: Number(passMarks),
      instructions,
      maxMarks: totalCalculatedMarks,
      questions: questions.map((q) => ({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        maxScore: q.maxScore,
        modelAnswer: q.modelAnswer || undefined,
        section: q.sectionName || "Section A",
        rubricGuide: q.markingBreakdown ? JSON.stringify(q.markingBreakdown) : undefined,
      })),
    };

    const parseResult = updateExamSchema.safeParse(payload);
    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      const data = await updateExamMutation.mutateAsync({
        id: exam.id,
        payload: {
          title,
          durationMinutes: Number(durationMinutes),
          passMarks: Number(passMarks),
          instructions,
          maxMarks: totalCalculatedMarks,
          questions: questions.map((q) => ({
            questionNumber: q.questionNumber,
            sectionName: q.sectionName,
            text: q.questionText,
            maxMarks: q.maxScore,
            modelAnswer: q.modelAnswer,
            markingBreakdown: q.markingBreakdown,
          })),
        },
      });

      toast.success(`Question blueprint for "${title}" updated & approved!`);
      if (onExamUpdated && data?.exam) {
        onExamUpdated(data.exam);
      }
      setMode("VIEW");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || "Network error while updating blueprint");
    }
  };

  const handleReleasePaper = async () => {
    try {
      await togglePaperReleaseMutation.mutateAsync({
        examId: exam.id,
        paperId: paper?.id,
        release: true,
      });

      toast.success(`Question paper for "${exam.title}" released to examination nodes!`);
      if (onExamUpdated) {
        onExamUpdated({ ...exam, releaseStatus: "RELEASED", status: "ACTIVE" });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || "Failed to release paper");
    }
  };

  return (
    <div className="modal-overlay z-50">
      <div className="modal-box max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-200">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                {exam.examCode}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {exam.subject?.code || "COURSE-CODE"}
              </span>
              {isTeacher && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 font-mono">
                  FACULTY AUTHOR: {uploader?.name}
                </span>
              )}
              {isReleased ? (
                <span className="badge-emerald font-mono text-[10px]">
                  <Unlock className="w-3 h-3 text-emerald-400" /> Released
                </span>
              ) : (
                <span className="badge-amber font-mono text-[10px]">
                  <Lock className="w-3 h-3 text-amber-400" /> 2-Hr Vault Secured
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
              {mode === "EDIT" ? "Modify Question Blueprint" : exam.title}
            </h2>
            <p className="text-xs text-slate-400">
              {exam.class?.name} • {exam.academicYear?.name} • Total: {totalCalculatedMarks} Marks
            </p>
          </div>

          {/* Action Tabs / Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setMode("VIEW")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  mode === "VIEW"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Blueprint</span>
              </button>

              <button
                onClick={() => setMode("EDIT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  mode === "EDIT"
                    ? "bg-[#ff5722] text-white font-bold shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit &amp; Modify</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* ──────── VIEW MODE ──────── */}
          {mode === "VIEW" && (
            <div className="space-y-6">
              {/* Metadata Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Subject</span>
                  <p className="font-semibold text-slate-800">{exam.subject?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Date &amp; Time</span>
                  <p className="font-semibold text-slate-800 font-mono">
                    {formatDate(exam.examDate)} ({exam.startTime} – {exam.endTime})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Duration</span>
                  <p className="font-semibold text-slate-800 font-mono">{exam.durationMinutes} Minutes</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Pass Marks / Total</span>
                  <p className="font-semibold text-slate-800 font-mono">
                    {exam.passMarks} / {totalCalculatedMarks} Marks
                  </p>
                </div>
              </div>

              {/* Author & Vault Status Alert */}
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-orange-100 text-[#ff5722] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Author Attribution: {uploader?.name || "Admin Exam Cell"} ({uploader?.role || "EXAM_CELL"})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isReleased
                        ? "Question paper is currently RELEASED for printing & examination centers."
                        : "Question paper is safely encrypted in vault. 2-Hour controlled countdown active."}
                    </p>
                  </div>
                </div>

                {!isReleased && (
                  <button
                    onClick={handleReleasePaper}
                    disabled={releasing}
                    className="btn-primary btn-sm shrink-0"
                  >
                    {releasing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                    <span>Authorize 2-Hr Release</span>
                  </button>
                )}
              </div>

              {/* Questions List Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Question Paper Hierarchy &amp; AI Rubric Steps ({questions.length} Questions)
                  </h3>
                  <span className="badge-orange font-mono text-xs">
                    {totalCalculatedMarks} Total Marks
                  </span>
                </div>

                <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">No questions in blueprint yet.</p>
                      <p className="text-xs text-slate-400">Switch to "Edit & Modify" mode to add questions and marking rubrics.</p>
                    </div>
                  ) : (
                    questions.map((q) => (
                    <div
                      key={q.questionNumber}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-md bg-orange-50 text-[#ff5722] font-mono font-bold text-xs flex items-center justify-center">
                            Q{q.questionNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 font-mono">
                            {q.sectionName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge-slate font-mono text-[10px]">
                            {q.type || "THEORY"}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                            {q.maxScore} Marks
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        {q.questionText}
                      </p>

                      {q.modelAnswer && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Model Answer / Reference Derivation
                          </span>
                          <p className="text-slate-700 text-xs">{q.modelAnswer}</p>
                        </div>
                      )}

                      {q.markingBreakdown && q.markingBreakdown.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Step-by-Step Rubrics
                          </span>
                          <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl border border-slate-100 px-3">
                            {q.markingBreakdown.map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className="py-1.5 flex items-center justify-between text-xs text-slate-600"
                              >
                                <span>{step.description}</span>
                                <span className="font-mono font-bold text-slate-800">
                                  {step.marks} M
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )))}
                </div>
              </div>
            </div>
          )}

          {/* ──────── EDIT & MODIFY MODE ──────── */}
          {mode === "EDIT" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Admin Modification Mode
                </p>
                <p className="text-purple-700">
                  You are editing the question blueprint created by <strong>{uploader?.name || "Faculty"}</strong>. Any modifications to question text, marks, or step rubrics will be saved to the database and logged in the audit trail.
                </p>
              </div>

              {/* Exam Metadata Edit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="sm:col-span-3 space-y-1">
                  <label className="form-label font-medium text-xs">Examination Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label font-medium text-xs">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="form-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label font-medium text-xs">Pass Marks</label>
                  <input
                    type="number"
                    value={passMarks}
                    onChange={(e) => setPassMarks(Number(e.target.value))}
                    className="form-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label font-medium text-xs">Total Marks (Auto-calculated)</label>
                  <input
                    type="text"
                    disabled
                    value={`${totalCalculatedMarks} Marks`}
                    className="form-input text-xs bg-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Interactive Question Items Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Modify Questions &amp; Rubrics
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion("MCQ")}
                      className="btn-outline btn-sm"
                    >
                      + MCQ (1M)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion("SHORT")}
                      className="btn-outline btn-sm"
                    >
                      + Short (5M)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion("LONG")}
                      className="btn-outline btn-sm"
                    >
                      + Long (10M)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.questionNumber}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="h-7 w-7 rounded-lg bg-orange-50 text-[#ff5722] border border-orange-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            Q{q.questionNumber}
                          </span>
                          <input
                            type="text"
                            value={q.sectionName}
                            onChange={(e) =>
                              handleUpdateQuestion(qIdx, { sectionName: e.target.value })
                            }
                            placeholder="Section Name (e.g. Section A)"
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500 font-normal">Marks:</span>
                          <input
                            type="number"
                            min="0.5"
                            max="30"
                            step="0.5"
                            value={q.maxScore}
                            onChange={(e) =>
                              handleUpdateQuestion(qIdx, { maxScore: Number(e.target.value) })
                            }
                            className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-center font-mono font-bold text-xs bg-white"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <textarea
                        rows={2}
                        value={q.questionText}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, { questionText: e.target.value })
                        }
                        placeholder="Enter modified question text..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/15 focus:border-[#ff5722]"
                      />

                      {/* Model Answer */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Model Answer / Reference Derivation
                        </label>
                        <textarea
                          rows={2}
                          value={q.modelAnswer || ""}
                          onChange={(e) =>
                            handleUpdateQuestion(qIdx, { modelAnswer: e.target.value })
                          }
                          placeholder="Correct solution and scientific rationale..."
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-normal"
                        />
                      </div>

                      {/* Step Rubrics Breakdown */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                            Rubric Steps Breakdown
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddBreakdownStep(qIdx)}
                            className="text-xs font-semibold text-[#ff5722] hover:underline cursor-pointer"
                          >
                            + Add Step
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {(q.markingBreakdown || []).map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 text-xs">
                              <input
                                type="text"
                                value={step.description}
                                onChange={(e) =>
                                  handleUpdateBreakdownStep(qIdx, sIdx, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Rubric criterion description..."
                                className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                              />
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={step.marks}
                                onChange={(e) =>
                                  handleUpdateBreakdownStep(qIdx, sIdx, {
                                    marks: Number(e.target.value),
                                  })
                                }
                                className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-center font-mono font-bold text-xs bg-slate-50"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBreakdownStep(qIdx, sIdx)}
                                className="text-slate-400 hover:text-rose-600 px-1 cursor-pointer font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="btn-outline btn-sm"
          >
            Close
          </button>

          {mode === "EDIT" ? (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save &amp; Approve Modifications</span>
            </button>
          ) : (
            <button
              onClick={() => setMode("EDIT")}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modify Paper Blueprint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
