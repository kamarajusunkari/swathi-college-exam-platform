import { create } from "zustand";

export type AcademicViewState = "PROGRAMS" | "YEARS" | "SECTIONS" | "DETAILS";
export type SubjectViewMode = "GRID" | "TABLE";
export type SubjectDetailTab = "OVERVIEW" | "STUDENTS" | "EXAMS" | "ANALYTICS";

export interface DeleteTargetEntity {
  id: string;
  name: string;
  type: "program" | "class" | "section" | "subject";
}

interface AcademicStoreState {
  // Navigation & Hierarchy State
  view: AcademicViewState;
  selectedProgram: string | null;
  selectedClassId: string | null;
  selectedSectionId: string | null;
  academicSearch: string;

  // Subjects List State
  subjectSearch: string;
  subjectClassFilter: string;
  subjectFacultyFilter: string;
  subjectViewMode: SubjectViewMode;
  openingSubjectId: string | null;

  // Subject Detail State
  activeSubjectTab: SubjectDetailTab;
  studentSearch: string;

  // Modals & Action State
  isAddClassModalOpen: boolean;
  isBulkClassModalOpen: boolean;
  isProgramModalOpen: boolean;
  isAddSectionModalOpen: boolean;
  isEditClassModalOpen: boolean;
  isEditSectionModalOpen: boolean;
  isSubjectCreateModalOpen: boolean;
  isSubjectAssignModalOpen: boolean;
  isSubjectMapModalOpen: boolean;
  isSubjectEditModalOpen: boolean;
  deleteTarget: DeleteTargetEntity | null;
  editingEntity: any | null;

  // Hierarchy Actions
  setView: (view: AcademicViewState) => void;
  setSelectedProgram: (programId: string | null) => void;
  setSelectedClassId: (classId: string | null) => void;
  setSelectedSectionId: (sectionId: string | null) => void;
  setAcademicSearch: (search: string) => void;
  goToPrograms: () => void;
  goToYears: (programId: string) => void;
  goToSections: (classId: string) => void;
  goToDetails: (sectionId: string) => void;

  // Subjects Actions
  setSubjectSearch: (search: string) => void;
  setSubjectClassFilter: (classId: string) => void;
  setSubjectFacultyFilter: (facultyId: string) => void;
  setSubjectViewMode: (mode: SubjectViewMode) => void;
  setOpeningSubjectId: (id: string | null) => void;

  // Subject Detail Actions
  setActiveSubjectTab: (tab: SubjectDetailTab) => void;
  setStudentSearch: (search: string) => void;

  // Modal Actions
  openAddClassModal: () => void;
  closeAddClassModal: () => void;
  openBulkClassModal: () => void;
  closeBulkClassModal: () => void;
  openProgramModal: (program?: any) => void;
  closeProgramModal: () => void;
  openAddSectionModal: () => void;
  closeAddSectionModal: () => void;
  openEditClassModal: (classEntity: any) => void;
  closeEditClassModal: () => void;
  openEditSectionModal: (sectionEntity: any) => void;
  closeEditSectionModal: () => void;
  openSubjectCreateModal: (subject?: any) => void;
  closeSubjectCreateModal: () => void;
  openSubjectAssignModal: () => void;
  closeSubjectAssignModal: () => void;
  openSubjectMapModal: () => void;
  closeSubjectMapModal: () => void;
  openSubjectEditModal: () => void;
  closeSubjectEditModal: () => void;
  openDeleteModal: (target: DeleteTargetEntity) => void;
  closeDeleteModal: () => void;

  // Reset Actions
  resetFilters: () => void;
  resetNavigation: () => void;
}

