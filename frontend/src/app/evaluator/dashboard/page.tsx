"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { EvaluatorDashboard } from "@/components/dashboard/EvaluatorDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { apiClient } from "@/lib/api/client";

export default function EvaluatorDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: overviewData } = useQuery({
    queryKey: ["evaluator", "overview"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluation/evaluator/overview");
      return res.data || { pendingAnswerSheets: [], evaluatedSheetsCount: 0 };
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      <EvaluatorDashboard
        user={user}
        pendingAnswerSheets={overviewData?.pendingAnswerSheets || []}
        evaluatedSheetsCount={overviewData?.evaluatedSheetsCount || 0}
      />
    </DashboardLayout>
  );
}
