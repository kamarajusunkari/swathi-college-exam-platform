"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { CreatorDashboard } from "@/components/dashboard/CreatorDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { apiClient } from "@/lib/api/client";

export default function CreatorDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: examsData } = useQuery({
    queryKey: ["creator", "exams"],
    queryFn: async () => {
      const res = await apiClient.get("/exams");
      return Array.isArray(res.data) ? res.data : res.data?.exams || [];
    },
    staleTime: 30 * 1000,
  });

  const { data: papersData } = useQuery({
    queryKey: ["creator", "papers-vault"],
    queryFn: async () => {
      const res = await apiClient.get("/exams/papers/vault");
      return res.data?.papers || [];
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      <CreatorDashboard
        user={user}
        exams={examsData || []}
        papers={papersData || []}
      />
    </DashboardLayout>
  );
}