export const useAcademicStore = create<AcademicStoreState>((set) => ({
  // Navigation & Hierarchy Initial State
  view: "PROGRAMS",
  selectedProgram: null,
  selectedClassId: null,
  selectedSectionId: null,
  academicSearch: "",

  // Subjects List Initial State
  subjectSearch: "",
  subjectClassFilter: "ALL",
  subjectFacultyFilter: "ALL",
  subjectViewMode: "GRID",
  openingSubjectId: null,

  // Subject Detail Initial State
  activeSubjectTab: "OVERVIEW",
  studentSearch: "",

  // Modals Initial State
  isAddClassModalOpen: false,
  isBulkClassModalOpen: false,
  isProgramModalOpen: false,
  isAddSectionModalOpen: false,
  isEditClassModalOpen: false,
  isEditSectionModalOpen: false,
  isSubjectCreateModalOpen: false,
  isSubjectAssignModalOpen: false,
  isSubjectMapModalOpen: false,
  isSubjectEditModalOpen: false,
  deleteTarget: null,
  editingEntity: null,

  // Hierarchy Actions
  setView: (view) => set({ view }),
  setSelectedProgram: (selectedProgram) => set({ selectedProgram }),
  setSelectedClassId: (selectedClassId) => set({ selectedClassId }),
  setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
  setAcademicSearch: (academicSearch) => set({ academicSearch }),
  goToPrograms: () =>
    set({
      view: "PROGRAMS",
      selectedProgram: null,
      selectedClassId: null,
      selectedSectionId: null,
    }),
  goToYears: (programId) =>
    set({
      view: "YEARS",
      selectedProgram: programId,
      selectedClassId: null,
      selectedSectionId: null,
    }),
  goToSections: (classId) =>
    set({
      view: "SECTIONS",
      selectedClassId: classId,
      selectedSectionId: null,
    }),
  goToDetails: (sectionId) =>
    set({
      view: "DETAILS",
      selectedSectionId: sectionId,
    }),

  // Subjects Actions
  setSubjectSearch: (subjectSearch) => set({ subjectSearch }),
  setSubjectClassFilter: (subjectClassFilter) => set({ subjectClassFilter }),
  setSubjectFacultyFilter: (subjectFacultyFilter) => set({ subjectFacultyFilter }),
  setSubjectViewMode: (subjectViewMode) => set({ subjectViewMode }),
  setOpeningSubjectId: (openingSubjectId) => set({ openingSubjectId }),

  // Subject Detail Actions
  setActiveSubjectTab: (activeSubjectTab) => set({ activeSubjectTab }),
  setStudentSearch: (studentSearch) => set({ studentSearch }),

  // Modal Actions
  openAddClassModal: () => set({ isAddClassModalOpen: true }),
  closeAddClassModal: () => set({ isAddClassModalOpen: false }),
  openBulkClassModal: () => set({ isBulkClassModalOpen: true }),
  closeBulkClassModal: () => set({ isBulkClassModalOpen: false }),
  openProgramModal: (program = null) =>
    set({ isProgramModalOpen: true, editingEntity: program }),
  closeProgramModal: () => set({ isProgramModalOpen: false, editingEntity: null }),
  openAddSectionModal: () => set({ isAddSectionModalOpen: true }),
  closeAddSectionModal: () => set({ isAddSectionModalOpen: false }),
  openEditClassModal: (classEntity) =>
    set({ isEditClassModalOpen: true, editingEntity: classEntity }),
  closeEditClassModal: () => set({ isEditClassModalOpen: false, editingEntity: null }),
  openEditSectionModal: (sectionEntity) =>
    set({ isEditSectionModalOpen: true, editingEntity: sectionEntity }),
  closeEditSectionModal: () =>
    set({ isEditSectionModalOpen: false, editingEntity: null }),
  openSubjectCreateModal: (subject = null) =>
    set({ isSubjectCreateModalOpen: true, editingEntity: subject }),
  closeSubjectCreateModal: () =>
    set({ isSubjectCreateModalOpen: false, editingEntity: null }),
  openSubjectAssignModal: () => set({ isSubjectAssignModalOpen: true }),
  closeSubjectAssignModal: () => set({ isSubjectAssignModalOpen: false }),
  openSubjectMapModal: () => set({ isSubjectMapModalOpen: true }),
  closeSubjectMapModal: () => set({ isSubjectMapModalOpen: false }),
  openSubjectEditModal: () => set({ isSubjectEditModalOpen: true }),
  closeSubjectEditModal: () => set({ isSubjectEditModalOpen: false }),
  openDeleteModal: (deleteTarget) => set({ deleteTarget }),
  closeDeleteModal: () => set({ deleteTarget: null }),

  // Reset Actions
  resetFilters: () =>
    set({
      academicSearch: "",
      subjectSearch: "",
      subjectClassFilter: "ALL",
      subjectFacultyFilter: "ALL",
      studentSearch: "",
    }),
  resetNavigation: () =>
    set({
      view: "PROGRAMS",
      selectedProgram: null,
      selectedClassId: null,
      selectedSectionId: null,
      academicSearch: "",
    }),
}));
