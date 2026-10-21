import { create } from "zustand";

interface FeesStoreState {
  // Search & Filters
  searchQuery: string;
  statusFilter: "ALL" | "PAID" | "PENDING" | "UNPAID";
  classFilter: string;

  // Modals & Selection
  selectedReceipt: any | null;
  deleteTarget: any | null;
  paymentModalTarget: any | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "ALL" | "PAID" | "PENDING" | "UNPAID") => void;
  setClassFilter: (classId: string) => void;
  setSelectedReceipt: (fee: any | null) => void;
  setDeleteTarget: (target: any | null) => void;
  setPaymentModalTarget: (target: any | null) => void;
  resetFilters: () => void;
}

export const useFeesStore = create<FeesStoreState>((set) => ({
  searchQuery: "",
  statusFilter: "ALL",
  classFilter: "ALL",

  selectedReceipt: null,
  deleteTarget: null,
  paymentModalTarget: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setClassFilter: (classFilter) => set({ classFilter }),
  setSelectedReceipt: (selectedReceipt) => set({ selectedReceipt }),
  setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
  setPaymentModalTarget: (paymentModalTarget) => set({ paymentModalTarget }),

  resetFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "ALL",
      classFilter: "ALL",
    }),
}));
