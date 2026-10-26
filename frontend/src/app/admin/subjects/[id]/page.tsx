"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubjectDetailClient } from "./SubjectDetailClient";
import { Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function SubjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "subject-detail", id],
    queryFn: async () => {
      const [academicRes, subjectsRes, usersRes] = await Promise.all([
        apiClient.get("/academic").catch(() => ({ data: { classes: [] } })),
        apiClient.get("/academic/subjects").catch(() => ({ data: { subjects: [] } })),
        apiClient.get("/users").catch(() => ({ data: { users: [] } })),
      ]);

      const allSubs = subjectsRes.data?.subjects || [];
      const subject = allSubs.find((s: any) => s.id === id);
      const siblingSubjects = allSubs.filter(
        (s: any) => s.name?.toLowerCase() === subject?.name?.toLowerCase() && s.id !== subject?.id
      );
      const allClasses = academicRes.data?.classes || [];
      const allTeachers = (usersRes.data?.users || [])
        .filter((u: any) => u.role === "TEACHER")
        .map((u: any) => ({
          ...(u.teacherProfile || { id: u.id, employeeId: "N/A", designation: "Faculty" }),
          user: u,
        }));

      return { subject, siblingSubjects, allClasses, allTeachers };
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  const subject = data?.subject;

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading curriculum subject details...</span>
        </div>
      ) : !subject ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Subject Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested course subject curriculum could not be found.
          </p>
        </div>
      ) : (
        <SubjectDetailClient
          subject={subject}
          siblingSubjects={data?.siblingSubjects || []}
          allClasses={data?.allClasses || []}
          allTeachers={data?.allTeachers || []}
          currentUser={user}
        />
      )}
    </DashboardLayout>
  );
}
