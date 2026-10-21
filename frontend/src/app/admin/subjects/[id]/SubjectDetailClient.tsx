"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  GraduationCap,
  Users,
  Layers,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Share2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Building,
  ArrowUpRight,
  ShieldCheck,
  X,
  Search,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import {
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useAssignTeacherMutation,
  useDeleteTeacherAssignmentMutation,
  useMapSubjectClassesMutation,
} from "@/features/academic/academic.queries";
import {
  updateSubjectSchema,
  assignTeacherSchema,
  mapSubjectClassesSchema,
} from "@/features/academic/academic.schema";
import { useAcademicStore } from "@/stores/academic.store";

interface Props {
  subject: any;
  siblingSubjects: any[];
  allClasses: any[];
  allTeachers: any[];
  currentUser: any;
}

export function SubjectDetailClient({
  subject: initialSubject,
  siblingSubjects: initialSiblingSubjects,
  allClasses,
  allTeachers,
  currentUser,
}: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject);
  const [siblingSubjects, setSiblingSubjects] = useState(initialSiblingSubjects || []);

  // --- Zustand Store for tab and search state ---
  const { activeSubjectTab, studentSearch, setActiveSubjectTab, setStudentSearch } =
    useAcademicStore();

  // --- TanStack Query Mutations ---
  const updateSubjectMutation = useUpdateSubjectMutation();
  const deleteSubjectMutation = useDeleteSubjectMutation();
  const assignTeacherMutation = useAssignTeacherMutation();
  const deleteTeacherAssignmentMutation = useDeleteTeacherAssignmentMutation();
  const mapSubjectClassesMutation = useMapSubjectClassesMutation();

  const isSubmitting =
    updateSubjectMutation.isPending ||
    deleteSubjectMutation.isPending ||
    assignTeacherMutation.isPending ||
    deleteTeacherAssignmentMutation.isPending ||
    mapSubjectClassesMutation.isPending;

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Assign faculty form state
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignSectionId, setAssignSectionId] = useState("");

  // Multi-Class Map Form State
  const [targetClassIds, setTargetClassIds] = useState<string[]>([]);
  const [copyTeacherToMapped, setCopyTeacherToMapped] = useState(true);
  const [perClassTeachers, setPerClassTeachers] = useState<Record<string, string>>({});

  // Edit form state
  const [editName, setEditName] = useState(subject.name);
  const [editCode, setEditCode] = useState(subject.code);
  const [editMaxMarks, setEditMaxMarks] = useState(String(subject.maxMarks));
  const [editPassMarks, setEditPassMarks] = useState(String(subject.passMarks));
  const [editCredits, setEditCredits] = useState(String(subject.credits));

  // Compute analytics
  const allResults = useMemo(() => {
    return (subject.exams || []).flatMap((ex: any) => ex.examResults || []);
  }, [subject.exams]);

  const stats = useMemo(() => {
    const studentCount = subject.class?.students?.length || 0;
    const examsCount = subject.exams?.length || 0;
    const teachersCount = subject.assignments?.length || 0;

    let avgPercentage = 0;
    let passRate = 0;
    let topScore = 0;

    if (allResults.length > 0) {
      const totalPct = allResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0);
      avgPercentage = Math.round(totalPct / allResults.length);

      const passed = allResults.filter((r: any) => r.resultStatus === "PASS").length;
      passRate = Math.round((passed / allResults.length) * 100);

      topScore = Math.max(...allResults.map((r: any) => r.marksObtained || 0));
    }

    return {
      studentCount,
      examsCount,
      teachersCount,
      avgPercentage,
      passRate,
      topScore,
    };
  }, [subject, allResults]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    const students = subject.class?.students || [];
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (st: any) =>
        st.user?.name?.toLowerCase().includes(q) ||
        st.rollNo?.toLowerCase().includes(q) ||
        st.studentId?.toLowerCase().includes(q)
    );
  }, [subject.class?.students, studentSearch]);

  // Combined list of all mapped classes for this subject
  const allMappedSubjects = useMemo(() => [subject, ...siblingSubjects], [subject, siblingSubjects]);

  // Classes not yet mapped
  const unmappedClasses = useMemo(() => {
    const mappedClassIds = new Set(allMappedSubjects.map((s) => s.classId));
    return allClasses.filter((c) => !mappedClassIds.has(c.id));
  }, [allMappedSubjects, allClasses]);

  // --- Handlers using Zod & TanStack Mutations ---

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      subjectId: subject.id,
      teacherId: assignTeacherId,
      classId: subject.classId,
      sectionId: assignSectionId || undefined,
    };

    const validation = assignTeacherSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Please select a faculty member");
      return;
    }

    try {
      const res = await assignTeacherMutation.mutateAsync(validation.data);
      toast.success(res?.message || "Faculty instructor assigned!");
      setIsAssignModalOpen(false);

      // Optimistically update local subject assignments
      const assignedTeacher = allTeachers.find((t) => t.id === assignTeacherId);
      const assignedSection = subject.class?.sections?.find((s: any) => s.id === assignSectionId);

      if (assignedTeacher) {
        const newAssignment = {
          id: `asgn-${Date.now()}`,
          teacher: assignedTeacher,
          section: assignedSection || null,
        };
        setSubject((prev: any) => ({
          ...prev,
          assignments: [...(prev.assignments || []), newAssignment],
        }));
      }

      setAssignTeacherId("");
      setAssignSectionId("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to assign faculty.");
    }
  };

  const handleUnassignTeacher = async (assignmentId: string, teacherName: string) => {
    try {
      await deleteTeacherAssignmentMutation.mutateAsync(assignmentId);
      toast.success(`Unlinked ${teacherName} from subject.`);
      setSubject((prev: any) => ({
        ...prev,
        assignments: (prev.assignments || []).filter((a: any) => a.id !== assignmentId),
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to unlink teacher.");
    }
  };

  const handleExecuteMap = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sourceSubjectId: subject.id,
      targetClassIds,
      copyTeacher: copyTeacherToMapped,
      perClassTeachers,
    };

    const validation = mapSubjectClassesSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Please choose at least one class");
      return;
    }

    try {
      const res = await mapSubjectClassesMutation.mutateAsync(validation.data);
      toast.success(res?.message || "Subject mapped across classes!");
      setIsMapModalOpen(false);
      setTargetClassIds([]);

      // Optimistically add to siblings
      const newlyMapped = targetClassIds
        .map((cid) => {
          const cls = allClasses.find((c) => c.id === cid);
          return cls
            ? {
                id: `mapped-${Date.now()}-${cid}`,
                name: subject.name,
                code: subject.code,
                classId: cid,
                class: cls,
                assignments: copyTeacherToMapped ? subject.assignments : [],
                exams: [],
              }
            : null;
        })
        .filter(Boolean);

      setSiblingSubjects((prev) => [...prev, ...newlyMapped]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to map subject.");
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: subject.id,
      name: editName.trim(),
      code: editCode.trim().toUpperCase(),
      classId: subject.classId,
      maxMarks: Number(editMaxMarks),
      passMarks: Number(editPassMarks),
      credits: Number(editCredits),
    };

    const validation = updateSubjectSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid subject parameters");
      return;
    }

    try {
      await updateSubjectMutation.mutateAsync(validation.data);
      toast.success("Subject details updated successfully!");
      setIsEditModalOpen(false);
      setSubject((prev: any) => ({
        ...prev,
        name: validation.data.name,
        code: validation.data.code,
        maxMarks: validation.data.maxMarks,
        passMarks: validation.data.passMarks,
        credits: validation.data.credits,
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update subject.");
    }
  };

  const handleDeleteSubject = async () => {
    try {
      await deleteSubjectMutation.mutateAsync(subject.id);
      toast.success(`Subject "${subject.name}" deleted.`);
      router.push("/admin/subjects");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete subject.");
    }
  };

  const isPractical = /practical|lab|viva/i.test(subject.name);

  return (
    <div className="space-y-6">
      {/* ─── TOP BREADCRUMB & NAV ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Subjects Master
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="btn-outline text-xs flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Map to Other Classes
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-outline text-xs flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit Subject
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            title="Delete Subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── SUBJECT HERO HEADER CARD ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-teal-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {subject.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isPractical
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isPractical ? "Practical / Laboratory Course" : "Theory Core Course"}
                </span>

                {allMappedSubjects.length > 1 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Layers className="w-3 h-3" />
                    Shared in {allMappedSubjects.length} Classes
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
                {subject.name}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Primary Class: <strong className="text-slate-800">{subject.class?.name}</strong> ({subject.class?.code})
                </span>
                <span className="text-slate-300">•</span>
                <span>{subject.credits} Academic Credits</span>
                <span className="text-slate-300">•</span>
                <span>
                  Max: <strong className="text-slate-800">{subject.maxMarks}</strong> (Pass:{" "}
                  <strong className="text-teal-700">{subject.passMarks}</strong>)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="btn-outline text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-600" />
              + Allocate Faculty
            </button>
            <Link
              href={`/admin/exams/create`}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Exam
            </Link>
          </div>
        </div>
      </div>

      {/* ─── KPI METRIC SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-700">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{stats.studentCount}</p>
            <p className="kpi-label">Enrolled Class Students</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-teal-50 text-teal-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{stats.teachersCount}</p>
            <p className="kpi-label">Allocated Faculty</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-indigo-50 text-indigo-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{stats.examsCount}</p>
            <p className="kpi-label">Exams Mapped</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">
              {stats.avgPercentage > 0 ? `${stats.avgPercentage}%` : "—"}
            </p>
            <p className="kpi-label">Subject Class Average</p>
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE TABS ─────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "OVERVIEW", label: "Overview & Multi-Class Mapping", count: allMappedSubjects.length },
          { id: "STUDENTS", label: "Enrolled Students Roster", count: stats.studentCount },
          { id: "EXAMS", label: "Examinations & Question Papers", count: stats.examsCount },
          { id: "ANALYTICS", label: "Marks & Grade Performance", count: allResults.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubjectTab(tab.id as any)}
            className={`pb-3 px-3.5 border-b-2 font-heading transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubjectTab === tab.id
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubjectTab === tab.id
                  ? "bg-teal-100 text-teal-900 font-bold"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: OVERVIEW & MULTI-CLASS MAPPING ────────────────────────────── */}
      {activeSubjectTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Multi-Class Mapping Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-heading">
                      Multi-Class Curriculum Mapping
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Classes where "{subject.name}" is currently active in the curriculum
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Map to More Classes
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {allMappedSubjects.map((subItem) => {
                  const isCurrent = subItem.id === subject.id;
                  const itemTeachers = subItem.assignments?.map((a: any) => a.teacher.user?.name) || [];

                  return (
                    <div
                      key={subItem.id}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        isCurrent ? "bg-teal-50/40" : "bg-white hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? "bg-teal-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-900">
                              {subItem.class?.name}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.2 bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold">
                                Current Hub
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {subItem.code} • {subItem.class?.code}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[11px] font-semibold text-slate-700">
                            {itemTeachers.length > 0 ? itemTeachers.join(", ") : "No Faculty"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {subItem.class?.students?.length || 0} Students Enrolled
                          </p>
                        </div>

                        {!isCurrent && (
                          <Link
                            href={`/admin/subjects/${subItem.id}`}
                            className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100"
                            title="Open Subject Hub for this Class"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Allocated Faculty Section */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-heading">
                      Allocated Faculty Instructors
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Teachers responsible for delivery and internal continuous assessment
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="btn-outline text-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  Allocate Faculty
                </button>
              </div>

              {subject.assignments && subject.assignments.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {subject.assignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {assignment.teacher?.user?.name?.[0] || "T"}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">
                            {assignment.teacher?.user?.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {assignment.teacher?.designation || "Faculty Member"} •{" "}
                            {assignment.teacher?.department || "Department of Pharmacy"}
                          </p>
                          {assignment.section && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                              Section: {assignment.section.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleUnassignTeacher(assignment.id, assignment.teacher?.user?.name)
                        }
                        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                        title="Unlink Faculty Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Faculty Allocated</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "Allocate Faculty" above to assign an instructor to this course.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Syllabus Rules & Details Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Evaluation &amp; Syllabus Rules
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Curriculum Credits</span>
                  <span className="font-extrabold text-slate-900 font-mono">{subject.credits} CR</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Maximum Aggregate Marks</span>
                  <span className="font-extrabold text-slate-900 font-mono">{subject.maxMarks} Marks</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Minimum Qualifying Marks</span>
                  <span className="font-extrabold text-teal-700 font-mono">
                    {subject.passMarks} ({Math.round((subject.passMarks / subject.maxMarks) * 100)}%)
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Course Classification</span>
                  <span className="font-semibold text-slate-800">
                    {isPractical ? "Practical Laboratory" : "Core Theoretical Course"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500">Academic Cohort</span>
                  <span className="font-semibold text-slate-800">{subject.class?.name}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors border border-slate-200"
              >
                Modify Evaluation Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ENROLLED STUDENTS ROSTER ──────────────────────────────────── */}
      {activeSubjectTab === "STUDENTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student by name, roll no, student id..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredStudents.length} of {subject.class?.students?.length || 0} Students
            </span>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4 font-mono">Roll Number</th>
                    <th className="py-3 px-4 font-mono">Student ID</th>
                    <th className="py-3 px-4">Class &amp; Section</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st: any) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                            {st.user?.name?.[0] || "S"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{st.user?.name}</p>
                            <p className="text-[11px] text-slate-400">{st.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {st.rollNo}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{st.studentId}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {subject.class?.name}
                          {st.section && ` • ${st.section.name}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/users/students/${st.id}`}
                          className="text-xs font-bold text-teal-700 hover:underline"
                        >
                          View Student Record
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Students Found</p>
              <p className="text-[11px] text-slate-400">
                {studentSearch ? "No students matched your search criteria." : "No students are enrolled in this class."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: EXAMINATIONS & QUESTION PAPERS ────────────────────────────── */}
      {activeSubjectTab === "EXAMS" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-heading">
              Scheduled Exams &amp; Blueprints
            </h3>
            <Link href="/admin/exams/create" className="btn-primary text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Schedule New Exam
            </Link>
          </div>

          {subject.exams && subject.exams.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {subject.exams.map((ex: any) => (
                <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{ex.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Code: {ex.examCode} • Status: {ex.releaseStatus}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/exams`}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    View in Exams Desk
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Examinations Scheduled</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Use the button above to schedule midterms or semester exams for this course.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: MARKS & GRADE PERFORMANCE ─────────────────────────────────── */}
      {activeSubjectTab === "ANALYTICS" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-heading">
            Student Performance &amp; Grade Distribution
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Score</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {stats.avgPercentage}%
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passing Percentage</p>
              <p className="text-2xl font-extrabold text-teal-700 font-mono mt-1">
                {stats.passRate}%
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Highest Marks</p>
              <p className="text-2xl font-extrabold text-indigo-700 font-mono mt-1">
                {stats.topScore} / {subject.maxMarks}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ALLOCATE FACULTY ─────────────────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900 font-heading">
                  Allocate Faculty to {subject.code}
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTeacher} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Faculty Instructor *</label>
                <select
                  required
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="">— Choose Teacher —</option>
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name} ({t.employeeId}) — {t.designation || "Faculty"}
                    </option>
                  ))}
                </select>
              </div>

              {subject.class?.sections && subject.class.sections.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specific Section (Optional)</label>
                  <select
                    value={assignSectionId}
                    onChange={(e) => setAssignSectionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="">— Entire Class (All Sections) —</option>
                    {subject.class.sections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MAP TO OTHER CLASSES ─────────────────────────────────────── */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 font-heading">
                  Map Subject Across Multiple Classes
                </h3>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMap} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Select other academic cohorts that share the exact syllabus for{" "}
                <strong className="text-slate-900">{subject.name}</strong>:
              </p>

              <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50">
                {unmappedClasses.length > 0 ? (
                  unmappedClasses.map((cls) => {
                    const isSelected = targetClassIds.includes(cls.id);
                    return (
                      <div
                        key={cls.id}
                        onClick={() => {
                          setTargetClassIds((prev) =>
                            prev.includes(cls.id)
                              ? prev.filter((id) => id !== cls.id)
                              : [...prev, cls.id]
                          );
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-300"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && <CheckSquare className="w-3 h-3" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cls.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{cls.code}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 py-6">
                    All available classes are already mapped to this subject.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || targetClassIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Map to {targetClassIds.length} Classes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT SUBJECT ──────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                Edit Subject Specifications
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={editMaxMarks}
                    onChange={(e) => setEditMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    required
                    value={editPassMarks}
                    onChange={(e) => setEditPassMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    required
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE SUBJECT ───────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
        }}
        customDeleteFn={handleDeleteSubject}
        title="Delete Subject from Curriculum"
        description={`Are you sure you want to delete ${subject.name} (${subject.code}) from ${subject.class?.name}? This will remove linked teacher allocations.`}
        itemIdentifier={subject.code}
      />
    </div>
  );
}
