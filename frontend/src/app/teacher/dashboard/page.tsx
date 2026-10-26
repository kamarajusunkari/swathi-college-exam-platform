"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { apiClient } from "@/lib/api/client";

export default function TeacherDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: examsData } = useQuery({
    queryKey: ["teacher", "exams"],
    queryFn: async () => {
      const res = await apiClient.get("/exams");
      return Array.isArray(res.data) ? res.data : res.data?.exams || [];
    },
    staleTime: 30 * 1000,
  });

  const { data: overviewData } = useQuery({
    queryKey: ["teacher", "evaluator-overview"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluation/evaluator/overview");
      return res.data || { pendingAnswerSheets: [], evaluatedSheetsCount: 0 };
    },
    staleTime: 30 * 1000,
  });

  const { data: academicData } = useQuery({
    queryKey: ["teacher", "academic"],
    queryFn: async () => {
      const res = await apiClient.get("/academic");
      return res.data || { classes: [], subjects: [] };
    },
    staleTime: 30 * 1000,
  });

  const assignedExams = examsData || [];
  const pendingAnswerSheets = overviewData?.pendingAnswerSheets || [];
  const classes = academicData?.classes || [];
  const subjects = academicData?.subjects || [];

  return (
    <DashboardLayout user={user}>
      <TeacherDashboard
        user={user}
        assignedExams={assignedExams}
        pendingAnswerSheets={pendingAnswerSheets}
        classes={classes}
        subjects={subjects}
      />
    </DashboardLayout>
  );
}
