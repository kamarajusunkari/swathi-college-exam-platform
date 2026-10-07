'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
} from 'lucide-react';
import {
  Question,
  AnswerSheet,
  getStoredQuestions,
  getSheetById,
  updateSheetMarks,
} from '@/lib/evaluation-data';
import QuestionSelector from './QuestionSelector';
import PaperViewer from './PaperViewer';
import MarksEntry from './MarksEntry';
import QuestionPaperAnswersModal from './QuestionPaperAnswersModal';
import { toast } from 'sonner';

interface ManualEvaluatorProps {
  sheetId: string;
  onBack?: () => void;
}

export default function ManualEvaluator({ sheetId, onBack }: ManualEvaluatorProps) {
  const router = useRouter();

  const [questions] = useState<Question[]>(() => getStoredQuestions());
  const [currentSheet, setCurrentSheet] = useState<AnswerSheet | undefined>(() => getSheetById(sheetId));

  const [currentQuestionId, setCurrentQuestionId] = useState<string>(
    () => questions[0]?.id || 'q-001'
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);

  // Evaluation states
  const [marksEntered, setMarksEntered] = useState<Record<string, number>>(() => {
    return currentSheet?.marksEntered || {
      'q-001': 1,
      'q-002': 1,
      'q-003': 4.5,
      'q-004': 4.5,
      'q-005': 9.5,
      'q-006': 9.0,
    };
  });

  const [commentsEntered, setCommentsEntered] = useState<Record<string, string>>(() => {
    return currentSheet?.commentsEntered || {
      'q-003': 'Well structured reaction scheme with correct catalytic conditions.',
      'q-005': 'Excellent SAR derivations and biochemical rationale.',
    };
  });

  const [stepCheckedState, setStepCheckedState] = useState<Record<string, Record<number, boolean>>>(() => {
    return currentSheet?.stepBreakdownChecked || {
      'q-003': { 0: true, 1: true, 2: true, 3: true },
      'q-005': { 0: true, 1: true, 2: true, 3: true },
    };
  });

  const currentQIndex = questions.findIndex((q) => q.id === currentQuestionId);
  const currentQuestion = questions[currentQIndex] || questions[0];

  const isFirstQuestion = currentQIndex === 0;
  const isLastQuestion = currentQIndex === questions.length - 1;

  const handleSelectQuestion = (qId: string) => {
    setCurrentQuestionId(qId);
    const targetQ = questions.find((q) => q.id === qId);
    if (targetQ?.answerAreaBoundingBox?.pageNo) {
      setCurrentPage(targetQ.answerAreaBoundingBox.pageNo);
    }
  };

  const handleUpdateMarks = (qId: string, marks: number) => {
    setMarksEntered((prev) => ({ ...prev, [qId]: marks }));
  };

  const handleUpdateComment = (qId: string, comment: string) => {
    setCommentsEntered((prev) => ({ ...prev, [qId]: comment }));
  };

  const handleToggleStep = (stepIndex: number, stepMarks: number) => {
    setStepCheckedState((prev) => {
      const qSteps = { ...(prev[currentQuestionId] || {}) };
      qSteps[stepIndex] = !qSteps[stepIndex];

      const currentQ = questions.find((q) => q.id === currentQuestionId);
      if (currentQ?.markingBreakdown) {
        let total = 0;
        currentQ.markingBreakdown.forEach((step, idx) => {
          if (qSteps[idx]) total += step.marks;
        });
        handleUpdateMarks(currentQuestionId, total);
      }

      return { ...prev, [currentQuestionId]: qSteps };
    });
  };

  const handleSaveDraft = () => {
    updateSheetMarks(
      sheetId,
      marksEntered,
      commentsEntered,
      stepCheckedState,
      currentSheet?.annotations || [],
      false
    );
    toast.success('Evaluation progress saved as draft.');
  };

  const handleFinalize = () => {
    updateSheetMarks(
      sheetId,
      marksEntered,
      commentsEntered,
      stepCheckedState,
      currentSheet?.annotations || [],
      true
    );
    toast.success('Script marks finalized and submitted to Examination Cell!');
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : router.back())}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-800 font-heading">
                {currentSheet?.studentName || 'Student Candidate'} ({currentSheet?.rollNo || 'SWC-ROLL-001'})
              </h1>
              <span className="badge-orange font-mono text-[11px]">
                Medicinal Chemistry-II (BP501T)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              B.Pharm V-Semester • Digital Script Evaluation &amp; Moderation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuestionPaperModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition"
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            Question Paper & Rubric
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          <button
            onClick={handleFinalize}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalize Evaluation
          </button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Questions List */}
        <QuestionSelector
          questions={questions}
          currentQuestionId={currentQuestionId}
          onSelectQuestion={handleSelectQuestion}
          marksEntered={marksEntered}
          onOpenSubmitModal={handleFinalize}
        />

        {/* Center: Interactive Paper Canvas */}
        <PaperViewer
          sheet={currentSheet}
          questions={questions}
          currentQuestionId={currentQuestionId}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          marksEntered={marksEntered}
        />

        {/* Right: Marks Entry & Rubric Steps */}
        <MarksEntry
          question={currentQuestion}
          sheet={currentSheet}
          currentMarks={marksEntered[currentQuestionId]}
          onUpdateMarks={handleUpdateMarks}
          currentComment={commentsEntered[currentQuestionId] || ''}
          onUpdateComment={handleUpdateComment}
          stepCheckedState={stepCheckedState[currentQuestionId] || {}}
          onToggleStep={handleToggleStep}
          onOpenModelAnswer={() => setShowQuestionPaperModal(true)}
          onNextQuestion={() => {
            if (!isLastQuestion) handleSelectQuestion(questions[currentQIndex + 1].id);
          }}
          onPrevQuestion={() => {
            if (!isFirstQuestion) handleSelectQuestion(questions[currentQIndex - 1].id);
          }}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
        />
      </div>

      {/* Model Answer / Question Paper Reference Modal */}
      <QuestionPaperAnswersModal
        isOpen={showQuestionPaperModal}
        onClose={() => setShowQuestionPaperModal(false)}
        questions={questions}
      />
    </div>
  );
}
