'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  PenTool,
  Bot,
  Layers,
  BarChart3,
  Eye,
  Sparkles,
  UploadCloud,
  BookOpen,
  Edit3,
  Plus,
  Search,
  Camera,
  GraduationCap,
  Calendar,
  Sliders,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  X,
  RefreshCw,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import {
  INITIAL_QUESTIONS,
  AnswerSheet,
  Question,
  getStoredSheets,
  saveStoredSheets,
} from '@/lib/evaluation-data';
import AutoEvaluator from '@/components/evaluation/AutoEvaluator';
import StudentPaperModal from '@/components/evaluation/StudentPaperModal';
import UploadZone from '@/components/evaluation/UploadZone';
import CameraScanner from '@/components/evaluation/CameraScanner';
import AdminPaperInspectModal from '@/components/evaluation/AdminPaperInspectModal';
import ManualEvaluator from '@/components/evaluation/ManualEvaluator';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Props {
  initialExams?: any[];
  dbSheets?: any[];
  allStudents?: any[];
  userRole?: string;
  currentUser?: any;
}

export function TeacherEvaluationClient({
  initialExams = [],
  dbSheets = [],
  allStudents = [],
  userRole = 'TEACHER',
  currentUser,
}: Props) {
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // Exams State
  const [examsList, setExamsList] = useState<any[]>(() => {
    if (initialExams && initialExams.length > 0) return initialExams;
    return [];
  });

  const [activeExamId, setActiveExamId] = useState<string>(() => {
    if (initialExams && initialExams.length > 0) return initialExams[0].id;
    return '';
  });

  // Selected Exam
  const activeExam = useMemo(() => {
    return examsList.find((e) => e.id === activeExamId) || examsList[0] || null;
  }, [examsList, activeExamId]);

  // View Modes: 'HUB' | 'AI_REVIEW' | 'MANUAL_3PANEL'
  const [viewMode, setViewMode] = useState<'HUB' | 'AI_REVIEW' | 'MANUAL_3PANEL'>('HUB');
  const [activeManualSheetId, setActiveManualSheetId] = useState<string>('');

  // Modals & Drawers
  const [showBulkUploadDrawer, setShowBulkUploadDrawer] = useState(false);
  const [showPaperInspectModal, setShowPaperInspectModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<AnswerSheet | null>(null);
  const [studentForUpload, setStudentForUpload] = useState<any | null>(null);
  const [studentForCamera, setStudentForCamera] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPLOADED' | 'MISSING' | 'GRADED'>('ALL');
  const [isIngesting, setIsIngesting] = useState(false);

  // All Sheets List mapped from dbSheets or localStorage
  const [allSheets, setAllSheets] = useState<AnswerSheet[]>(() => {
    if (dbSheets && dbSheets.length > 0) {
      return dbSheets.map((s) => ({
        id: s.id,
        examId: s.examId,
        studentId: s.studentId || s.student?.id || `std-${s.id}`,
        studentName: s.student?.user?.name || s.sheetCode || 'Candidate',
        studentInitials: s.student?.user?.name
          ? s.student.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          : 'SC',
        studentColor: 'bg-teal-600',
        rollNo: s.student?.rollNo || s.sheetCode,
        className: `${s.student?.class?.name || 'Pharmacy Cohort'} ${s.student?.section?.name ? `(${s.student.section.name})` : ''}`.trim(),
        status: (s.evaluationStatus === 'FINALIZED' ? 'EVALUATED' : 'READY') as any,
        uploadedAt: s.createdAt,
        totalMarks: s.finalScore ?? undefined,
        totalMaxMarks: s.exam?.maxMarks || 100,
        pages: s.pages || [],
        aiEvaluation: {
          status: 'COMPLETE',
          totalAISuggestedMarks: s.aiTotalScore || 0,
          totalMaxMarks: s.exam?.maxMarks || 100,
          aiSuggestedPercentage: s.percentage || 0,
          answers: s.questionEvaluations?.map((qe: any) => ({
            questionId: qe.id,
            questionNo: qe.questionNumber,
            studentAnswer: '',
            aiSuggestedMarks: qe.aiSuggestedMarks || 0,
            maxMarks: qe.maxMarks,
            confidence: qe.aiConfidence || 0.95,
            aiComment: qe.aiFeedback || '',
            keywordsFound: [],
            keywordsMissed: [],
            teacherMarks: qe.teacherMarks,
            status: qe.isVerified ? 'ACCEPTED' : 'PENDING_REVIEW',
          })) || [],
        },
      }));
    }
    return getStoredSheets();
  });

  // Candidate roster for active exam: Enrolled class students + any students with existing sheets
  const enrolledStudents = useMemo(() => {
    if (!activeExam) return [];

    const classStudents = activeExam.class?.students || [];
    const matchingFromAll = allStudents.filter(
      (s: any) => s.classId === activeExam.classId || s.class?.id === activeExam.classId
    );

    const studentMap = new Map<string, any>();

    [...classStudents, ...matchingFromAll].forEach((st: any) => {
      const key = st.rollNo || st.id;
      if (key && !studentMap.has(key)) {
        studentMap.set(key, {
          id: st.id,
          studentId: st.studentId || st.rollNo,
          name: st.user?.name || st.name || `Candidate (${st.rollNo})`,
          rollNo: st.rollNo,
          email: st.user?.email || '',
          className: st.class?.name || activeExam.class?.name || 'B.Pharmacy Cohort',
          sectionName: st.section?.name || activeExam.section?.name || '',
          initials: (st.user?.name || st.name || 'SC').slice(0, 2).toUpperCase(),
        });
      }
    });

    // Also include any students who have sheets for this exam
    allSheets
      .filter((sh) => sh.examId === activeExam.id)
      .forEach((sh) => {
        const key = sh.rollNo || sh.studentId;
        if (key && !studentMap.has(key)) {
          studentMap.set(key, {
            id: sh.studentId || sh.id,
            studentId: sh.studentId || sh.rollNo,
            name: sh.studentName,
            rollNo: sh.rollNo,
            email: '',
            className: sh.className,
            sectionName: '',
            initials: sh.studentInitials || 'SC',
          });
        }
      });

    return Array.from(studentMap.values()).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [activeExam, allStudents, allSheets]);

  // Questions for active exam
  const examQuestions: Question[] = useMemo(() => {
    if (activeExam?.papers?.[0]?.questions?.length > 0) {
      return activeExam.papers[0].questions.map((q: any) => ({
        id: q.id,
        number: q.questionNumber,
        section: q.sectionName || 'A',
        sectionLabel: q.sectionName || 'Section A',
        type: (q.type || (q.maxScore <= 1 ? 'MCQ' : q.maxScore <= 5 ? 'SHORT' : 'LONG')) as any,
        text: q.questionText,
        options: null,
        correctAnswer: null,
        maxMarks: q.maxScore,
        negativeMark: 0,
        keywords: q.rubricGuide ? q.rubricGuide.split(',').map((k: string) => k.trim()) : [],
        modelAnswer: q.modelAnswer || 'Model answer guidelines registered by department faculty.',
      }));
    }
    return INITIAL_QUESTIONS;
  }, [activeExam]);

  // Exam sheets
  const examSheets = useMemo(() => {
    if (!activeExam) return allSheets;
    return allSheets.filter((s) => !s.examId || s.examId === activeExam.id || s.examId === 'exam-current');
  }, [allSheets, activeExam]);

  const totalMaxMarks = activeExam?.maxMarks || 100;
  const totalEnrolled = enrolledStudents.length;
  const totalUploaded = enrolledStudents.filter((st) =>
    examSheets.some((s) => s.studentId === st.id || s.rollNo === st.rollNo)
  ).length;
  const missingCount = totalEnrolled - totalUploaded;
  const gradedCount = enrolledStudents.filter((st) => {
    const s = examSheets.find((sh) => sh.studentId === st.id || sh.rollNo === st.rollNo);
    return s && (s.status === 'EVALUATED' || s.totalMarks !== undefined);
  }).length;

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter((st) => {
      const sheet = examSheets.find((s) => s.studentId === st.id || s.rollNo === st.rollNo);
      const isUploaded = !!sheet;
      const isGraded = sheet && (sheet.status === 'EVALUATED' || sheet.totalMarks !== undefined);

      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.email && st.email.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'UPLOADED') matchesStatus = isUploaded;
      else if (statusFilter === 'MISSING') matchesStatus = !isUploaded;
      else if (statusFilter === 'GRADED') matchesStatus = !!isGraded;

      return matchesSearch && matchesStatus;
    });
  }, [enrolledStudents, examSheets, searchQuery, statusFilter]);

  // Upload Answer Sheet for a Specific Student
  const handleUploadForStudent = async (student: any, files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const sheetId = `sheet-${Date.now()}-${student.rollNo}`;

    const newSheet: AnswerSheet = {
      id: sheetId,
      examId: activeExam?.id || 'exam-current',
      studentId: student.id,
      studentName: student.name,
      studentInitials: student.initials || 'SC',
      studentColor: 'bg-teal-600',
      rollNo: student.rollNo,
      className: student.className || activeExam?.class?.name || 'B.Pharmacy',
      status: 'READY',
      uploadedAt: new Date().toISOString(),
      pages: [
        {
          pageNo: 1,
          imageUrl: null,
          thumbnailUrl: null,
          ocrText: `Uploaded Script: ${file.name} for ${student.name} (${student.rollNo})`,
        },
      ],
      aiEvaluation: {
        status: 'COMPLETE',
        totalAISuggestedMarks: 0,
        totalMaxMarks: totalMaxMarks,
        aiSuggestedPercentage: 0,
        answers: [],
      },
    };

    // DB Sync
    if (activeExam?.id) {
      try {
        await fetch('/api/answer-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: activeExam.id,
            sheets: [
              {
                studentId: student.id,
                sheetCode: sheetId,
                rollNo: student.rollNo,
                totalPages: 4,
              },
            ],
          }),
        });
      } catch (err) {
        console.warn('DB single sheet sync skipped:', err);
      }
    }

    // Replace if existing, or append
    const existingIndex = allSheets.findIndex(
      (s) => (s.examId === activeExam?.id || !s.examId) && (s.studentId === student.id || s.rollNo === student.rollNo)
    );

    let updated: AnswerSheet[];
    if (existingIndex >= 0) {
      updated = [...allSheets];
      updated[existingIndex] = newSheet;
    } else {
      updated = [...allSheets, newSheet];
    }

    setAllSheets(updated);
    saveStoredSheets(updated, activeExam?.id);
    setStudentForUpload(null);
    setStudentForCamera(null);
    toast.success(`Answer booklet uploaded for ${student.name} (${student.rollNo})!`);
  };

  // Bulk Upload Answer Sheets
  const handleBulkFilesSelected = async (files: File[]) => {
    setShowBulkUploadDrawer(false);
    setIsIngesting(true);

    try {
      const generatedSheets: AnswerSheet[] = files.map((file, idx) => {
        const id = `sheet-${Date.now()}-${idx + 1}`;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const matchingStudent = enrolledStudents[idx] || null;

        return {
          id,
          examId: activeExam?.id || 'exam-current',
          studentId: matchingStudent?.id || `std-${idx + 1}`,
          studentName: matchingStudent?.name || cleanName || `Candidate ${idx + 1}`,
          studentInitials: (matchingStudent?.initials || cleanName.slice(0, 2) || 'SC').toUpperCase(),
          studentColor: 'bg-teal-600',
          rollNo: matchingStudent?.rollNo || `SWC-2026-${String(idx + 1).padStart(3, '0')}`,
          className: activeExam?.class?.name || 'B.Pharmacy V-Sem',
          status: 'READY' as const,
          uploadedAt: new Date().toISOString(),
          totalPages: 4,
          pages: [
            {
              pageNo: 1,
              imageUrl: null,
              thumbnailUrl: null,
              ocrText: `Scanned Physical Script: ${file.name}`,
            },
          ],
          aiEvaluation: {
            status: 'COMPLETE' as const,
            totalAISuggestedMarks: 0,
            totalMaxMarks: totalMaxMarks,
            aiSuggestedPercentage: 0,
            answers: [],
          },
        };
      });

      if (activeExam?.id) {
        try {
          await fetch('/api/answer-sheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId: activeExam.id,
              sheets: generatedSheets.map((s) => ({
                studentId: s.studentId,
                sheetCode: s.id,
                rollNo: s.rollNo,
                totalPages: 4,
              })),
            }),
          });
        } catch (dbErr) {
          console.warn('API answer sheets sync skipped:', dbErr);
        }
      }

      const updated = [...allSheets, ...generatedSheets];
      setAllSheets(updated);
      saveStoredSheets(updated, activeExam?.id);
      toast.success(`Successfully uploaded ${files.length} answer script(s) for ${activeExam?.title || 'Exam'}!`);
    } catch (err: any) {
      toast.error('Failed to catalog answer sheets.');
    } finally {
      setIsIngesting(false);
    }
  };

  // Launch 3-Panel Manual Evaluation
  const handleLaunchManual = (sheetId?: string) => {
    const targetId = sheetId || (examSheets.find((s) => s.status !== 'EVALUATED')?.id || examSheets[0]?.id);
    if (!targetId) {
      toast.error('No answer sheets available to evaluate. Please upload a student answer booklet first.');
      return;
    }
    setActiveManualSheetId(targetId);
    setViewMode('MANUAL_3PANEL');
  };

  // If in 3-Panel Manual Evaluator Mode
  if (viewMode === 'MANUAL_3PANEL') {
    return (
      <div className="space-y-4">
        <ManualEvaluator
          sheetId={activeManualSheetId}
          onBack={() => setViewMode('HUB')}
        />
      </div>
    );
  }

  // If in AI Auto-Evaluation Mode
  if (viewMode === 'AI_REVIEW') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('HUB')}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition font-medium text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-teal-600" />
              <span>Back to Assessment Hub</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                AI Auto-Evaluation Review Desk — {activeExam?.title || 'Examination'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Review OCR confidence scores and verify automated step-mark assignments before final moderation.
              </p>
            </div>
          </div>
        </div>

        <AutoEvaluator
          sheets={examSheets}
          questions={examQuestions}
          onCompleteBatch={() => {
            toast.success('Batch AI Evaluation completed for all scripts!');
            setViewMode('HUB');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
            <FileCheck2 className="w-4 h-4 text-teal-600" />
            <span>Swathi College of Pharmacy • Digital Evaluation &amp; Moderation Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-heading">
            Examinations &amp; Script Evaluation Desk
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Select an assessment to view enrolled class students, upload individual or bulk answer sheets, and choose AI or 3-panel manual evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={isAdmin ? '/admin/exams/create' : '/teacher/exams/create'}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-700/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Exam Blueprint</span>
          </Link>
        </div>
      </div>

      {/* ── STEP 1: EXAM SELECTOR / TABS ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>1. Select Examination ({examsList.length})</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any exam to view its enrolled class roster and uploaded sheets</span>
        </div>

        {examsList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Examinations Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Create an exam blueprint with question papers and rubrics to begin evaluation.
              </p>
            </div>
            <Link
              href={isAdmin ? '/admin/exams/create' : '/teacher/exams/create'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create First Exam</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examsList.map((exam) => {
              const isSelected = activeExam?.id === exam.id;
              const count = allSheets.filter((s) => s.examId === exam.id).length;
              const evalCount = allSheets.filter((s) => s.examId === exam.id && (s.status === 'EVALUATED' || s.totalMarks !== undefined)).length;

              return (
                <div
                  key={exam.id}
                  onClick={() => setActiveExamId(exam.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-teal-500/50'
                      : 'bg-white text-slate-800 border-slate-200/90 hover:border-teal-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {exam.subject?.code || exam.examCode || 'EXAM'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/15 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {exam.class?.name || 'B.Pharmacy'}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold mt-2 font-heading line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {exam.title}
                  </h3>

                  <div className={`flex items-center gap-3 text-xs mt-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      {exam.examDate ? formatDate(exam.examDate) : 'Exam Day'}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-teal-400">
                      {exam.maxMarks || 100} Marks
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-200/20 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                      Scripts: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{count} Uploaded</strong>
                    </span>
                    <span className="font-bold text-teal-400">
                      {count > 0 ? `${Math.round((evalCount / count) * 100)}% Graded` : '0 Uploaded'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── STEP 2: ACTIVE EXAM DETAILS HERO BANNER ──────────────── */}
      {activeExam && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold font-mono">
                  {activeExam.examCode || 'EXAM-2026'}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-medium">
                  {activeExam.class?.name || 'B.Pharmacy'} {activeExam.section?.name ? `(${activeExam.section.name})` : ''} • {activeExam.academicYear?.name || '2026-2027'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Controlled 2-Hr Vault
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                  {activeExam.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Subject: <strong className="text-white">{activeExam.subject?.name || 'Core Pharmacy Subject'}</strong> ({activeExam.subject?.code || 'BP-CORE'}) • Duration: <strong className="text-white">{activeExam.durationMinutes || 180} mins</strong>
                </p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Enrolled</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{totalEnrolled} Students</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Booklets Uploaded</span>
                  <span className="text-base font-bold text-teal-400 mt-0.5 block">{totalUploaded} / {totalEnrolled}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Graded &amp; Verified</span>
                  <span className="text-base font-bold text-emerald-400 mt-0.5 block">{gradedCount} Graded</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Missing Booklets</span>
                  <span className="text-base font-bold text-amber-400 mt-0.5 block">{missingCount} Pending</span>
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0">
              <button
                onClick={() => setShowPaperInspectModal(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-white/15"
                title="Inspect Question Paper & Rubric Scheme"
              >
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>Check Paper &amp; Official Rubrics</span>
              </button>

              <button
                onClick={() => setShowPaperInspectModal(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-white/15"
                title="Modify Questions & Rubric Guide"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Questions &amp; Rubrics</span>
              </button>

              <button
                onClick={() => setShowBulkUploadDrawer(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ Bulk / Batch Upload Booklets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: EVALUATION CHOICE MODES (Not direct auto-AI) ──── */}
      {activeExam && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>2. Choose Evaluation Pathway</span>
            </h3>
            <span className="text-[11px] text-slate-400">Select assisted batch review or distraction-free manual scoring</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPTION 1: AI AUTO-EVALUATION REVIEW */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-purple-300 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono">
                    Option 1 • AI-Assisted Batch Mode
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    AI Auto-Evaluation Review Desk
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Scans handwriting &amp; chemical formulas against faculty rubrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Provides confidence scores and 1-click batch verification</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (totalUploaded === 0) {
                    toast.error('Please upload at least one student answer booklet first.');
                    return;
                  }
                  setViewMode('AI_REVIEW');
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Launch AI Evaluation Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* OPTION 2: 3-PANEL MANUAL EVALUATOR */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-teal-300 hover:shadow-md transition">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 font-bold">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                    Option 2 • Deep Focus Mode
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    3-Panel Manual Digital Evaluator
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Pannable high-res paper canvas with Red Pen annotations (✓, ✗, +Marks)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Side-by-side question rubrics, step marks, and instant grade synchronization</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleLaunchManual()}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                <span>Launch 3-Panel Manual Evaluator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: ENROLLED STUDENTS & INDIVIDUAL UPLOADS ───────── */}
      {activeExam && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                3. Enrolled Class Students &amp; Answer Booklets ({enrolledStudents.length})
              </h3>
              <p className="text-xs text-slate-500">
                Class roster for <strong className="text-slate-700">{activeExam.class?.name || 'Cohort'}</strong>. Upload individual student answer booklets or evaluate existing scripts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:outline-none w-48 transition"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  All ({enrolledStudents.length})
                </button>
                <button
                  onClick={() => setStatusFilter('UPLOADED')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'UPLOADED' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Uploaded ({totalUploaded})
                </button>
                <button
                  onClick={() => setStatusFilter('MISSING')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'MISSING' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Missing ({missingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('GRADED')}
                  className={`px-3 py-1 rounded-lg transition ${statusFilter === 'GRADED' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Graded ({gradedCount})
                </button>
              </div>

              <button
                onClick={() => setShowBulkUploadDrawer(true)}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ Bulk Upload</span>
              </button>
            </div>
          </div>

          {/* Bulk Upload Drawer */}
          {showBulkUploadDrawer && (
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-teal-700" />
                  <span>Bulk Ingest Answer Booklets for {activeExam.title}</span>
                </span>
                <button
                  onClick={() => setShowBulkUploadDrawer(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Close Upload Area
                </button>
              </div>
              <UploadZone onFilesSelected={handleBulkFilesSelected} isBulk={true} />
            </div>
          )}

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <div className="py-10 text-center space-y-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-slate-400" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No Students Found in this Class Cohort</h4>
                <p className="text-xs text-slate-500">
                  {searchQuery
                    ? 'No enrolled candidates match your search query.'
                    : `No students are currently mapped to ${activeExam.class?.name || 'this class'}. You can onboard students via Admin Portal.`}
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/admin/users/students"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard Students to {activeExam.class?.name || 'Cohort'}</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4 rounded-l-xl">Student Candidate</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Booklet Status</th>
                    <th className="py-3 px-4 text-center">AI Suggested</th>
                    <th className="py-3 px-4 text-center">Verified Score</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const sheet = examSheets.find(
                      (s) => s.studentId === student.id || s.rollNo === student.rollNo
                    );
                    const isUploaded = !!sheet;
                    const isGraded = sheet && (sheet.status === 'EVALUATED' || sheet.totalMarks !== undefined);
                    const finalMarks = sheet?.totalMarks ?? '—';
                    const aiScore = sheet?.aiEvaluation?.totalAISuggestedMarks;

                    return (
                      <tr key={student.id || student.rollNo} className="hover:bg-slate-50/80 transition group">
                        {/* Student Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {student.initials || 'SC'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block group-hover:text-teal-700 transition">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {student.className} {student.sectionName ? `(${student.sectionName})` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {student.rollNo}
                        </td>

                        {/* Booklet Upload Status */}
                        <td className="py-3.5 px-4">
                          {isUploaded ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                {isGraded ? 'Graded & Verified' : 'Booklet Uploaded'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {sheet?.id?.slice(0, 16)}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              Not Uploaded
                            </span>
                          )}
                        </td>

                        {/* AI Score */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {aiScore ? (
                            <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                              {aiScore} / {totalMaxMarks}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Verified Final Score */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {isGraded ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              {finalMarks} / {totalMaxMarks}
                            </span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isUploaded ? (
                              <>
                                <button
                                  onClick={() => setSelectedStudentForModal(sheet!)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                                  title="Inspect Scanned Script"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setStudentForUpload(student)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                                  title="Re-upload / Replace Answer Booklet"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleLaunchManual(sheet!.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] transition flex items-center gap-1 shadow-xs"
                                  title="Open 3-Panel Manual Evaluator"
                                >
                                  <PenTool className="w-3 h-3" />
                                  <span>{isGraded ? 'Review' : 'Evaluate'}</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setStudentForCamera(student)}
                                  className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition"
                                  title="Live Camera Scan for this Student"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setStudentForUpload(student)}
                                  className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] transition flex items-center gap-1 shadow-xs"
                                >
                                  <UploadCloud className="w-3 h-3" />
                                  <span>Upload Sheet</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      {/* 1. Dedicated Single-Student Upload Modal */}
      {studentForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Answer Booklet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student: <strong className="text-slate-800">{studentForUpload.name}</strong> ({studentForUpload.rollNo})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStudentForUpload(null)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Assessment:</span>
                <strong className="text-slate-800">{activeExam?.title}</strong>
              </div>
              <div className="flex justify-between">
                <span>Subject &amp; Cohort:</span>
                <span className="text-slate-700">{activeExam?.subject?.name} • {studentForUpload.className}</span>
              </div>
            </div>

            {/* In-Modal Dropzone */}
            <div className="border-2 border-dashed border-teal-300 bg-teal-50/40 rounded-2xl p-6 text-center space-y-3 relative hover:bg-teal-50 transition cursor-pointer">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUploadForStudent(studentForUpload, Array.from(e.target.files));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white text-teal-600 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Click or drag scanned answer booklet PDF / Images here
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Supports PDF, JPG, PNG (Max 25MB)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setStudentForCamera(studentForUpload);
                  setStudentForUpload(null);
                }}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Or Snap with Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentForUpload(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Camera Scanner Modal for a Specific Student */}
      {studentForCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Live Camera Scanner — {studentForCamera.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Roll No: <strong className="text-slate-800">{studentForCamera.rollNo}</strong> • Exam: <strong className="text-slate-800">{activeExam?.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setStudentForCamera(null)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CameraScanner
              isOpen={!!studentForCamera}
              onClose={() => setStudentForCamera(null)}
              onCaptureFinished={(count) => {
                handleUploadForStudent(studentForCamera, [
                  new File(['camera_capture'], `scan_${studentForCamera.rollNo}.png`, { type: 'image/png' }),
                ]);
              }}
            />
          </div>
        </div>
      )}

      {/* 3. Question Paper Inspector & Rubric Modal */}
      {showPaperInspectModal && activeExam && (
        <AdminPaperInspectModal
          isOpen={showPaperInspectModal}
          onClose={() => setShowPaperInspectModal(false)}
          exam={activeExam}
          onExamUpdated={(updatedExam) => {
            setExamsList((prev) => prev.map((e) => (e.id === updatedExam.id ? updatedExam : e)));
            toast.success('Exam questions & marking rubrics synchronized!');
          }}
        />
      )}

      {/* 4. Student Paper Preview Modal */}
      {selectedStudentForModal && (
        <StudentPaperModal
          isOpen={!!selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          sheet={selectedStudentForModal}
          questions={examQuestions}
          isStudentView={false}
        />
      )}
    </div>
  );
}
