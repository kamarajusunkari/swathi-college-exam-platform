"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Building,
  Plus,
  UploadCloud,
  Search,
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  X,
  FileDown,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  UserCircle2,
  Edit2,
  Layers,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import {
  useAcademicHierarchy,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useCreateClassMutation,
  useUpdateClassMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useBulkImportClassesMutation,
  useDeleteEntityMutation,
} from "@/features/academic/academic.queries";
import {
  createProgramSchema,
  updateProgramSchema,
  createClassSchema,
  updateClassSchema,
  createSectionSchema,
  updateSectionSchema,
} from "@/features/academic/academic.schema";
import {
  useAcademicStore,
  AcademicViewState,
} from "@/stores/academic.store";

interface Props {
  classes: any[];
  programs?: any[];
  subjects: any[];
  academicYears: any[];
  totalStudentsCount: number;
  currentUser: any;
}

const DEFAULT_PROGRAMS = [
  { id: "BPHARM", name: "B.Pharmacy", description: "Bachelor of Pharmacy (4 Years)", duration: 4 },
  { id: "MPHARM", name: "M.Pharmacy", description: "Master of Pharmacy (2 Years)", duration: 2 },
  { id: "PHARMD", name: "Pharm.D", description: "Doctor of Pharmacy (6 Years)", duration: 6 },
  { id: "DPHARM", name: "D.Pharmacy", description: "Diploma in Pharmacy (2 Years)", duration: 2 },
];

