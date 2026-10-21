"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  GraduationCap,
  PenTool,
  Users,
  PlusCircle,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { hasUserPermission, checkUserTimeAccess } from "@/lib/permissions";
import { toast } from "sonner";
import { ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { useCreateExamMutation } from "@/features/exams/exams.queries";
import { createExamSchema } from "@/features/exams/exams.schema";

interface TeacherDashboardProps {
  user: SessionUser | null;
  assignedExams?: any[];
  pendingAnswerSheets?: any[];
  classes?: any[];
  subjects?: any[];
}

export function TeacherDashboard({
  user,
  assignedExams = [],
  pendingAnswerSheets = [],
  classes = [],
  subjects = [],
}: TeacherDashboardProps) {
  const createExamMutation = useCreateExamMutation();
  const [internalTests, setInternalTests] = useState(() => {
    if (assignedExams && assignedExams.length > 0) {
      return assignedExams.map((e: any) => ({
        id: e.examCode || e.id,
        title: e.title,
        subject: e.subject?.name ? `${e.subject.name} (${e.subject.code || ""})`.trim() : "Mathematics",
        classSection: `${e.class?.name || "Class Cohort"}${e.section?.name ? ` (${e.section.name})` : ""}`,
        date: e.examDate ? new Date(e.examDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        maxMarks: e.maxMarks || 25,
        status: e.status === "COMPLETED" || e.status === "EVALUATING" ? "COMPLETED" : "SCHEDULED",
        marksAssignedCount: e._count?.answerSheets || 0,
        totalStudents: e.class?.students?.length || 50,
      }));
    }
    return [
      {
        id: "INT-MTH-UT1",
        title: "Unit Test 1 - Algebra & Factorization",
        subject: "Mathematics - Pure & Applied (MTH-101)",
        classSection: "Grade 10 (Secondary) - Section A",
        date: new Date().toISOString().slice(0, 10),
        maxMarks: 25,
        status: "COMPLETED",
        marksAssignedCount: 2,
        totalStudents: 2,
      },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTestTitle, setNewTestTitle] = useState("");
  const [newTestMaxMarks, setNewTestMaxMarks] = useState("25");
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");

  const handleCreateInternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle) return;

    const targetClassId = selectedClassId || classes[0]?.id || assignedExams[0]?.classId;
    const targetSubjectId = selectedSubjectId || subjects[0]?.id || assignedExams[0]?.subjectId;

    const payload = {
      title: newTestTitle,
      examType: "UNIT_TEST",
      maxMarks: Number(newTestMaxMarks) || 25,
      passMarks: Math.round((Number(newTestMaxMarks) || 25) * 0.4),
      classId: targetClassId,
      subjectId: targetSubjectId,
      examDate: new Date().toISOString().slice(0, 10),
      durationMinutes: 60,
    };

    const parseResult = createExamSchema.safeParse(payload);
    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      const data = await createExamMutation.mutateAsync(parseResult.data);
      const created = data.exam || data;
      const targetClass = classes.find((c: any) => c.id === targetClassId);
      const targetSubject = subjects.find((s: any) => s.id === targetSubjectId);

      const newTest = {
        id: created.examCode || created.id || `INT-${Date.now().toString().slice(-4)}`,
        title: newTestTitle,
        subject: targetSubject?.name || created.subject?.name || "Mathematics",
        classSection: targetClass?.name || created.class?.name || "Assigned Class",
        date: new Date().toISOString().slice(0, 10),
        maxMarks: Number(newTestMaxMarks) || 25,
        status: "SCHEDULED",
        marksAssignedCount: 0,
        totalStudents: 50,
      };

      setInternalTests((prev) => [newTest, ...prev]);
      toast.success(`Internal assessment "${newTestTitle}" saved to PostgreSQL database!`);
      setIsModalOpen(false);
      setNewTestTitle("");
    } catch (err: any) {
      toast.error(err.message || "Failed to save assessment to database");
    }
  };

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold backdrop-blur-xs">
              <GraduationCap className="w-4 h-4 text-teal-300" />
              Faculty &amp; Class Continuous Internal Assessment (CIA)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Welcome, {user?.name || "Prof. Ramesh Kumar"}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal">
              {user?.teacherProfile?.designation || "Professor & HOD"} • {user?.teacherProfile?.department || "Department of Pharmaceutics"} • ID: {user?.teacherProfile?.employeeId || "FAC-PHA-01"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-teal-950/20 transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Create Class Internal Paper
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-teal-50 text-teal-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">2</p>
            <p className="kpi-label">Assigned Subjects</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">50</p>
            <p className="kpi-label">Class Students Enrolled</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{internalTests.length}</p>
            <p className="kpi-label">Internal Tests &amp; Quizzes</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">83 / 100</p>
            <p className="kpi-label">CIA Marks Submitted</p>
          </div>
        </div>
      </div>

      {/* Delegated Special Examination Authorities (If granted by Super Admin) */}
      {(hasUserPermission(user, "CREATE_MAIN_PAPER") ||
        hasUserPermission(user, "EVALUATE_MAIN_SHEETS") ||
        hasUserPermission(user, "CHECK_MAIN_SHEETS")) && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-amber-300/80 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                    Special Administrative Examination Authority Delegated
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    SUPER ADMIN APPROVED
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  You have been granted executive examination duties. Select an authorized portal below:
                </p>
              </div>
            </div>

            {user?.isTimeRestricted && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-amber-300 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Slot: {user.dailyStartTime || "08:00"} - {user.dailyEndTime || "20:00"} IST
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {hasUserPermission(user, "CREATE_MAIN_PAPER") && (
              <Link
                href="/creator/dashboard"
                className="p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      CREATE_MAIN_PAPER
                    </span>
                    <ExternalLink className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                    Main Paper Creation Studio
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Draft university question papers, blueprint schemes, and AI grading rubrics.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-amber-600 flex items-center gap-1">
                  Launch Paper Studio →
                </div>
              </Link>
            )}

            {hasUserPermission(user, "EVALUATE_MAIN_SHEETS") && (
              <Link
                href="/evaluator/dashboard"
                className="p-4 rounded-2xl bg-white border border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                      EVALUATE_MAIN_SHEETS
                    </span>
                    <ExternalLink className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                    Central Evaluation Desk
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Grade scanned student answer booklets with Gemini Vision AI side-by-side OCR.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-teal-600 flex items-center gap-1">
                  Launch AI Marking Desk →
                </div>
              </Link>
            )}

            {hasUserPermission(user, "CHECK_MAIN_SHEETS") && (
              <Link
                href="/checker/dashboard"
                className="p-4 rounded-2xl bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      CHECK_MAIN_SHEETS
                    </span>
                    <ExternalLink className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                    2nd-Stage Moderation &amp; Scrutiny
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Inspect 1st-evaluator scores, verify question-wise totals, and sign off to Finalized.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-indigo-600 flex items-center gap-1">
                  Launch Scrutiny Panel →
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Class Internal Papers & Continuous Assessment Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="data-container p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  Class Internal Assessments &amp; Continuous Marks Entry
                </h2>
                <p className="page-header-subtitle">
                  Create class unit test question sets and record continuous internal assessment scores for your class sections.
                </p>
              </div>

              <span className="badge-teal font-bold">
                B.Pharmacy - 1st Year (Sec A)
              </span>
            </div>

            <div className="space-y-3">
              {internalTests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {test.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {test.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {test.subject} • {test.classSection} • Max Marks: {test.maxMarks}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={
                          test.status === "COMPLETED"
                            ? "badge-emerald"
                            : test.status === "IN_PROGRESS"
                            ? "badge-amber"
                            : "badge-blue"
                        }
                      >
                        {test.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Marks Progress:</span>
                      <strong className="text-slate-800">
                        {test.marksAssignedCount} / {test.totalStudents} Students Graded
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toast.info(
                            `Opening Class Marks Grid for "${test.title}" (50 students in B.Pharm Sec A).`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Assign Class Marks
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Assigned Classes & Scope Notice */}
        <div className="space-y-6">
          <div className="data-container p-5 space-y-4">
            <h2 className="section-title flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Assigned Subjects &amp; Classes
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official faculty allocations for academic year 2026-2027:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-teal-950">Pharmaceutics - I (Theory)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    BP103T
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  B.Pharmacy 1st Year • Section A • 4 Credits
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-950">Pharmaceutics Practical - I</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    BP109P
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  B.Pharmacy 1st Year • Section A • 2 Credits
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Institutional Exam Scope Policy
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Main institutional semester examination papers and university evaluations are segregated to designated Paper Creators and Central Evaluators. Faculty manage class internal tests and continuous internal assessments for their assigned batches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating Class Internal Paper */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">Create Class Internal Paper</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInternal} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assessment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  placeholder="e.g. Unit Test 3 - Tablet Compression & Defects"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {classes && classes.length > 0 ? (
                      classes.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="">Default Cohort</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {subjects && subjects.length > 0 ? (
                      subjects.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))
                    ) : (
                      <option value="">Default Subject</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={newTestMaxMarks}
                  onChange={(e) => setNewTestMaxMarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-xs"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
