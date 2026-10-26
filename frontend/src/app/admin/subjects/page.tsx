"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubjectsClient } from "./SubjectsClient";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminSubjectsPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "subjects-portal"],
    queryFn: async () => {
      const [academicRes, subjectsRes, usersRes] = await Promise.all([
        apiClient.get("/academic").catch(() => ({ data: { classes: [] } })),
        apiClient.get("/academic/subjects").catch(() => ({ data: { subjects: [] } })),
        apiClient.get("/users").catch(() => ({ data: { users: [] } })),
      ]);
      const classes = academicRes.data?.classes || [];
      const subjects = subjectsRes.data?.subjects || [];
      const teachers = (usersRes.data?.users || [])
        .filter((u: any) => u.role === "TEACHER")
        .map((u: any) => ({
          ...(u.teacherProfile || { id: u.id, employeeId: "N/A", designation: "Faculty" }),
          user: u,
        }));
      const totalStudents = classes.reduce((acc: number, c: any) => acc + (c.students?.length || 0), 0);

      return { classes, subjects, teachers, totalStudents };
    },
    staleTime: 30 * 1000,
  });

  const classes = data?.classes || [];
  const subjects = data?.subjects || [];
  const teachers = data?.teachers || [];
  const totalStudents = data?.totalStudents || 0;

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading course curriculum &amp; subjects...</span>
        </div>
      ) : (
        <SubjectsClient
          classes={classes}
          initialSubjects={subjects}
          teachers={teachers}
          totalStudentsCount={totalStudents}
          currentUser={user}
        />
      )}
    </DashboardLayout>
  );
}
