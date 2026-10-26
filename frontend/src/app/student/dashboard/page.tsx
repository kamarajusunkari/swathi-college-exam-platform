"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { apiClient } from "@/lib/api/client";

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/users/student/dashboard");
      return res.data || { exams: [], feePayments: [], results: [], hallTickets: [] };
    },
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      <StudentDashboard
        user={user}
        enrolledExams={data?.exams || []}
        feeStatus={data?.feePayments || []}
        hallTickets={data?.hallTickets || []}
        publishedResults={data?.results || []}
      />
    </DashboardLayout>
  );
}
