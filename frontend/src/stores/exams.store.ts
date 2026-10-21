import { create } from "zustand";

interface ExamsStoreState {
  // Search & Filter
  searchQuery: string;
  selectedClassFilter: string;
  selectedStatusFilter: string;
  selectedVaultFilter: "ALL" | "RELEASED" | "LOCKED";

  // Modals & Active Selections
  selectedExamForInspect: any | null;
  deleteTarget: any | null;
  showUploadZone: boolean;
  showAiKeyModal: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedClassFilter: (classId: string) => void;
  setSelectedStatusFilter: (status: string) => void;
  setSelectedVaultFilter: (filter: "ALL" | "RELEASED" | "LOCKED") => void;
  setSelectedExamForInspect: (exam: any | null) => void;
  setDeleteTarget: (exam: any | null) => void;
  setShowUploadZone: (show: boolean) => void;
  setShowAiKeyModal: (show: boolean) => void;
  resetFilters: () => void;
}

export const useExamsStore = create<ExamsStoreState>((set) => ({
  searchQuery: "",
  selectedClassFilter: "ALL",
  selectedStatusFilter: "ALL",
  selectedVaultFilter: "ALL",

  selectedExamForInspect: null,
  deleteTarget: null,
  showUploadZone: false,
  showAiKeyModal: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedClassFilter: (selectedClassFilter) => set({ selectedClassFilter }),
  setSelectedStatusFilter: (selectedStatusFilter) => set({ selectedStatusFilter }),
  setSelectedVaultFilter: (selectedVaultFilter) => set({ selectedVaultFilter }),
  setSelectedExamForInspect: (selectedExamForInspect) => set({ selectedExamForInspect }),
  setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
  setShowUploadZone: (showUploadZone) => set({ showUploadZone }),
  setShowAiKeyModal: (showAiKeyModal) => set({ showAiKeyModal }),

  resetFilters: () =>
    set({
      searchQuery: "",
      selectedClassFilter: "ALL",
      selectedStatusFilter: "ALL",
      selectedVaultFilter: "ALL",
    }),
}));
