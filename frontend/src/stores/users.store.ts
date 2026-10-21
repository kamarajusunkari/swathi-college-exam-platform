import { create } from "zustand";
import { OnboardingType } from "@/features/users/users.schema";

interface UsersModuleState {
  // Search & Filter
  search: string;
  selectedClassId: string;
  selectedRole: string;
  sortBy: "name" | "roll" | "date";
  selectedIds: string[];

  // Modals & Drawers
  isSingleUserModalOpen: boolean;
  isBulkUploadModalOpen: boolean;
  isAccessModalOpen: boolean;
  isDeleteModalOpen: boolean;
  targetUser: any | null;
  onboardingType: OnboardingType;

  // Actions
  setSearch: (search: string) => void;
  setSelectedClassId: (classId: string) => void;
  setSelectedRole: (role: string) => void;
  setSortBy: (sortBy: "name" | "roll" | "date") => void;
  toggleSelectId: (id: string) => void;
  selectAllIds: (ids: string[]) => void;
  clearSelection: () => void;

  openSingleUserModal: (type?: OnboardingType) => void;
  closeSingleUserModal: () => void;

  openBulkUploadModal: (type?: OnboardingType) => void;
  closeBulkUploadModal: () => void;

  openAccessModal: (user: any) => void;
  closeAccessModal: () => void;

  openDeleteModal: (user: any) => void;
  closeDeleteModal: () => void;

  resetFilters: () => void;
}

export const useUsersModuleStore = create<UsersModuleState>((set) => ({
  search: "",
  selectedClassId: "ALL",
  selectedRole: "ALL",
  sortBy: "name",
  selectedIds: [],

  isSingleUserModalOpen: false,
  isBulkUploadModalOpen: false,
  isAccessModalOpen: false,
  isDeleteModalOpen: false,
  targetUser: null,
  onboardingType: "student",

  setSearch: (search) => set({ search }),
  setSelectedClassId: (selectedClassId) => set({ selectedClassId }),
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  setSortBy: (sortBy) => set({ sortBy }),

  toggleSelectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    })),

  selectAllIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  openSingleUserModal: (type = "student") =>
    set({ isSingleUserModalOpen: true, onboardingType: type }),
  closeSingleUserModal: () => set({ isSingleUserModalOpen: false }),

  openBulkUploadModal: (type = "student") =>
    set({ isBulkUploadModalOpen: true, onboardingType: type }),
  closeBulkUploadModal: () => set({ isBulkUploadModalOpen: false }),

  openAccessModal: (user) => set({ isAccessModalOpen: true, targetUser: user }),
  closeAccessModal: () => set({ isAccessModalOpen: false, targetUser: null }),

  openDeleteModal: (user) => set({ isDeleteModalOpen: true, targetUser: user }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, targetUser: null }),

  resetFilters: () =>
    set({
      search: "",
      selectedClassId: "ALL",
      selectedRole: "ALL",
      sortBy: "name",
      selectedIds: [],
    }),
}));
