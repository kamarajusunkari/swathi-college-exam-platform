"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminExamsClient } from "./AdminExamsClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminExamsPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "exams-portal"],
    queryFn: async () => {
      const [examsRes, vaultRes, academicRes] = await Promise.all([
        apiClient.get("/exams").catch(() => ({ data: { exams: [] } })),
        apiClient.get("/exams/papers/vault").catch(() => ({ data: { papers: [] } })),
        apiClient.get("/academic").catch(() => ({ data: { academicYears: [], classes: [] } })),
      ]);
      return {
        exams: examsRes.data?.exams || (Array.isArray(examsRes.data) ? examsRes.data : []),
        papers: vaultRes.data?.papers || [],
        academicYears: academicRes.data?.academicYears || [],
        classes: academicRes.data?.classes || [],
      };
    },
    staleTime: 30 * 1000,
  });

  const exams = data?.exams || [];
  const papers = data?.papers || [];
  const academicYears = data?.academicYears || [];
  const classes = data?.classes || [];

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading exams &amp; encrypted paper vaults...</span>
        </div>
      ) : (
        <AdminExamsClient
          exams={exams}
          papers={papers}
          academicYears={academicYears}
          classes={classes}
        />
      )}
    </DashboardLayout>
  );
}
