"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckerDashboard } from "@/components/dashboard/CheckerDashboard";
import { apiClient } from "@/lib/api/client";

export default function CheckerDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: overviewData } = useQuery({
    queryKey: ["checker", "overview"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluation/checker/overview");
      return res.data || { pendingForChecking: [], finalizedCount: 0 };
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      <CheckerDashboard
        user={user}
        pendingForChecking={overviewData?.pendingForChecking || []}
        finalizedCount={overviewData?.finalizedCount || 0}
      />
    </DashboardLayout>
  );
}
