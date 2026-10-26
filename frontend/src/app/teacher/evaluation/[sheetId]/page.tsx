"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EvaluationWorkspace } from "./EvaluationWorkspace";
import { Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function EvaluationDetailPage() {
  const params = useParams();
  const sheetId = params?.sheetId as string;
  const user = useAuthStore((state) => state.user);

  const { data: sheet, isLoading } = useQuery({
    queryKey: ["evaluation", "sheet", sheetId],
    queryFn: async () => {
      if (!sheetId) return null;
      const res = await apiClient.get(`/evaluation/${sheetId}`);
      return res.data?.sheet || null;
    },
    enabled: !!sheetId,
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading student script &amp; AI evaluation rubrics...</span>
        </div>
      ) : !sheet ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Answer Script Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested evaluation script could not be located or has not been uploaded to the examination vault.
          </p>
        </div>
      ) : (
        <EvaluationWorkspace sheet={sheet as any} currentUser={user as any} />
      )}
    </DashboardLayout>
  );
}
