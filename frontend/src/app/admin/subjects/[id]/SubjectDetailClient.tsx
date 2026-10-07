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
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

interface Props {
  subject: any;
  siblingSubjects: any[];
  allClasses: any[];
  allTeachers: any[];
  currentUser: any;
}

export function SubjectDetailClient({
  subject: initialSubject,
  siblingSubjects,
  allClasses,
  allTeachers,
  currentUser,
}: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "STUDENTS" | "EXAMS" | "ANALYTICS">("OVERVIEW");
  const [studentSearch, setStudentSearch] = useState("");

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return subject.exams.flatMap((ex: any) => ex.examResults || []);
  }, [subject.exams]);

  const stats = useMemo(() => {
    const studentCount = subject.class.students?.length || 0;
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

      topScore = Math.max(...allResults.map((r: any) => r.totalMarksObtained || 0));
    }

    return { studentCount, examsCount, teachersCount, avgPercentage, passRate, topScore };
  }, [subject, allResults]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const students = subject.class.students || [];
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (st: any) =>
        st.user.name.toLowerCase().includes(q) ||
        st.rollNo.toLowerCase().includes(q) ||
        st.studentId.toLowerCase().includes(q)
    );
  }, [subject.class.students, studentSearch]);

  // Combined list of all mapped classes for this subject
  const allMappedSubjects = [subject, ...siblingSubjects];

  // Classes not yet mapped
  const unmappedClasses = useMemo(() => {
    const mappedClassIds = new Set(allMappedSubjects.map((s) => s.classId));
    return allClasses.filter((c) => !mappedClassIds.has(c.id));
  }, [allMappedSubjects, allClasses]);

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeacherId) {
      toast.error("Please select a faculty member.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subjects/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          teacherId: assignTeacherId,
          classId: subject.classId,
          sectionId: assignSectionId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Faculty instructor assigned!");
        setIsAssignModalOpen(false);
        router.refresh();
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to assign teacher.");
      }
    } catch {
      toast.error("Network error while assigning faculty.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignTeacher = async (assignmentId: string, teacherName: string) => {
    try {
      const res = await fetch(`/api/subjects/assign-teacher?id=${assignmentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Unlinked ${teacherName} from subject.`);
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to unlink teacher.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleExecuteMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetClassIds.length === 0) {
      toast.error("Please choose at least one class to map into.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subjects/map-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceSubjectId: subject.id,
          targetClassIds,
          copyTeacher: copyTeacherToMapped,
          perClassTeachers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Subject mapped across classes!");
        setIsMapModalOpen(false);
        setTargetClassIds([]);
        router.refresh();
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to map subject.");
      }
    } catch {
      toast.error("Network error while mapping subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subject.id,
          name: editName.trim(),
          code: editCode.trim().toUpperCase(),
          maxMarks: Number(editMaxMarks),
          passMarks: Number(editPassMarks),
          credits: Number(editCredits),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Subject details updated successfully!");
        setIsEditModalOpen(false);
        setSubject((prev: any) => ({
          ...prev,
          name: editName.trim(),
          code: editCode.trim().toUpperCase(),
          maxMarks: Number(editMaxMarks),
          passMarks: Number(editPassMarks),
          credits: Number(editCredits),
        }));
      } else {
        toast.error(data.error || "Failed to update subject.");
      }
    } catch {
      toast.error("Network error while updating subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async () => {
    try {
      const res = await fetch(`/api/subjects?id=${subject.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Subject "${subject.name}" deleted.`);
        router.push("/admin/subjects");
      } else {
        toast.error(data.error || "Failed to delete subject.");
      }
    } catch {
      toast.error("Network error.");
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
                  Primary Class: <strong className="text-slate-800">{subject.class.name}</strong> ({subject.class.code})
                </span>
                <span className="text-slate-300">•</span>
                <span>{subject.credits} Academic Credits</span>
                <span className="text-slate-300">•</span>
                <span>Max: <strong className="text-slate-800">{subject.maxMarks}</strong> (Pass: <strong className="text-teal-700">{subject.passMarks}</strong>)</span>
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
              href={`/teacher/exams/create`}
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
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3.5 border-b-2 font-heading transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
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
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Multi-Class Mapping Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Class Mapping Card */}
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
                  const assignedFaculty = subItem.assignments?.[0]?.teacher;

                  return (
                    <div
                      key={subItem.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isCurrent ? "bg-teal-50/40" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isCurrent
                              ? "bg-teal-600 text-white shadow-xs"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {isCurrent ? "THIS" : "MAP"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{subItem.class.name}</h4>
                            <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                              {subItem.code}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full">
                                Currently Viewing
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Degree Code: <span className="font-mono">{subItem.class.code}</span> • {subItem.credits} Credits • Max Marks: {subItem.maxMarks}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-[11px] text-slate-600">
                          Faculty: <strong>{assignedFaculty?.user.name || "Unassigned"}</strong>
                        </span>

                        {!isCurrent && (
                          <Link
                            href={`/admin/subjects/${subItem.id}`}
                            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-bold text-xs cursor-pointer"
                          >
                            View Hub <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Curriculum Specifications Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                Subject Syllabus &amp; Grading Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Maximum Marks</span>
                  <strong className="text-slate-900 text-sm font-bold">{subject.maxMarks} Marks</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Passing Threshold</span>
                  <strong className="text-teal-700 text-sm font-bold">{subject.passMarks} Marks</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Course Credits</span>
                  <strong className="text-slate-900 text-sm font-bold">{subject.credits} Credits</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Exam Type</span>
                  <strong className="text-indigo-700 text-sm font-bold">
                    {isPractical ? "Practical & Viva" : "Written Theory"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Assigned Faculty Instructors */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-sm text-slate-900 font-heading">
                    Allocated Faculty Instructors
                  </h3>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
                >
                  + Add Faculty
                </button>
              </div>

              {subject.assignments && subject.assignments.length > 0 ? (
                <div className="space-y-2.5">
                  {subject.assignments.map((as: any) => (
                    <div
                      key={as.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                          {as.teacher.user.name[0]}
                        </div>
                        <div>
                          <Link
                            href={`/admin/teachers/${as.teacher.userId || as.teacher.id}`}
                            className="font-bold text-slate-900 hover:text-teal-700 hover:underline block"
                          >
                            {as.teacher.user.name}
                          </Link>
                          <p className="text-[10px] text-slate-500">
                            {as.teacher.designation} • ID: {as.teacher.employeeId}
                          </p>
                          <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
                            {as.section?.name || "All Class Sections"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnassignTeacher(as.id, as.teacher.user.name)}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Unlink
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <p>No faculty instructor assigned to this subject yet.</p>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
                  >
                    <UserPlus className="w-3 h-3" /> Assign Instructor Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ENROLLED STUDENTS ROSTER ──────────────────────────────────── */}
      {activeTab === "STUDENTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                Enrolled Students in {subject.class.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                {filteredStudents.length} of {subject.class.students?.length || 0} students currently active
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by student name or roll no..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">STUDENT NAME</th>
                  <th className="table-th">ROLL NUMBER</th>
                  <th className="table-th">STUDENT ID</th>
                  <th className="table-th">SECTION</th>
                  <th className="table-th text-right">PROFILE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st: any, idx: number) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td text-slate-400 font-mono">{idx + 1}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                          {st.user.name[0]}
                        </div>
                        <div>
                          <Link
                            href={`/admin/students/${st.userId || st.id}`}
                            className="font-bold text-slate-900 hover:text-teal-700 hover:underline"
                          >
                            {st.user.name}
                          </Link>
                          <p className="text-[10px] text-slate-400">{st.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td font-mono font-bold text-slate-800">{st.rollNo}</td>
                    <td className="table-td font-mono text-slate-500">{st.studentId}</td>
                    <td className="table-td">
                      <span className="badge-teal">{st.section?.name || "Section A"}</span>
                    </td>
                    <td className="table-td text-right">
                      <Link
                        href={`/admin/students/${st.userId || st.id}`}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-bold text-xs"
                      >
                        View Student <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: EXAMINATIONS & QUESTION PAPERS ────────────────────────────── */}
      {activeTab === "EXAMS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-heading">
              Examinations Scheduled for {subject.name}
            </h3>
            <Link
              href={`/teacher/exams/create`}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> + Schedule New Exam
            </Link>
          </div>

          {subject.exams && subject.exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.exams.map((ex: any) => (
                <div
                  key={ex.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-teal-400 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {ex.examCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ex.releaseStatus === "RELEASED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ex.releaseStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{ex.title}</h4>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Exam Date &amp; Time</span>
                      <strong>{formatDate(ex.examDate)}</strong> • {ex.startTime} - {ex.endTime}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Max Marks &amp; Fee</span>
                      <strong>{ex.maxMarks} Marks</strong> • ₹{ex.examFee}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Papers: <strong>{ex.papers?.length || 0} Blueprint(s)</strong>
                    </span>
                    <Link
                      href={`/admin/exams`}
                      className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1"
                    >
                      Manage Exam <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No exams scheduled for this subject yet.</p>
              <Link
                href="/teacher/exams/create"
                className="mt-3 inline-flex items-center gap-1 btn-primary text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule First Exam
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: MARKS & GRADE PERFORMANCE ─────────────────────────────────── */}
      {activeTab === "ANALYTICS" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-heading">
              Subject Grade &amp; Mark Performance Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Overall student performance metrics across all conducted examination sessions
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <span className="text-xs font-bold text-teal-800">Pass Rate</span>
              <p className="text-2xl font-extrabold text-teal-950 mt-1">{stats.passRate}%</p>
              <p className="text-[10px] text-teal-700 mt-0.5">Students achieving passing criteria</p>
            </div>
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80">
              <span className="text-xs font-bold text-blue-800">Class Average</span>
              <p className="text-2xl font-extrabold text-blue-950 mt-1">{stats.avgPercentage}%</p>
              <p className="text-[10px] text-blue-700 mt-0.5">Overall cohort percentage</p>
            </div>
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80">
              <span className="text-xs font-bold text-purple-800">Top Marks</span>
              <p className="text-2xl font-extrabold text-purple-950 mt-1">{stats.topScore}</p>
              <p className="text-[10px] text-purple-700 mt-0.5">Highest score achieved</p>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-800">Evaluated Results</span>
              <p className="text-2xl font-extrabold text-emerald-950 mt-1">{allResults.length}</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Published marks entries</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ALLOCATE FACULTY INSTRUCTOR ──────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Allocate Faculty to {subject.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTeacher} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Faculty Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">— Pick Faculty Member —</option>
                  {allTeachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.user.name} • {t.designation} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Section</label>
                <select
                  value={assignSectionId}
                  onChange={(e) => setAssignSectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="">All Sections in {subject.class.name}</option>
                  {subject.class.sections?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !assignTeacherId}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Allocating..." : "Confirm Allocation"}
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
                  Map Subject to Additional Classes
                </h3>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMap} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
                <div>
                  <p className="font-bold">Replicate "{subject.name}" ({subject.code})</p>
                  <p className="text-[11px] text-indigo-700">Assign this syllabus course to additional academic cohorts</p>
                </div>
                <span className="badge-indigo font-mono">{subject.credits} Credits</span>
              </div>

              {subject.assignments?.length === 1 && (
                <div className="text-[11px] rounded-xl p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>{subject.assignments[0]?.teacher?.user?.name}</strong> is the assigned faculty — they will be allocated to newly mapped classes automatically.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Select Classes to Map Into ({targetClassIds.length} Selected):
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (targetClassIds.length === unmappedClasses.length) {
                        setTargetClassIds([]);
                      } else {
                        setTargetClassIds(unmappedClasses.map((c) => c.id));
                      }
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {targetClassIds.length === unmappedClasses.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {unmappedClasses.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">
                    All academic classes in the institution already have this subject assigned!
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {unmappedClasses.map((cls) => {
                      const isSelected = targetClassIds.includes(cls.id);
                      return (
                        <div
                          key={cls.id}
                          className={`rounded-xl border transition-all p-2.5 ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold"
                              : "bg-white border-slate-100 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setTargetClassIds((prev) =>
                                    prev.includes(cls.id)
                                      ? prev.filter((id) => id !== cls.id)
                                      : [...prev, cls.id]
                                  );
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                              />
                              <div>
                                <span className="text-xs font-semibold">{cls.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">Code: {cls.code}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                              {cls._count?.students || 0} Students
                            </span>
                          </label>

                          {/* Per-class teacher dropdown if selected */}
                          {isSelected && subject.assignments?.length !== 1 && (
                            <div className="mt-2 pt-2 border-t border-indigo-200/60 pl-6">
                              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                                Allocate Faculty Instructor for this Class (Optional):
                              </label>
                              <select
                                value={perClassTeachers[cls.id] || ""}
                                onChange={(e) =>
                                  setPerClassTeachers((prev) => ({ ...prev, [cls.id]: e.target.value }))
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                              >
                                <option value="">— No faculty assigned (assign later) —</option>
                                {allTeachers.map((t: any) => (
                                  <option key={t.id} value={t.id}>
                                    {t.user.name} ({t.designation} • {t.employeeId})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || targetClassIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Applying..." : `Assign to ${targetClassIds.length} Class${targetClassIds.length !== 1 ? "es" : ""}`}
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
              <h3 className="font-bold text-sm text-slate-900 font-heading">Edit Subject Specifications</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
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
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
        description={`Are you sure you want to delete ${subject.name} (${subject.code}) from ${subject.class.name}? This will remove linked teacher allocations.`}
        itemIdentifier={subject.code}
      />
    </div>
  );
}
