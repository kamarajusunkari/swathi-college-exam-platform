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
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

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
  const [subjects, setSubjects] = useState<SubjectWithDetails[]>(initialSubjects);

  // Navigation Loading feedback state
  const [openingSubjectId, setOpeningSubjectId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithDetails | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit Subject (Supports Multi-Class Selection)
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formClassIds, setFormClassIds] = useState<string[]>([classes[0]?.id || ""]);
  const [formMaxMarks, setFormMaxMarks] = useState("100");
  const [formPassMarks, setFormPassMarks] = useState("35");
  const [formCredits, setFormCredits] = useState("4");
  const [formTeacherId, setFormTeacherId] = useState("");
  const [formSectionId, setFormSectionId] = useState("");
  const [classPickerSearch, setClassPickerSearch] = useState("");
  const [classPickerDegree, setClassPickerDegree] = useState("ALL");

  // Navigate to Single Subject Page with visible feedback
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
        className: sub.class.name,
        classCode: sub.class.code,
        code: sub.code,
      });
      map.set(normalizedName, existing);
    }
    return map;
  }, [subjects]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass =
        selectedClassFilter === "ALL" || s.classId === selectedClassFilter;

      const matchesFaculty =
        selectedFacultyFilter === "ALL" ||
        (selectedFacultyFilter === "ASSIGNED" && s.assignments.length > 0) ||
        (selectedFacultyFilter === "UNASSIGNED" && s.assignments.length === 0);

      return matchesSearch && matchesClass && matchesFaculty;
    });
  }, [subjects, searchQuery, selectedClassFilter, selectedFacultyFilter]);

  // Derived Metrics
  const totalSubjectsCount = subjects.length;
  const totalAssignedFaculty = new Set(
    subjects.flatMap((s) => s.assignments.map((a) => a.teacher.id))
  ).size;
  const classesWithCurriculum = new Set(subjects.map((s) => s.classId)).size;
  const multiClassSubjectsCount = Array.from(subjectsAcrossClassesMap.values()).filter((list) => list.length > 1).length;

  // Real-time Validation Check for Create Form
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const codeTrim = formCode.trim().toUpperCase();

    if (!formName.trim()) {
      errors.push("Subject name is required.");
    } else if (formName.trim().length < 2) {
      errors.push("Subject name must be at least 2 characters.");
    }

    if (!codeTrim) {
      errors.push("Subject code is required (e.g. BP101T).");
    }

    if (formClassIds.length === 0) {
      errors.push("Please select at least one Target Academic Class.");
    }

    const max = Number(formMaxMarks);
    const pass = Number(formPassMarks);
    const cr = Number(formCredits);

    if (isNaN(max) || max <= 0) {
      errors.push("Maximum Marks must be greater than 0.");
    }
    if (isNaN(pass) || pass <= 0) {
      errors.push("Pass Marks must be greater than 0.");
    }
    if (pass > max) {
      errors.push(`Pass Marks (${pass}) cannot exceed Maximum Marks (${max}).`);
    }
    if (isNaN(cr) || cr < 1 || cr > 12) {
      errors.push("Credits must be between 1 and 12.");
    }

    return errors;
  }, [formName, formCode, formClassIds, formMaxMarks, formPassMarks, formCredits]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormName("");
    setFormCode("");
    setFormClassIds([classes[0]?.id || ""]);
    setFormMaxMarks("100");
    setFormPassMarks("35");
    setFormCredits("4");
    setFormTeacherId("");
    setFormSectionId("");
    setClassPickerSearch("");
    setClassPickerDegree("ALL");
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (subject: SubjectWithDetails) => {
    setEditingSubject(subject);
    setFormName(subject.name);
    setFormCode(subject.code);
    setFormClassIds([subject.classId]);
    setFormMaxMarks(String(subject.maxMarks));
    setFormPassMarks(String(subject.passMarks));
    setFormCredits(String(subject.credits));
    setFormTeacherId(subject.assignments[0]?.teacher.id || "");
    setFormSectionId(subject.assignments[0]?.section?.id || "");
    setClassPickerSearch("");
    setClassPickerDegree("ALL");
    setIsCreateModalOpen(true);
  };

  // Auto-Suggest Subject Code based on Subject Name & Class
  const handleAutoSuggestCode = () => {
    if (!formName.trim()) {
      toast.info("Please enter a Subject Name first to generate a code.");
      return;
    }

    const selectedClass = classes.find((c) => c.id === formClassIds[0]);
    const classPrefix = selectedClass ? selectedClass.code.replace(/[^A-Z0-9]/gi, "").toUpperCase() : "BP";

    // Extract acronym from subject name
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
    if (editingSubject) {
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

  // Select all / clear classes
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

  // Submit Add / Edit Form
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSubject) {
        // PUT update single subject
        const res = await fetch("/api/subjects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingSubject.id,
            name: formName.trim(),
            code: formCode.trim().toUpperCase(),
            classId: formClassIds[0],
            maxMarks: Number(formMaxMarks),
            passMarks: Number(formPassMarks),
            credits: Number(formCredits),
          }),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success(`Subject "${formName}" updated successfully!`);
          setIsCreateModalOpen(false);
          router.refresh();
          setSubjects((prev) =>
            prev.map((s) =>
              s.id === editingSubject.id
                ? {
                    ...s,
                    name: formName.trim(),
                    code: formCode.trim().toUpperCase(),
                    classId: formClassIds[0],
                    maxMarks: Number(formMaxMarks),
                    passMarks: Number(formPassMarks),
                    credits: Number(formCredits),
                    class: classes.find((c) => c.id === formClassIds[0]) || s.class,
                  }
                : s
            )
          );
        } else {
          toast.error(data.error || "Failed to update subject");
        }
      } else {
        // POST create with multi-class mapping support
        const res = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            code: formCode.trim().toUpperCase(),
            classIds: formClassIds,
            maxMarks: Number(formMaxMarks),
            passMarks: Number(formPassMarks),
            credits: Number(formCredits),
            teacherId: formTeacherId || undefined,
            sectionId: formSectionId || undefined,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || `Subject "${formName}" created and mapped successfully!`);
          setIsCreateModalOpen(false);
          router.refresh();
          window.location.reload();
        } else {
          toast.error(data.error || "Failed to create subject");
        }
      }
    } catch {
      toast.error("Network error while saving subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Subject
  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    try {
      const res = await fetch(`/api/subjects?id=${deletingSubject.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Subject "${deletingSubject.name}" deleted.`);
        setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
        setDeletingSubject(null);
      } else {
        toast.error(data.error || "Failed to delete subject");
      }
    } catch {
      toast.error("Network error while deleting subject");
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
            onClick={handleOpenCreate}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject by name, code (BP101T), or class..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
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
              value={selectedFacultyFilter}
              onChange={(e) => setSelectedFacultyFilter(e.target.value)}
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
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "GRID"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Spacious Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards View</span>
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "TABLE"
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
            {searchQuery || selectedClassFilter !== "ALL"
              ? "No subjects matched your search or class filter criteria. Try resetting the filters."
              : "No subjects have been added to the curriculum yet. Click '+ Add Subject' to begin."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Subject
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        /* SPACIOUS GRID CARDS VIEW (Clean, Uncompressed, Rich Feedback) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subj, idx) => {
            const primaryFaculty = subj.assignments[0]?.teacher;
            const sharedAcross = subjectsAcrossClassesMap.get(subj.name.trim().toLowerCase()) || [];
            const colorList = ["#0D9488", "#2563EB", "#7C3AED", "#D97706", "#DB2777", "#059669", "#4F46E5", "#EA580C"];
            const cardColor = colorList[idx % colorList.length];
            const isOpening = openingSubjectId === subj.id;

            // Acronym
            const words = subj.name.trim().split(/\s+/);
            const acronym = words.length > 1
              ? words.slice(0, 3).map((w: string) => w[0]).join("").toUpperCase()
              : subj.name.slice(0, 2).toUpperCase();

            return (
              <div
                key={subj.id}
                onClick={() => handleOpenSubjectHub(subj.id)}
                className={`bg-white rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between space-y-4 group cursor-pointer relative ${
                  isOpening
                    ? "border-teal-500 ring-3 ring-teal-500/20 bg-teal-50/15 scale-[0.99] shadow-inner"
                    : "border-slate-200/90 hover:border-teal-500 hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {/* Active Opening Feedback Banner */}
                {isOpening && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-3xl z-20 flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
                    <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg animate-bounce">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <p className="text-xs font-extrabold text-teal-900 font-heading">
                      Opening Single Subject Hub...
                    </p>
                    <span className="text-[10px] text-teal-700 font-medium">
                      Loading {subj.code} syllabus &amp; roster
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Row: Color Icon Avatar + Subject Name & Code + Edit/Delete Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md tracking-wider font-mono transition-transform group-hover:scale-105"
                        style={{ background: cardColor }}
                      >
                        {acronym}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/70">
                            {subj.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {subj.credits} Credits
                          </span>
                        </div>

                        <h3
                          className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug"
                          title={subj.name}
                        >
                          {subj.name}
                        </h3>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenEdit(subj)}
                        title="Edit Subject"
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-teal-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSubject(subj)}
                        title="Delete Subject"
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Academic Class & Marks Info Box */}
                  <div className="text-xs text-slate-600 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-100/90 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate font-medium text-slate-500">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Primary Class</span>
                      </span>
                      <strong className="text-slate-900 font-bold truncate max-w-[55%] text-right">
                        {subj.class.name}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 text-[11px]">
                      <span className="text-slate-400 font-medium">Evaluation Criteria</span>
                      <span className="font-mono font-bold text-slate-700">
                        Pass: <span className="text-teal-700">{subj.passMarks}</span> / Max: {subj.maxMarks}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Badges & Interactive Hub CTA */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                      {sharedAcross.length} {sharedAcross.length === 1 ? "Class" : "Classes"}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        primaryFaculty
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                          : "bg-amber-50 text-amber-800 border border-amber-200/70"
                      }`}
                    >
                      {primaryFaculty ? primaryFaculty.user.name : "Unassigned Faculty"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-600 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all">
                    {isOpening ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening...
                      </>
                    ) : (
                      <>
                        Subject Hub <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW (Clean with direct Hub Links) */
        <div className="data-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">CODE &amp; SUBJECT NAME</th>
                  <th className="table-th">ACADEMIC CLASS &amp; MAPPINGS</th>
                  <th className="table-th">MARKS &amp; CREDITS</th>
                  <th className="table-th">ASSIGNED FACULTY</th>
                  <th className="table-th">ENROLLED STUDENTS</th>
                  <th className="table-th text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((subj) => {
                  const isPractical = /practical|lab|viva/i.test(subj.name);
                  const studentCount = subj.class._count?.students || subj.class.students?.length || 0;
                  const primaryFaculty = subj.assignments[0]?.teacher;
                  const sharedAcross = subjectsAcrossClassesMap.get(subj.name.trim().toLowerCase()) || [];
                  const isOpening = openingSubjectId === subj.id;

                  return (
                    <tr
                      key={subj.id}
                      onClick={() => handleOpenSubjectHub(subj.id)}
                      className={`transition-colors cursor-pointer ${
                        isOpening ? "bg-teal-50" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                            {subj.code}
                          </span>
                          <div>
                            <Link
                              href={`/admin/subjects/${subj.id}`}
                              className="font-bold text-slate-900 text-sm hover:text-teal-700 hover:underline block"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpeningSubjectId(subj.id);
                              }}
                            >
                              {subj.name}
                            </Link>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {isPractical ? "Practical / Lab Course" : "Theory Core Course"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="table-td">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{subj.class.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({subj.class.code})</span>
                          </div>

                          {sharedAcross.length > 1 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="badge-indigo text-[9px]">
                                <Layers className="w-2.5 h-2.5 mr-0.5 inline" />
                                {sharedAcross.length} Classes Mapped
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="table-td">
                        <p className="font-medium text-slate-800">
                          Max: <strong className="text-slate-900">{subj.maxMarks}</strong> • Pass: <strong className="text-teal-700">{subj.passMarks}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400">{subj.credits} Credits</p>
                      </td>

                      <td className="table-td">
                        {primaryFaculty ? (
                          <div>
                            <p className="font-bold text-slate-900">{primaryFaculty.user.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {primaryFaculty.designation} ({primaryFaculty.employeeId})
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-bold">Unassigned</span>
                        )}
                      </td>

                      <td className="table-td">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {studentCount} Students
                        </span>
                      </td>

                      <td className="table-td text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenSubjectHub(subj.id)}
                            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                            title="Manage Single Subject Hub"
                          >
                            {isOpening ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening...
                              </>
                            ) : (
                              <>
                                Hub <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(subj)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSubject(subj)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ─── CREATE / EDIT SUBJECT MODAL (WITH MULTI-CLASS MAPPING) ──────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                    {editingSubject ? "Edit Subject Details" : "Add Subject & Map Across Classes"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingSubject
                      ? "Update curriculum metadata for this subject"
                      : "Choose multiple degree classes to automatically create and map this subject everywhere it is taught"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs">
              {/* Validation Warning Alert */}
              {validationErrors.length > 0 && formName && formCode && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Please check form requirements:</strong>
                    <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                      {validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Subject Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pharmaceutical Analysis - I, Human Anatomy & Physiology"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Code & Auto-Suggest */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Base Subject Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestCode}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Suggest Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BP102T, PHA-101"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When mapping to multiple classes, unique class suffixes (e.g. BP102T-DP1) will be safely generated if needed.
                </p>
              </div>

              {/* ─── TARGET ACADEMIC CLASSES (MULTI-SELECT COMPONENT) ──────── */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-teal-600" />
                      Target Academic Classes ({formClassIds.length} Selected) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Select all classes and cohorts where this subject is part of the syllabus.
                    </p>
                  </div>

                  {!editingSubject && (
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleSelectAllClasses}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-900 px-2 py-0.5 rounded bg-teal-50 border border-teal-200 cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllClasses}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-800 px-2 py-0.5 rounded bg-white border border-slate-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Class search and degree filter inside modal */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={classPickerSearch}
                      onChange={(e) => setClassPickerSearch(e.target.value)}
                      placeholder="Search classes..."
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <select
                    value={classPickerDegree}
                    onChange={(e) => setClassPickerDegree(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                  >
                    <option value="ALL">All Degrees</option>
                    <option value="BPHARM">B.Pharm</option>
                    <option value="MPHARM">M.Pharm</option>
                    <option value="PHARMD">Pharm.D</option>
                    <option value="DPHARM">D.Pharm</option>
                  </select>
                </div>

                {/* Checkbox Grid of Classes */}
                <div className="max-h-44 overflow-y-auto space-y-1 p-1 bg-white border border-slate-200 rounded-xl">
                  {filteredClassOptions.map((cls) => {
                    const isSelected = formClassIds.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors border ${
                          isSelected
                            ? "bg-teal-50 border-teal-300 text-teal-950 font-bold"
                            : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type={editingSubject ? "radio" : "checkbox"}
                            name="classChoice"
                            checked={isSelected}
                            onChange={() => handleToggleClass(cls.id)}
                            className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                          />
                          <span>
                            {cls.name} <span className="font-mono text-slate-400">({cls.code})</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {cls._count?.students || 0} Students
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Marks & Credits */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Maximum Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formMaxMarks}
                    onChange={(e) => setFormMaxMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Passing Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPassMarks}
                    onChange={(e) => setFormPassMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Credits <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={formCredits}
                    onChange={(e) => setFormCredits(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Optional Faculty Instructor Allocation on Create */}
              {!editingSubject && (
                <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    Assign Faculty Instructor (Optional)
                  </label>
                  <p className="text-[10px] text-slate-500">
                    If selected, this teacher will be automatically assigned to teach this subject across all chosen classes.
                  </p>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="">— Skip for now (Assign later) —</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user.name} • {t.designation} ({t.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || validationErrors.length > 0}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : editingSubject ? (
                    "Save Subject Changes"
                  ) : (
                    `Create & Map to ${formClassIds.length} Class${formClassIds.length > 1 ? "es" : ""}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── BULK CSV IMPORT MODAL ─────────────────────────────────────────────── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">Bulk Import Subjects via CSV</h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Quickly upload semester subjects mapped across classes using standard CSV format:
            </p>

            <div className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl overflow-x-auto">
              Subject Code,Subject Name,Class Code,Max Marks,Pass Marks,Credits<br />
              BP101T,Human Anatomy &amp; Physiology - I,INT-1,100,35,4<br />
              BP102T,Pharmaceutical Analysis - I,INT-1,100,35,4<br />
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
      )}

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
