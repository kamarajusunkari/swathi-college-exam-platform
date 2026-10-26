"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHallTicketsClient } from "./AdminHallTicketsClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminHallTicketsPage() {
  const user = useAuthStore((state) => state.user);

  const { data: hallTickets = [], isLoading } = useQuery({
    queryKey: ["admin", "hall-tickets"],
    queryFn: async () => {
      const res = await apiClient.get("/hall-tickets");
      return res.data?.hallTickets || [];
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading candidate hall tickets...</span>
        </div>
      ) : (
        <AdminHallTicketsClient hallTickets={hallTickets} />
      )}
    </DashboardLayout>
  );
}
