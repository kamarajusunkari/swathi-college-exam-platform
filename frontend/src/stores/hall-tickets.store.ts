import { create } from "zustand";

interface HallTicketsStoreState {
  // Search & Filters
  searchQuery: string;
  statusFilter: "ALL" | "ACTIVE" | "HELD" | "REVOKED";

  // Modals & Active Selections
  selectedTicketForPreview: any | null;
  verifyModalOpen: boolean;
  verifyQuery: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "ALL" | "ACTIVE" | "HELD" | "REVOKED") => void;
  setSelectedTicketForPreview: (ticket: any | null) => void;
  setVerifyModalOpen: (open: boolean) => void;
  setVerifyQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useHallTicketsStore = create<HallTicketsStoreState>((set) => ({
  searchQuery: "",
  statusFilter: "ALL",

  selectedTicketForPreview: null,
  verifyModalOpen: false,
  verifyQuery: "",

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSelectedTicketForPreview: (selectedTicketForPreview) => set({ selectedTicketForPreview }),
  setVerifyModalOpen: (verifyModalOpen) => set({ verifyModalOpen }),
  setVerifyQuery: (verifyQuery) => set({ verifyQuery }),

  resetFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "ALL",
    }),
}));
