"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminAnswerSheetsClient } from "./AdminAnswerSheetsClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminAnswerSheetsPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "answer-sheets"],
    queryFn: async () => {
      const [bundlesRes, sheetsRes] = await Promise.all([
        apiClient.get("/evaluation/bundles/all").catch(() => ({ data: { bundles: [] } })),
        apiClient.get("/evaluation/queue").catch(() => ({ data: { answerSheets: [] } })),
      ]);
      return {
        bundles: bundlesRes.data?.bundles || [],
        answerSheets: sheetsRes.data?.answerSheets || [],
      };
    },
    staleTime: 30 * 1000,
  });

  const bundles = data?.bundles || [];
  const answerSheets = data?.answerSheets || [];

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading answer sheets &amp; bundles...</span>
        </div>
      ) : (
        <AdminAnswerSheetsClient bundles={bundles} answerSheets={answerSheets} />
      )}
    </DashboardLayout>
  );
}
