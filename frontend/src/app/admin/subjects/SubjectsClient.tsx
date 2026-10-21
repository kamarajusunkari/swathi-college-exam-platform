"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  GraduationCap,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Upload,
  Building,
  Sparkles,
  LayoutGrid,
  List,
  ArrowRight,
  Calendar,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import {
  useSubjects,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "@/features/academic/academic.queries";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "@/features/academic/academic.schema";
import { useAcademicStore } from "@/stores/academic.store";

interface SubjectWithDetails {
  id: string;
  name: string;
  code: string;
  classId: string;
  maxMarks: number;
  passMarks: number;
  credits: number;
  class: {
    id: string;
    name: string;
    code: string;
    sections: { id: string; name: string }[];
    students?: {
      id: string;
      rollNo: string;
      studentId: string;
      user: { name: string; email: string };
      section?: { name: string } | null;
    }[];
    _count?: { students: number };
  };
  assignments: {
    id: string;
    teacher: {
      id: string;
      employeeId: string;
      designation: string;
      department?: string | null;
      user: { name: string; email: string };
    };
    section?: { id: string; name: string } | null;
  }[];
  exams: {
    id: string;
    title: string;
    examCode: string;
    releaseStatus: string;
  }[];
}

interface TeacherOption {
  id: string;
  employeeId: string;
  designation: string;
  department?: string | null;
  user: { name: string; email: string };
}

interface ClassOption {
  id: string;
  name: string;
  code: string;
  sections: { id: string; name: string }[];
  _count?: { students: number };
}

interface SubjectsClientProps {
  classes: ClassOption[];
  initialSubjects: SubjectWithDetails[];
  teachers: TeacherOption[];
  totalStudentsCount: number;
  currentUser: SessionUser | null;
}

export function SubjectsClient({
  classes,
  initialSubjects,
  teachers,
  totalStudentsCount,
  currentUser,
}: SubjectsClientProps) {
  const router = useRouter();

  // --- TanStack Query for Subjects List ---
  const { data: rawSubjects = initialSubjects } = useSubjects(undefined, initialSubjects);
  const subjects: SubjectWithDetails[] = useMemo(() => {
    return Array.isArray(rawSubjects) ? rawSubjects : initialSubjects;
  }, [rawSubjects, initialSubjects]);

  // --- TanStack Query Mutations ---
  const createSubjectMutation = useCreateSubjectMutation();
  const updateSubjectMutation = useUpdateSubjectMutation();
  const deleteSubjectMutation = useDeleteSubjectMutation();

  const isSubmitting =
    createSubjectMutation.isPending ||
    updateSubjectMutation.isPending ||
    deleteSubjectMutation.isPending;

  // --- Zustand Store State ---
  const {
    subjectSearch,
    subjectClassFilter,
    subjectFacultyFilter,
    subjectViewMode,
    openingSubjectId,
    isSubjectCreateModalOpen,
    editingEntity,
    setSubjectSearch,
    setSubjectClassFilter,
    setSubjectFacultyFilter,
    setSubjectViewMode,
    setOpeningSubjectId,
    openSubjectCreateModal,
    closeSubjectCreateModal,
  } = useAcademicStore();

  // Local Modal States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithDetails | null>(null);

  // Form State for Add / Edit Subject
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formClassIds, setFormClassIds] = useState<string[]>([classes[0]?.id || ""]);
  const [formMaxMarks, setFormMaxMarks] = useState("100");
  const [formPassMarks, setFormPassMarks] = useState("35");
  const [formCredits, setFormCredits] = useState("4");
  const [formPerClassTeachers, setFormPerClassTeachers] = useState<Record<string, string>>({});
  const [formSectionId, setFormSectionId] = useState("");
  const [classPickerSearch, setClassPickerSearch] = useState("");
  const [classPickerDegree, setClassPickerDegree] = useState("ALL");

  // Sync editingEntity into form state when modal opens
  React.useEffect(() => {
    if (isSubjectCreateModalOpen && editingEntity) {
      setFormName(editingEntity.name || "");
      setFormCode(editingEntity.code || "");
      setFormClassIds([editingEntity.classId]);
      setFormMaxMarks(String(editingEntity.maxMarks || 100));
      setFormPassMarks(String(editingEntity.passMarks || 35));
      setFormCredits(String(editingEntity.credits || 4));

      const initialTeachers: Record<string, string> = {};
      editingEntity.assignments?.forEach((assignment: any) => {
        if (assignment.section) {
          initialTeachers[`${editingEntity.classId}_${assignment.section.id}`] = assignment.teacher.id;
        } else {
          initialTeachers[editingEntity.classId] = assignment.teacher.id;
        }
      });
      setFormPerClassTeachers(initialTeachers);
    } else if (isSubjectCreateModalOpen && !editingEntity) {
      setFormName("");
      setFormCode("");
      setFormClassIds([classes[0]?.id || ""]);
      setFormMaxMarks("100");
      setFormPassMarks("35");
      setFormCredits("4");
      setFormPerClassTeachers({});
      setFormSectionId("");
      setClassPickerSearch("");
      setClassPickerDegree("ALL");
    }
  }, [isSubjectCreateModalOpen, editingEntity, classes]);

  // Navigate to Single Subject Page
  const handleOpenSubjectHub = (subjectId: string) => {
    setOpeningSubjectId(subjectId);
    router.push(`/admin/subjects/${subjectId}`);
  };

  // Map of subject name -> list of classes where this subject exists
  const subjectsAcrossClassesMap = useMemo(() => {
    const map = new Map<string, { subjectId: string; className: string; classCode: string; code: string }[]>();
    for (const sub of subjects) {
      const normalizedName = sub.name.trim().toLowerCase();
      const existing = map.get(normalizedName) || [];
      existing.push({
        subjectId: sub.id,
        className: sub.class?.name || "Unassigned",
        classCode: sub.class?.code || "",
        code: sub.code,
      });
      map.set(normalizedName, existing);
    }
    return map;
  }, [subjects]);

  // Filtered Subject List
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        subject.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        subject.class?.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        subject.class?.code.toLowerCase().includes(subjectSearch.toLowerCase());

      const matchesClass =
        subjectClassFilter === "ALL" || subject.classId === subjectClassFilter;

      const hasFaculty = subject.assignments && subject.assignments.length > 0;
      const matchesFaculty =
        subjectFacultyFilter === "ALL" ||
        (subjectFacultyFilter === "ASSIGNED" && hasFaculty) ||
        (subjectFacultyFilter === "UNASSIGNED" && !hasFaculty);

      return matchesSearch && matchesClass && matchesFaculty;
    });
  }, [subjects, subjectSearch, subjectClassFilter, subjectFacultyFilter]);

  // Derived Metrics
  const totalSubjectsCount = subjects.length;
  const classesWithCurriculum = new Set(subjects.map((s) => s.classId)).size;
  const multiClassSubjectsCount = Array.from(subjectsAcrossClassesMap.values()).filter((list) => list.length > 1).length;

  // Real-time Validation Check for Form using Zod
  const validationErrors = useMemo(() => {
    const max = Number(formMaxMarks);
    const pass = Number(formPassMarks);
    const cr = Number(formCredits);

    const testPayload = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      classIds: formClassIds,
      maxMarks: isNaN(max) ? 0 : max,
      passMarks: isNaN(pass) ? 0 : pass,
      credits: isNaN(cr) ? 0 : cr,
    };

    const result = createSubjectSchema.safeParse(testPayload);
    if (!result.success) {
      return result.error.errors.map((e) => e.message);
    }
    return [];
  }, [formName, formCode, formClassIds, formMaxMarks, formPassMarks, formCredits]);

  // Auto-Suggest Subject Code based on Subject Name & Class
  const handleAutoSuggestCode = () => {
    if (!formName.trim()) {
      toast.info("Please enter a Subject Name first to generate a code.");
      return;
    }

    const selectedClass = classes.find((c) => c.id === formClassIds[0]);
    const classPrefix = selectedClass ? selectedClass.code.replace(/[^A-Z0-9]/gi, "").toUpperCase() : "BP";

    const words = formName.trim().split(/\s+/);
    let subjectLetters = "";
    if (words.length === 1) {
      subjectLetters = words[0].slice(0, 3).toUpperCase();
    } else {
      subjectLetters = words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
    }

    const isPractical = /practical|lab|viva/i.test(formName);
    const suffix = isPractical ? "P" : "T";
    const suggested = `${classPrefix}-${subjectLetters}101${suffix}`;
    setFormCode(suggested);
    toast.success(`Generated code: ${suggested}`);
  };

  // Toggle class selection in form
  const handleToggleClass = (classId: string) => {
    if (editingEntity) {
      setFormClassIds([classId]);
      return;
    }
    setFormClassIds((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleSelectAllClasses = () => {
    const visibleIds = filteredClassOptions.map((c) => c.id);
    setFormClassIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleClearAllClasses = () => {
    setFormClassIds([]);
  };

  // Filtered Class Options for Modal Multi-Select
  const filteredClassOptions = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(classPickerSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(classPickerSearch.toLowerCase());

      const matchesDegree =
        classPickerDegree === "ALL" ||
        (classPickerDegree === "BPHARM" && (c.code.includes("BPHARM") || c.name.includes("B.Pharm"))) ||
        (classPickerDegree === "MPHARM" && (c.code.includes("MPHARM") || c.name.includes("M.Pharm"))) ||
        (classPickerDegree === "PHARMD" && (c.code.includes("PHARMD") || c.name.includes("Pharm.D"))) ||
        (classPickerDegree === "DPHARM" && (c.code.includes("DPHARM") || c.name.includes("D.Pharm")));

      return matchesSearch && matchesDegree;
    });
  }, [classes, classPickerSearch, classPickerDegree]);

  // Submit Add / Edit Form using Zod & TanStack Query Mutation
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    const max = Number(formMaxMarks);
    const pass = Number(formPassMarks);
    const cr = Number(formCredits);

    try {
      if (editingEntity) {
        const updatePayload = {
          id: editingEntity.id,
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          classId: formClassIds[0],
          maxMarks: max,
          passMarks: pass,
          credits: cr,
          perClassTeachers: formPerClassTeachers,
        };

        const parsed = updateSubjectSchema.safeParse(updatePayload);
        if (!parsed.success) {
          toast.error(parsed.error.errors[0]?.message || "Validation failed");
          return;
        }

        await updateSubjectMutation.mutateAsync(parsed.data);
        toast.success(`Subject "${formName}" updated successfully!`);
        closeSubjectCreateModal();
      } else {
        const createPayload = {
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          classIds: formClassIds,
          maxMarks: max,
          passMarks: pass,
          credits: cr,
          perClassTeachers: formPerClassTeachers,
          sectionId: formSectionId || undefined,
        };

        const parsed = createSubjectSchema.safeParse(createPayload);
        if (!parsed.success) {
          toast.error(parsed.error.errors[0]?.message || "Validation failed");
          return;
        }

        await createSubjectMutation.mutateAsync(parsed.data);
        toast.success(`Subject "${formName}" created and mapped to ${formClassIds.length} classes!`);
        closeSubjectCreateModal();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save subject");
    }
  };

  // Delete Subject using TanStack Query Mutation
  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    try {
      await deleteSubjectMutation.mutateAsync(deletingSubject.id);
      toast.success(`Subject "${deletingSubject.name}" deleted from curriculum.`);
      setDeletingSubject(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete subject");
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Curriculum &amp; Academic Courses
          </div>
          <h1 className="page-header-title mt-1 font-heading text-slate-900 text-2xl font-extrabold tracking-tight">
            Institutional Subject Master
          </h1>
          <p className="page-header-subtitle text-xs text-slate-500 font-normal mt-0.5">
            Manage course curriculum, syllabus credits, and click any subject card to open its dedicated Single Subject Hub.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn-outline text-xs cursor-pointer py-2.5 px-3.5"
            title="Upload CSV of multiple subjects"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Bulk CSV Import
          </button>

          <button
            onClick={() => openSubjectCreateModal(null)}
            className="btn-primary text-xs flex items-center gap-1.5 shadow-sm cursor-pointer py-2.5 px-4 font-bold"
          >
            <Plus className="w-4 h-4" />
            + Add Subject
          </button>
        </div>
      </div>

      {/* ─── KPI METRIC SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-teal-50 text-teal-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{totalSubjectsCount}</p>
            <p className="kpi-label">Total Subject Curricula</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-indigo-50 text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{multiClassSubjectsCount}</p>
            <p className="kpi-label">Multi-Class Shared Subjects</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-700">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{classesWithCurriculum} / {classes.length}</p>
            <p className="kpi-label">Classes with Active Syllabus</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-700">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{totalStudentsCount}</p>
            <p className="kpi-label">Students in Curriculum</p>
          </div>
        </div>
      </div>

      {/* ─── SEARCH & FILTER TOOLBAR ─────────────────────────────────────────── */}
      <div className="data-container p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                placeholder="Search subject by name, code (BP101T), or class..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={subjectClassFilter}
                onChange={(e) => setSubjectClassFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              >
                <option value="ALL">All Classes &amp; Years</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty Allocation Filter */}
            <select
              value={subjectFacultyFilter}
              onChange={(e) => setSubjectFacultyFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 hidden lg:block cursor-pointer"
            >
              <option value="ALL">All Allocations</option>
              <option value="ASSIGNED">Faculty Assigned</option>
              <option value="UNASSIGNED">Unassigned Subjects</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSubjectViewMode("GRID")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  subjectViewMode === "GRID"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Spacious Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards View</span>
              </button>
              <button
                onClick={() => setSubjectViewMode("TABLE")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  subjectViewMode === "TABLE"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table View</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredSubjects.length} of {subjects.length}
            </span>
          </div>
        </div>
      </div>

      {/* ─── SUBJECTS CONTENT (SPACIOUS GRID OR TABLE) ────────────────────────── */}
      {filteredSubjects.length === 0 ? (
        <div className="data-container p-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-heading">No Subjects Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {subjectSearch || subjectClassFilter !== "ALL"
              ? "No subjects matched your search or class filter criteria. Try resetting the filters."
              : "No subjects have been added to the curriculum yet. Click '+ Add Subject' to begin."}
          </p>
          <button
            onClick={() => openSubjectCreateModal(null)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Subject to Curriculum
          </button>
        </div>
      ) : subjectViewMode === "GRID" ? (
        /* ─── SPACIOUS GRID VIEW ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => {
            const assignedTeachers = subject.assignments?.map((a) => a.teacher) || [];
            const isAssigned = assignedTeachers.length > 0;
            const enrolledCount = subject.class?.students?.length || 0;
            const isOpeningThis = openingSubjectId === subject.id;
            const siblingClasses = subjectsAcrossClassesMap.get(subject.name.trim().toLowerCase()) || [];
            const isMultiClass = siblingClasses.length > 1;

            return (
              <div
                key={subject.id}
                onClick={() => handleOpenSubjectHub(subject.id)}
                className="group relative bg-white border border-slate-200/90 hover:border-teal-400 rounded-3xl p-6 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-teal-900/5 cursor-pointer flex flex-col justify-between"
              >
                {/* Loading overlay while opening single subject hub */}
                {isOpeningThis && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-3xl z-10 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                    <span className="text-xs font-bold text-teal-900 font-heading">Loading Subject Hub...</span>
                  </div>
                )}

                <div>
                  {/* Top Header: Code + Multi-Class Indicator + Action Buttons */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs font-extrabold font-mono border border-teal-200/70 tracking-wide">
                        {subject.code}
                      </span>
                      {isMultiClass && (
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-200 flex items-center gap-1" title="Shared syllabus across multiple classes">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          Shared in {siblingClasses.length} Classes
                        </span>
                      )}
                    </div>

                    {/* Quick Edit/Delete Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openSubjectCreateModal(subject)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSubject(subject)}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Title */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 font-heading leading-snug">
                    {subject.name}
                  </h3>

                  {/* Academic Class Assignment */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{subject.class?.name || "Unassigned Cohort"}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-[11px] text-slate-400 font-bold">{subject.class?.code}</span>
                  </div>

                  {/* Metric Chips (Credits, Marks, Pass Rule) */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-slate-50/80 rounded-2xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Credits</p>
                      <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{subject.credits} CR</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max Marks</p>
                      <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{subject.maxMarks}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pass Rule</p>
                      <p className="text-sm font-extrabold text-teal-700 font-mono mt-0.5">{subject.passMarks} ({Math.round((subject.passMarks / subject.maxMarks) * 100)}%)</p>
                    </div>
                  </div>
                </div>

                {/* Footer Section: Assigned Teachers & Navigation CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {isAssigned ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {assignedTeachers[0]?.user.name[0] || "F"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                            {assignedTeachers[0]?.user.name}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold truncate">
                            {assignedTeachers.length > 1 ? `+${assignedTeachers.length - 1} other faculty` : "Primary Instructor"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Unassigned</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <div className="flex items-center gap-1 text-xs font-extrabold text-teal-700 group-hover:translate-x-1 transition-transform">
                    <span>Open Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── TABLE VIEW ─── */
        <div className="data-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Subject Info</th>
                  <th className="py-3.5 px-4">Class &amp; Degree</th>
                  <th className="py-3.5 px-4 text-center">Credits</th>
                  <th className="py-3.5 px-4 text-center">Marks (Max / Pass)</th>
                  <th className="py-3.5 px-4">Allocated Faculty</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubjects.map((subject) => {
                  const assignedTeachers = subject.assignments?.map((a) => a.teacher) || [];
                  const isOpeningThis = openingSubjectId === subject.id;

                  return (
                    <tr
                      key={subject.id}
                      onClick={() => handleOpenSubjectHub(subject.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                            {subject.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {subject.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{subject.class?.name}</span>
                        <span className="block text-[11px] text-slate-400 font-mono">{subject.class?.code}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        {subject.credits} CR
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-slate-900">{subject.maxMarks}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-teal-700 font-bold">{subject.passMarks}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {assignedTeachers.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                              {assignedTeachers[0]?.user.name[0]}
                            </div>
                            <span className="font-semibold text-slate-800 text-xs">
                              {assignedTeachers[0]?.user.name}
                              {assignedTeachers.length > 1 && ` (+${assignedTeachers.length - 1})`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenSubjectHub(subject.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-1"
                          >
                            {isOpeningThis ? <Loader2 className="w-3 h-3 animate-spin" /> : "Open Hub"}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openSubjectCreateModal(subject)}
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingSubject(subject)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT SUBJECT MODAL (SUPPORTS MULTI-CLASS MAPPING) ──────────── */}
      {isSubjectCreateModalOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[2rem] max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative isolate">
                <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white rounded-t-[2rem] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 font-heading">
                        {editingEntity ? "Edit Subject Configuration" : "Add Subject to Curriculum"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingEntity
                          ? `Modifying syllabus parameters for ${editingEntity.code}`
                          : "Create subject once and optionally map it across multiple classes"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeSubjectCreateModal}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSubject} className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Validation errors summary */}
                  {validationErrors.length > 0 && formName.trim().length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Please resolve the following:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Subject Identity */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                      1. Subject Identity &amp; Code
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Subject Full Name *</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Pharmaceutical Analysis - I (Theory)"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Subject Code *</label>
                        <input
                          type="text"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                          placeholder="e.g. BP101T"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 uppercase"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoSuggestCode}
                        className="px-4 py-2.5 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto-Generate Code
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Examination & Evaluation Rules */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                      2. Examination &amp; Credit Structure
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Max Marks *</label>
                        <input
                          type="number"
                          value={formMaxMarks}
                          onChange={(e) => setFormMaxMarks(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          min="1"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Pass Marks *</label>
                        <input
                          type="number"
                          value={formPassMarks}
                          onChange={(e) => setFormPassMarks(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          min="1"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Credits (CR) *</label>
                        <input
                          type="number"
                          value={formCredits}
                          onChange={(e) => setFormCredits(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          min="1"
                          max="12"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Target Academic Classes */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                        3. Target Academic Classes ({formClassIds.length} Selected)
                      </h4>

                      {!editingEntity && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllClasses}
                            className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={handleClearAllClasses}
                            className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Class Picker Filter Bar */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={classPickerSearch}
                          onChange={(e) => setClassPickerSearch(e.target.value)}
                          placeholder="Filter classes..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <select
                        value={classPickerDegree}
                        onChange={(e) => setClassPickerDegree(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        <option value="ALL">All Degrees</option>
                        <option value="BPHARM">B.Pharm</option>
                        <option value="MPHARM">M.Pharm</option>
                        <option value="PHARMD">Pharm.D</option>
                        <option value="DPHARM">D.Pharm</option>
                      </select>
                    </div>

                    {/* Class Picker Items */}
                    <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                      {filteredClassOptions.map((cls) => {
                        const isSelected = formClassIds.includes(cls.id);
                        return (
                          <div
                            key={cls.id}
                            onClick={() => handleToggleClass(cls.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-teal-50/60 border-teal-300 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                                  isSelected
                                    ? "bg-teal-600 border-teal-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-xs font-bold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                                  {cls.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cls.code}</p>
                              </div>
                              <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                                {cls._count?.students || 0} Students
                              </span>
                            </div>

                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-slate-100/50" onClick={(e) => e.stopPropagation()}>
                                {cls.sections && cls.sections.length > 0 ? (
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                      Assign Teachers per Section (Optional)
                                    </label>
                                    {cls.sections.map((sec) => (
                                      <div key={sec.id} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-600 w-16 truncate">
                                          {sec.name}
                                        </span>
                                        <select
                                          value={formPerClassTeachers[`${cls.id}_${sec.id}`] || ""}
                                          onChange={(e) =>
                                            setFormPerClassTeachers((prev) => ({
                                              ...prev,
                                              [`${cls.id}_${sec.id}`]: e.target.value,
                                            }))
                                          }
                                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        >
                                          <option value="">— Skip for now —</option>
                                          {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                              {t.user.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                      Assign Teacher (Optional)
                                    </label>
                                    <select
                                      value={formPerClassTeachers[cls.id] || ""}
                                      onChange={(e) =>
                                        setFormPerClassTeachers((prev) => ({
                                          ...prev,
                                          [cls.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    >
                                      <option value="">— Skip for now —</option>
                                      {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                          {t.user.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─── FOOTER ACTIONS ─── */}
                  <div className="p-6 border-t border-slate-100/60 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-[2rem]">
                    <button
                      type="button"
                      onClick={closeSubjectCreateModal}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || validationErrors.length > 0}
                      className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : editingEntity ? (
                        "Save Subject Changes"
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Create &amp; Map to {formClassIds.length} Class{formClassIds.length !== 1 && "es"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* ─── BULK CSV IMPORT MODAL ─────────────────────────────────────────────── */}
      {isBulkModalOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative isolate">
                <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white rounded-t-3xl shrink-0">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-sm text-slate-900">Bulk Import Subjects via CSV</h3>
                  </div>
                  <button
                    onClick={() => setIsBulkModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  <p className="text-xs text-slate-600">
                    Quickly upload semester subjects mapped across classes using standard CSV format:
                  </p>

                  <div className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                    Subject Code,Subject Name,Class Code,Max Marks,Pass Marks,Credits
                    <br />
                    BP101T,Human Anatomy &amp; Physiology - I,INT-1,100,35,4
                    <br />
                    BP102T,Pharmaceutical Analysis - I,INT-1,100,35,4
                    <br />
                    BP107P,Human Anatomy Practical,INT-1,50,25,2
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        const sampleCsv =
                          "Subject Code,Subject Name,Class Code,Max Marks,Pass Marks,Credits\nBP101T,Human Anatomy & Physiology - I,INT-1,100,35,4\nBP102T,Pharmaceutical Analysis - I,INT-1,100,35,4\nBP107P,Human Anatomy Practical,INT-1,50,25,2";
                        const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "swathi_subjects_template.csv";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                    >
                      Download CSV Template
                    </button>

                    <button
                      onClick={() => {
                        toast.success("CSV Import Ready — Please select file");
                        setIsBulkModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* ─── CONFIRM DELETE MODAL ────────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingSubject)}
        onClose={() => setDeletingSubject(null)}
        onSuccess={() => {
          setDeletingSubject(null);
        }}
        customDeleteFn={handleDeleteSubject}
        title="Delete Subject from Curriculum"
        description={`Are you sure you want to delete ${deletingSubject?.name} (${deletingSubject?.code}) from ${deletingSubject?.class.name}? This will remove associated teacher assignments.`}
        itemIdentifier={deletingSubject?.code}
      />
    </div>
  );
}
