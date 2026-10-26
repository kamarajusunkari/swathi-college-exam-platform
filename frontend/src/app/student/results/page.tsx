"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResultMarksheetCard } from "./ResultMarksheetCard";
import { Award, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function StudentResultsPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["student", "results"],
    queryFn: async () => {
      const res = await apiClient.get("/users/student/results");
      return res.data?.student || null;
    },
    staleTime: 30 * 1000,
  });

  const student = data;
  const examResults = student?.examResults || [];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Academic Performance &amp; Results
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Official Semester Grade Card &amp; Transcript
            </h1>
            <p className="text-sm text-slate-500">
              Verified digital transcript with subject-wise scores, UGC 10-point grades, and cumulative SGPA.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200/80">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-xs">Loading academic transcript...</span>
          </div>
        ) : !student || examResults.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No Published Results for Current Semester
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Evaluation is currently underway at the Examination Cell. Results will appear here once official marks moderation is published.
            </p>
          </div>
        ) : (
          <ResultMarksheetCard student={student as any} results={examResults as any} />
        )}
      </div>
    </DashboardLayout>
  );
}
