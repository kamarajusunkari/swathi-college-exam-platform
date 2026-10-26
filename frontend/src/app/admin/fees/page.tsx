"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminFeesClient } from "./AdminFeesClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminFeesPage() {
  const user = useAuthStore((state) => state.user);

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["admin", "fees"],
    queryFn: async () => {
      const res = await apiClient.get("/fees");
      return res.data?.fees || [];
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading candidate fee ledger...</span>
        </div>
      ) : (
        <AdminFeesClient fees={fees} />
      )}
    </DashboardLayout>
  );
}
