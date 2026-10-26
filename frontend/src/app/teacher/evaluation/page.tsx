"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherEvaluationClient } from "./TeacherEvaluationClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function TeacherEvaluationQueuePage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["teacher", "evaluation-overview"],
    queryFn: async () => {
      const res = await apiClient.get("/evaluation/queue/overview");
      return res.data || { exams: [], answerSheets: [], allStudents: [] };
    },
    staleTime: 30 * 1000,
  });

  const exams = data?.exams || [];
  const answerSheets = data?.answerSheets || [];
  const allStudents = data?.allStudents || [];

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading evaluation queue &amp; candidate scripts...</span>
        </div>
      ) : (
        <TeacherEvaluationClient
          initialExams={exams}
          dbSheets={answerSheets}
          allStudents={allStudents}
          userRole={user?.role}
          currentUser={user}
        />
      )}
    </DashboardLayout>
  );
}