export function AcademicClient({
  classes: initialClasses,
  programs: initialPrograms,
  subjects: initialSubjects,
  academicYears: initialAcademicYears,
  totalStudentsCount: initialStudentCount,
  currentUser,
}: Props) {
  const router = useRouter();

  // --- TanStack Query for Academic Hierarchy ---
  const { data: hierarchyData, isLoading: isHierarchyLoading } = useAcademicHierarchy({
    classes: initialClasses,
    programs: initialPrograms,
    subjects: initialSubjects,
    academicYears: initialAcademicYears,
  });

  // Extract reactive query data or fall back to props
  const classList = useMemo(() => hierarchyData?.classes || initialClasses || [], [hierarchyData, initialClasses]);
  const rawProgramList = useMemo(() => hierarchyData?.programs || initialPrograms || [], [hierarchyData, initialPrograms]);
  const subjectsList = useMemo(() => hierarchyData?.subjects || initialSubjects || [], [hierarchyData, initialSubjects]);
  const academicYearsList = useMemo(() => hierarchyData?.academicYears || initialAcademicYears || [], [hierarchyData, initialAcademicYears]);

  // Merge database programs with default templates if not in DB
  const programList = useMemo(() => {
    if (!rawProgramList || rawProgramList.length === 0) {
      return DEFAULT_PROGRAMS;
    }
    // Combine DB programs with any defaults whose IDs/codes aren't already represented
    const dbCodes = new Set(rawProgramList.map((p: any) => (p.code || p.id).toUpperCase()));
    const missingDefaults = DEFAULT_PROGRAMS.filter((dp) => !dbCodes.has(dp.id.toUpperCase()));
    return [...rawProgramList, ...missingDefaults];
  }, [rawProgramList]);

  // --- Zustand Store State ---
  const {
    view,
    selectedProgram,
    selectedClassId,
    selectedSectionId,
    academicSearch,
    isAddClassModalOpen,
    isBulkClassModalOpen,
    isProgramModalOpen,
    isAddSectionModalOpen,
    isEditClassModalOpen,
    isEditSectionModalOpen,
    deleteTarget,
    editingEntity,
    setView,
    setSelectedProgram,
    setSelectedClassId,
    setSelectedSectionId,
    setAcademicSearch,
    openAddClassModal,
    closeAddClassModal,
    openBulkClassModal,
    closeBulkClassModal,
    openProgramModal,
    closeProgramModal,
    openAddSectionModal,
    closeAddSectionModal,
    openEditClassModal,
    closeEditClassModal,
    openEditSectionModal,
    closeEditSectionModal,
    openDeleteModal,
    closeDeleteModal,
  } = useAcademicStore();

  // --- Reactive Entity Resolution ---
  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classList.find((c: any) => c.id === selectedClassId) || null;
  }, [classList, selectedClassId]);

  const selectedSection = useMemo(() => {
    if (!selectedClass || !selectedSectionId) return null;
    return selectedClass.sections?.find((s: any) => s.id === selectedSectionId) || null;
  }, [selectedClass, selectedSectionId]);

  // --- TanStack Query Mutations ---
  const createProgramMutation = useCreateProgramMutation();
  const updateProgramMutation = useUpdateProgramMutation();
  const createClassMutation = useCreateClassMutation();
  const updateClassMutation = useUpdateClassMutation();
  const createSectionMutation = useCreateSectionMutation();
  const updateSectionMutation = useUpdateSectionMutation();
  const bulkImportMutation = useBulkImportClassesMutation();
  const deleteEntityMutation = useDeleteEntityMutation();

  const isSubmitting =
    createProgramMutation.isPending ||
    updateProgramMutation.isPending ||
    createClassMutation.isPending ||
    updateClassMutation.isPending ||
    createSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    bulkImportMutation.isPending ||
    deleteEntityMutation.isPending;

  // --- Local Form State (validated with Zod on submit) ---
  // Program form
  const [progName, setProgName] = useState("");
  const [progCode, setProgCode] = useState("");
  const [progDesc, setProgDesc] = useState("");
  const [progDuration, setProgDuration] = useState(4);

  // New Class Form State
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newDegree, setNewDegree] = useState("");
  const [newYear, setNewYear] = useState(1);
  const [newSemester, setNewSemester] = useState(1);
  const [newSection, setNewSection] = useState("Section A");
  const [newIntake, setNewIntake] = useState(60);
  const [classFormErrors, setClassFormErrors] = useState<Record<string, string>>({});

  // Section forms
  const [newSectionName, setNewSectionName] = useState("");
  const [editSectionName, setEditSectionName] = useState("");

  // Edit Class Form
  const [editClassName, setEditClassName] = useState("");
  const [editClassCode, setEditClassCode] = useState("");

  // Bulk Import File State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);

  // Sync editing entity to form fields when modals open
  useEffect(() => {
    if (isProgramModalOpen && editingEntity) {
      setProgName(editingEntity.name || "");
      setProgCode(editingEntity.code || editingEntity.id || "");
      setProgDesc(editingEntity.description || "");
      setProgDuration(editingEntity.duration || 4);
    } else if (isProgramModalOpen && !editingEntity) {
      setProgName("");
      setProgCode("");
      setProgDesc("");
      setProgDuration(4);
    }
  }, [isProgramModalOpen, editingEntity]);

  useEffect(() => {
    if (isEditClassModalOpen && editingEntity) {
      setEditClassName(editingEntity.name || "");
      setEditClassCode(editingEntity.code || "");
    }
  }, [isEditClassModalOpen, editingEntity]);

  useEffect(() => {
    if (isEditSectionModalOpen && editingEntity) {
      setEditSectionName(editingEntity.name || "");
    }
  }, [isEditSectionModalOpen, editingEntity]);

  useEffect(() => {
    if (isAddClassModalOpen && programList.length > 0 && !newDegree) {
      setNewDegree(programList[0].id);
    }
  }, [isAddClassModalOpen, programList, newDegree]);

  // Derived Stats for Programs
  const programStats = useMemo(() => {
    return programList.map((prog: any) => {
      const matchCode = prog.code || prog.id;
      const progClasses = classList.filter(
        (c: any) =>
          c.programId === prog.id ||
          (c.programId == null && c?.code?.startsWith(matchCode))
      );
      const progStudents = progClasses.reduce(
        (acc: number, c: any) => acc + (c.students?.length || 0),
        0
      );
      return { ...prog, matchCode, classesCount: progClasses.length, studentsCount: progStudents };
    });
  }, [classList, programList]);

  const classesForSelectedProgram = useMemo(() => {
    if (!selectedProgram) return [];
    const prog = programStats.find((p: any) => p.id === selectedProgram);
    const matchCode = prog?.matchCode || selectedProgram;
    return classList.filter(
      (c: any) =>
        c.programId === selectedProgram ||
        (c.programId == null && c?.code?.startsWith(matchCode))
    );
  }, [classList, selectedProgram, programStats]);

  const studentsForSelectedSection = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    return (selectedClass.students || []).filter(
      (s: any) => s.sectionId === selectedSection.id
    );
  }, [selectedClass, selectedSection]);

  const totalCalculatedStudents = useMemo(() => {
    return classList.reduce((acc: number, c: any) => acc + (c.students?.length || 0), 0) || initialStudentCount;
  }, [classList, initialStudentCount]);

  // --- Handlers with Zod Validation & TanStack Mutation ---

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: progName.trim(),
      code: progCode.trim().toUpperCase(),
      description: progDesc.trim() || undefined,
      duration: Number(progDuration),
    };

    const validation = createProgramSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid program details");
      return;
    }

    try {
      if (editingEntity?.id && !DEFAULT_PROGRAMS.some((p) => p.id === editingEntity.id)) {
        await updateProgramMutation.mutateAsync({
          id: editingEntity.id,
          payload: validation.data,
        });
        toast.success(`Program "${validation.data.name}" updated successfully!`);
      } else {
        await createProgramMutation.mutateAsync(validation.data);
        toast.success(`Program "${validation.data.name}" created successfully!`);
      }
      closeProgramModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save program.");
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassFormErrors({});

    const rawPayload = {
      name: newClassName.trim(),
      code: newClassCode.trim().toUpperCase(),
      sectionName: newSection.trim() || "Section A",
      programId: newDegree || undefined,
    };

    const validation = createClassSchema.safeParse(rawPayload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setClassFormErrors(fieldErrors);
      toast.error(validation.error.errors[0]?.message || "Please fix validation errors");
      return;
    }

    try {
      await createClassMutation.mutateAsync(validation.data);
      toast.success(`Class ${validation.data.name} (${validation.data.code}) created successfully!`);
      closeAddClassModal();
      setNewClassName("");
      setNewClassCode("");
      setNewSection("Section A");
      setClassFormErrors({});
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to create class.");
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    const payload = {
      name: newSectionName.trim(),
      classId: selectedClass.id,
    };

    const validation = createSectionSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Section name is required");
      return;
    }

    try {
      await createSectionMutation.mutateAsync(validation.data);
      toast.success(`Section ${validation.data.name} added successfully!`);
      closeAddSectionModal();
      setNewSectionName("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to create section.");
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity?.id) return;

    const payload = {
      name: editClassName.trim(),
      code: editClassCode.trim().toUpperCase(),
    };

    const validation = updateClassSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid class details");
      return;
    }

    try {
      await updateClassMutation.mutateAsync({
        id: editingEntity.id,
        payload: validation.data,
      });
      toast.success("Class updated successfully!");
      closeEditClassModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to update class.");
    }
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity?.id) return;

    const payload = {
      name: editSectionName.trim(),
    };

    const validation = updateSectionSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid section name");
      return;
    }

    try {
      await updateSectionMutation.mutateAsync({
        id: editingEntity.id,
        payload: validation.data,
      });
      toast.success("Section updated successfully!");
      closeEditSectionModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to update section.");
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Class Code,Class Name,Degree,Year,Semester,Section,Intake Capacity\n" +
      "BPHARM-SEM-05,B.Pharm V-Semester,B.Pharm,3,5,Section A,60\n" +
      "BPHARM-SEM-06,B.Pharm VI-Semester,B.Pharm,3,6,Section A,60\n" +
      "MPHARM-PCHEM-01,M.Pharm Pharmaceutical Chemistry I-Sem,M.Pharm,1,1,Section A,18\n" +
      "PHARMD-YR-01,Pharm.D 1st Year,Pharm.D,1,1,Section A,30";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Swathi_College_Classes_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample template downloaded.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkPreview([
      { code: "BPHARM-SEM-07", name: "B.Pharm VII-Semester", degree: "B.Pharm", year: 4, sem: 7, sec: "Section A", intake: 60 },
      { code: "BPHARM-SEM-08", name: "B.Pharm VIII-Semester", degree: "B.Pharm", year: 4, sem: 8, sec: "Section A", intake: 60 },
      { code: "MPHARM-PCOL-01", name: "M.Pharm Pharmacology I-Sem", degree: "M.Pharm", year: 1, sem: 1, sec: "Section A", intake: 18 },
    ]);
  };

  const handleExecuteBulk = async () => {
    if (bulkPreview.length === 0) {
      toast.error("Please choose a CSV file first.");
      return;
    }

    try {
      await bulkImportMutation.mutateAsync({
        classes: bulkPreview.map((item) => ({
          name: item.name,
          code: item.code,
          sectionName: item.sec || "Section A",
        })),
      });
      toast.success(`Successfully imported ${bulkPreview.length} academic classes!`);
      closeBulkClassModal();
      setBulkFile(null);
      setBulkPreview([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to bulk import classes.");
    }
  };

  // --- Views Rendering ---

  const renderProgramsView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-800">Available Programs</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programStats.map((prog: any) => (
          <div
            key={prog.id}
            onClick={() => {
              setSelectedProgram(prog.id);
              setView("YEARS");
            }}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{prog.description}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProgramModal(prog);
                    }}
                    className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                    title="Edit Program"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal({ id: prog.id, name: prog.name, type: "program" });
                    }}
                    className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete Program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-2.5">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Course Duration</span>
                  <span className="block text-sm font-bold text-slate-800">{prog.duration || 1} Years</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Enrolled Students</span>
                  <span className="block text-sm font-bold text-slate-800">{prog.studentsCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-teal-600 text-xs font-semibold">
                <span>View Classes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderYearsView = () => {
    const prog = programList.find((p: any) => p.id === selectedProgram);
    const filtered = classesForSelectedProgram.filter(
      (c: any) =>
        c.name.toLowerCase().includes(academicSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(academicSearch.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView("PROGRAMS");
              setSelectedProgram(null);
            }}
            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-teal-600">{prog?.name}</span>
              <span className="text-slate-400 font-normal text-sm">/</span>
              <span>Classes & Years</span>
            </h2>
          </div>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={academicSearch}
            onChange={(e) => setAcademicSearch(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c: any) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedClassId(c.id);
                  setView("SECTIONS");
                  setAcademicSearch("");
                }}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-teal-400 transition shadow-sm hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-mono text-[11px] font-semibold border border-teal-200">
                      {c.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-teal-700 transition-colors">
                      {c.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditClassModal(c);
                      }}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                      title="Edit Class"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal({ id: c.id, name: c.name, type: "class" });
                      }}
                      className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Enrolled Students</span>
                    <span className="block text-sm font-bold text-slate-800">{c.students?.length || 0}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Active Sections</span>
                    <span className="block text-sm font-bold text-slate-800">{c.sections?.length || 0} Sections</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <span className="text-teal-600 text-xs font-semibold flex items-center gap-1">
                    View Sections <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No classes found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    );
  };

  const renderSectionsView = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView("YEARS");
              setSelectedClassId(null);
            }}
            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-slate-500">{selectedClass?.name}</span>
              <span className="text-slate-400 font-normal text-sm">/</span>
              <span className="text-teal-600">Sections</span>
            </h2>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setNewSectionName("");
              openAddSectionModal();
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {selectedClass?.sections?.map((sec: any) => {
            const secStudents = (selectedClass.students || []).filter((s: any) => s.sectionId === sec.id);
            return (
              <div
                key={sec.id}
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  setView("DETAILS");
                }}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-teal-400 transition shadow-sm hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {sec.name}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditSectionModal(sec);
                      }}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                      title="Edit Section"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal({ id: sec.id, name: sec.name, type: "section" });
                      }}
                      className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Enrolled Students</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    {secStudents.length}
                  </span>
                </div>

                <div className="flex justify-end">
                  <span className="text-teal-600 text-xs font-semibold flex items-center gap-1">
                    View Student List <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {(!selectedClass?.sections || selectedClass.sections.length === 0) && (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No sections created yet.</p>
          </div>
        )}
      </div>
    );
  };

  const renderDetailsView = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setView("SECTIONS");
                setSelectedSectionId(null);
              }}
              className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-slate-500">{selectedClass?.name}</span>
                <span className="text-slate-400 font-normal text-sm">/</span>
                <span className="text-teal-600">{selectedSection?.name} Students</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="w-4 h-4 text-teal-600" />
              {studentsForSelectedSection.length} Students Enrolled
            </div>
          </div>

          {studentsForSelectedSection.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student Info</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsForSelectedSection.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <UserCircle2 className="w-8 h-8 text-slate-400" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{student.user?.name || "Student Name"}</p>
                            <p className="text-xs text-slate-500">{student.user?.email || "No Email provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {student.rollNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-sm">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/users/students/${student.id}`}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200 inline-block"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 text-lg">No students found</p>
              <p className="text-sm mt-1">There are no students currently enrolled in this section.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header (Only show in Programs view, otherwise minimal header is in views) */}
      {view === "PROGRAMS" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="page-header-title">Academic Programs & Classes</h1>
              <p className="page-header-subtitle">
                {classList.length} academic classes • {totalCalculatedStudents} enrolled students
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/admin/subjects" className="btn-outline">
                <BookOpen className="w-4 h-4 text-teal-600" />
                Manage Subjects
              </Link>
              <button
                onClick={() => {
                  openProgramModal(null);
                }}
                className="btn-outline"
              >
                <Building className="w-4 h-4 text-teal-600" />
                Add Program
              </button>
              <button onClick={openAddClassModal} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Class
              </button>
              <button onClick={openBulkClassModal} className="btn-outline">
                <UploadCloud className="w-4 h-4 text-slate-500" />
                Bulk Import
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kpi-card">
              <div className="kpi-icon-box bg-blue-50 text-blue-600">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="kpi-number">{classList.length}</p>
                <p className="kpi-label">Total Classes</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="kpi-number">{totalCalculatedStudents}</p>
                <p className="kpi-label">Total Students</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon-box bg-purple-50 text-purple-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="kpi-number">{subjectsList.length}</p>
                <p className="kpi-label">Subject Assignments</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon-box bg-teal-50 text-teal-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="kpi-number">{academicYearsList.length}</p>
                <p className="kpi-label">Academic Sessions</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dynamic Views Rendering */}
      {view === "PROGRAMS" && renderProgramsView()}
      {view === "YEARS" && renderYearsView()}
      {view === "SECTIONS" && renderSectionsView()}
      {view === "DETAILS" && renderDetailsView()}

      {/* --- Modals --- */}

      {/* Program Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {editingEntity ? "Edit Program" : "Add New Program"}
                  </h2>
                  <p className="text-xs text-slate-500">Manage high-level academic programs</p>
                </div>
              </div>
              <button
                onClick={closeProgramModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Program Name</label>
                <input
                  type="text"
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  placeholder="e.g. B.Pharmacy"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Program Code</label>
                <input
                  type="text"
                  value={progCode}
                  onChange={(e) => setProgCode(e.target.value)}
                  placeholder="e.g. BPHARM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors uppercase font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Duration (Years)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={progDuration}
                  onChange={(e) => setProgDuration(Number(e.target.value))}
                  placeholder="e.g. 4"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  value={progDesc}
                  onChange={(e) => setProgDesc(e.target.value)}
                  placeholder="e.g. Bachelor of Pharmacy (4 Years)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeProgramModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Add New Academic Class</h2>
                  <p className="text-xs text-slate-500">Create program cohort for curriculum & evaluation</p>
                </div>
              </div>
              <button
                onClick={closeAddClassModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4 text-xs">
              {programList.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No Programs Found</p>
                  <p className="text-slate-500 mt-1">Please create an academic program first before adding classes.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Program / Degree</label>
                      <select
                        value={newDegree}
                        onChange={(e) => {
                          setNewDegree(e.target.value);
                          if (classFormErrors.programId) {
                            setClassFormErrors((prev) => ({ ...prev, programId: "" }));
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-slate-800 transition-colors outline-none ${
                          classFormErrors.programId
                            ? "border-rose-500 focus:border-rose-600 bg-rose-50/30"
                            : "border-slate-200 focus:border-teal-500"
                        }`}
                      >
                        {programList.map((prog: any) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name} ({prog.code || prog.id})
                          </option>
                        ))}
                      </select>
                      {classFormErrors.programId && (
                        <p className="text-[10px] text-rose-500 font-medium">{classFormErrors.programId}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Class Name</label>
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => {
                          setNewClassName(e.target.value);
                          if (classFormErrors.name) setClassFormErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        placeholder="e.g. B.Pharm V-Semester"
                        className={`w-full p-2.5 rounded-xl border transition-colors outline-none ${
                          classFormErrors.name
                            ? "border-rose-500 focus:border-rose-600 bg-rose-50/30"
                            : "border-slate-200 focus:border-teal-500"
                        }`}
                      />
                      {classFormErrors.name && (
                        <p className="text-[10px] text-rose-500 font-medium">{classFormErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Class Code</label>
                      <input
                        type="text"
                        value={newClassCode}
                        onChange={(e) => {
                          setNewClassCode(e.target.value);
                          if (classFormErrors.code) setClassFormErrors((prev) => ({ ...prev, code: "" }));
                        }}
                        placeholder="e.g. BPHARM-SEM-05"
                        className={`w-full p-2.5 rounded-xl border font-mono uppercase transition-colors outline-none ${
                          classFormErrors.code
                            ? "border-rose-500 focus:border-rose-600 bg-rose-50/30"
                            : "border-slate-200 focus:border-teal-500"
                        }`}
                      />
                      {classFormErrors.code && (
                        <p className="text-[10px] text-rose-500 font-medium">{classFormErrors.code}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Year</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={newYear}
                        onChange={(e) => setNewYear(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Semester</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={newSemester}
                        onChange={(e) => setNewSemester(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Intake Capacity</label>
                      <input
                        type="number"
                        value={newIntake}
                        onChange={(e) => setNewIntake(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Initial Section</label>
                    <input
                      type="text"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      placeholder="Section A"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={closeAddClassModal}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
                    >
                      Cancel
                    </button>
                    {programList.length > 0 && (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isSubmitting ? "Saving..." : "Save Class"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bulk Import Classes & Cohorts</h2>
                  <p className="text-xs text-slate-500">Upload CSV spreadsheet with class codes & sections</p>
                </div>
              </div>
              <button
                onClick={closeBulkClassModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                <div>
                  <p className="font-semibold text-teal-900">Download Official CSV Template</p>
                  <p className="text-teal-700 text-[11px]">Use our standardized column formatting for error-free import</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-semibold flex items-center gap-1.5 transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="class-file-input"
                />
                <label htmlFor="class-file-input" className="cursor-pointer space-y-2 block">
                  <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-800">
                    {bulkFile ? bulkFile.name : "Click to browse or drop CSV file here"}
                  </p>
                  <p className="text-[11px] text-slate-400">Supports .CSV, .XLSX (Max 10MB)</p>
                </label>
              </div>

              {bulkPreview.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    Preview Classes to Import ({bulkPreview.length} items)
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2">Code</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Degree</th>
                          <th className="p-2">Intake</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkPreview.map((item, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono text-teal-700 font-semibold">{item.code}</td>
                            <td className="p-2 font-medium text-slate-900">{item.name}</td>
                            <td className="p-2 text-slate-600">{item.degree}</td>
                            <td className="p-2 text-slate-600">{item.intake}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeBulkClassModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulk}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Import Classes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Add Section</h2>
                  <p className="text-[10px] text-slate-500">for {selectedClass?.name}</p>
                </div>
              </div>
              <button
                onClick={closeAddSectionModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Section Name</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g. Section B"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeAddSectionModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Edit Class (Year)</h2>
                </div>
              </div>
              <button
                onClick={closeEditClassModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Class Name</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Class Code</label>
                <input
                  type="text"
                  value={editClassCode}
                  onChange={(e) => setEditClassCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors uppercase font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditClassModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {isEditSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Edit Section</h2>
                </div>
              </div>
              <button
                onClick={closeEditSectionModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSection} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Section Name</label>
                <input
                  type="text"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditSectionModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        onSuccess={() => {
          if (deleteTarget?.type === "program" && selectedProgram === deleteTarget.id) {
            setView("PROGRAMS");
            setSelectedProgram(null);
          } else if (deleteTarget?.type === "class" && selectedClassId === deleteTarget.id) {
            setView("YEARS");
            setSelectedClassId(null);
          } else if (deleteTarget?.type === "section" && selectedSectionId === deleteTarget.id) {
            setView("SECTIONS");
            setSelectedSectionId(null);
          }
          closeDeleteModal();
        }}
        title={`Delete ${deleteTarget?.type === "class" ? "Class" : deleteTarget?.type === "section" ? "Section" : "Program"}`}
        description={
          deleteTarget?.type === "program"
            ? `Are you sure you want to delete the program "${deleteTarget?.name}"? This will permanently remove ALL associated classes, sections, and data.`
            : `Are you sure you want to delete ${deleteTarget?.type === "class" ? "this class" : "this section"}? All associated students, exams, and data will be permanently removed.`
        }
        itemIdentifier={deleteTarget?.name}
        customDeleteFn={
          deleteTarget
            ? async () => {
                await deleteEntityMutation.mutateAsync({
                  type: deleteTarget.type,
                  id: deleteTarget.id,
                });
                toast.success(`${deleteTarget.name} deleted successfully!`);
              }
            : undefined
        }
      />
    </div>
  );
}
