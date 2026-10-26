"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AcademicClient } from "./AcademicClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminAcademicPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "academic"],
    queryFn: async () => {
      const res = await apiClient.get("/academic");
      return res.data || {
        academicYears: [],
        programs: [],
        classes: [],
        subjects: [],
      };
    },
    staleTime: 30 * 1000,
  });

  const academicYears = data?.academicYears || [];
  const programs = data?.programs || [];
  const classes = data?.classes || [];
  const subjects = data?.subjects || [];
  const totalStudents = classes.reduce((acc: number, c: any) => acc + (c.students?.length || 0), 0);

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading academic structure...</span>
        </div>
      ) : (
        <AcademicClient
          classes={classes}
          programs={programs}
          subjects={subjects}
          academicYears={academicYears}
          totalStudentsCount={totalStudents}
          currentUser={user}
        />
      )}
    </DashboardLayout>
  );
}
