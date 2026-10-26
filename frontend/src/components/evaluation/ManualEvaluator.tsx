'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSheet, setCurrentSheet] = useState<AnswerSheet | undefined>(undefined);

  const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);

  // Metadata
  const [examSubject, setExamSubject] = useState<string>('');
  const [examTitle, setExamTitle] = useState<string>('');
  const [cohortName, setCohortName] = useState<string>('');

  // Evaluation states
  const [marksEntered, setMarksEntered] = useState<Record<string, number>>({});
  const [commentsEntered, setCommentsEntered] = useState<Record<string, string>>({});
  const [stepCheckedState, setStepCheckedState] = useState<Record<string, Record<number, boolean>>>({});

  // Fetch real answer sheet & questions from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    async function fetchSheetData() {
      try {
        setLoading(true);
        const res = await apiClient.get(`/evaluation/${sheetId}`);
        const data = res.data;
        const sheet = data.sheet;

        if (sheet && isMounted) {
          // 1. Extract Exam & Subject Metadata
          if (sheet.exam?.subject?.name) {
            setExamSubject(`${sheet.exam.subject.name} (${sheet.exam.subject.code || ''})`.trim());
          }
          if (sheet.exam?.title) {
            setExamTitle(sheet.exam.title);
          }
          if (sheet.exam?.class?.name) {
            setCohortName(`${sheet.exam.class.name}${sheet.student?.section?.name ? ` - ${sheet.student.section.name}` : ''}`);
          }

          // 2. Map Database Questions
          let mappedQuestions: Question[] = [];
          const paperQuestions = sheet.exam?.papers?.[0]?.questions;
          if (Array.isArray(paperQuestions) && paperQuestions.length > 0) {
            mappedQuestions = paperQuestions.map((q: any) => ({
              id: q.id || `q-${q.questionNumber}`,
              section: q.sectionName?.includes('B') ? 'B' : 'A',
              sectionLabel: q.sectionName || `Section ${q.questionNumber}`,
              number: q.questionNumber,
              type: (q.maxScore <= 2 ? 'SHORT' : 'LONG') as any,
              text: q.questionText,
              options: null,
              correctAnswer: null,
              maxMarks: q.maxScore || 10,
              negativeMark: 0,
              keywords: q.rubricGuide
                ? q.rubricGuide.split(' ').filter((w: string) => w.length > 5).slice(0, 4)
                : [],
              modelAnswer: q.modelAnswer || q.rubricGuide || 'Refer to model answer rubric.',
              markingBreakdown: [
                { marks: Math.round((q.maxScore || 10) * 0.4 * 10) / 10, description: 'Conceptual approach & intermediate steps' },
                { marks: Math.round((q.maxScore || 10) * 0.6 * 10) / 10, description: 'Final derivation & accuracy' },
              ],
              answerAreaBoundingBox: { pageNo: 1, top: 20, left: 10, width: 80, height: 40 },
            }));
            setQuestions(mappedQuestions);
            if (mappedQuestions[0]?.id) {
              setCurrentQuestionId(mappedQuestions[0].id);
            }
          }

          // 3. Map Database AnswerSheet
          const mappedSheet: AnswerSheet = {
            id: sheet.id,
            examId: sheet.examId,
            studentId: sheet.studentId || sheet.student?.id || '',
            studentName: sheet.student?.user?.name || `Candidate (${sheet.sheetCode})`,
            studentInitials: sheet.student?.user?.name
              ? sheet.student.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'SC',
            studentColor: 'bg-teal-600',
            rollNo: sheet.student?.rollNo || sheet.sheetCode,
            className: `${sheet.exam?.class?.name || 'Cohort'}${sheet.student?.section?.name ? ` (${sheet.student.section.name})` : ''}`,
            status: sheet.evaluationStatus === 'FINALIZED' ? 'EVALUATED' : 'READY',
            uploadedAt: sheet.createdAt,
            totalMarks: sheet.finalScore ?? undefined,
            totalMaxMarks: sheet.exam?.maxMarks || 100,
            pages: (sheet.pages && sheet.pages.length > 0)
              ? sheet.pages.map((p: any) => ({
                  pageNo: p.pageNumber,
                  imageUrl: p.imageUrl,
                  thumbnailUrl: p.imageUrl,
                  ocrText: p.ocrRawText || '',
                }))
              : [],
            aiEvaluation: {
              status: 'COMPLETE',
              totalAISuggestedMarks: sheet.aiTotalScore || 0,
              totalMaxMarks: sheet.exam?.maxMarks || 100,
              aiSuggestedPercentage: sheet.percentage || 0,
              answers: [],
            },
          };
          setCurrentSheet(mappedSheet);

          // 4. Populate existing marks from database evaluations
          if (Array.isArray(sheet.questionEvaluations) && sheet.questionEvaluations.length > 0) {
            const initialMarks: Record<string, number> = {};
            const initialComments: Record<string, string> = {};
            sheet.questionEvaluations.forEach((qe: any) => {
              const qKey = mappedQuestions.find((mq) => mq.number === qe.questionNumber)?.id || `q-${qe.questionNumber}`;
              initialMarks[qKey] = qe.teacherMarks !== null && qe.teacherMarks !== undefined ? qe.teacherMarks : (qe.aiSuggestedMarks || 0);
              if (qe.teacherComment) initialComments[qKey] = qe.teacherComment;
            });
            setMarksEntered(initialMarks);
            setCommentsEntered(initialComments);
          }
        }
      } catch (err) {
        console.warn('Using existing local data for evaluator workspace:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSheetData();
    return () => {
      isMounted = false;
    };
  }, [sheetId]);

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

  // Submit evaluation directly to PostgreSQL database
  const handleSaveEvaluation = async (markAsFinal: boolean) => {
    setSaving(true);
    try {
      const evaluations = questions.map((q) => ({
        questionNumber: q.number,
        marksAwarded: Number(marksEntered[q.id]) || 0,
        maxMarks: q.maxMarks,
        remarks: commentsEntered[q.id] || '',
      }));

      const res = await apiClient.post('/evaluation/submit', {
        answerSheetId: sheetId,
        evaluations,
        isDraft: !markAsFinal,
        overallRemarks: markAsFinal
          ? 'Verified & evaluated against official marking rubric.'
          : 'Draft progress saved in database.',
      });

      const data = res.data;
      if (!data?.success && data?.error) throw new Error(data.message || data.error || 'Failed to submit marks to database');

      // Also sync local cache
      updateSheetMarks(
        sheetId,
        marksEntered,
        commentsEntered,
        stepCheckedState,
        currentSheet?.annotations || [],
        markAsFinal
      );

      toast.success(
        markAsFinal
          ? `Script finalized in database! Total Score: ${data.obtainedMarks ?? data.totalMarksScored ?? ''} M (${data.grade || 'A'})`
          : 'Draft evaluation saved to PostgreSQL database.'
      );

      if (markAsFinal) {
        if (onBack) onBack();
        else router.back();
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save evaluation to database');
    } finally {
      setSaving(false);
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
                {examSubject}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              {cohortName} • {examTitle} • Digital Script Evaluation &amp; Moderation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuestionPaperModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            Question Paper &amp; Rubric
          </button>

          <button
            onClick={() => handleSaveEvaluation(false)}
            disabled={saving}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>

          <button
            onClick={() => handleSaveEvaluation(true)}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
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
          onOpenSubmitModal={() => handleSaveEvaluation(true)}
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
