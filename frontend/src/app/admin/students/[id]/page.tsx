"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDetailClient } from "@/app/admin/users/students/[id]/StudentDetailClient";
import { Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminStudentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const user = useAuthStore((state) => state.user);

  const { data: studentUser, isLoading } = useQuery({
    queryKey: ["admin", "student-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/users/${id}`);
      return res.data?.user || null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-600">Loading student profile &amp; transcripts...</span>
        </div>
      ) : !studentUser || !studentUser.studentProfile ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Student Profile Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested student record could not be found in the institution registry.
          </p>
        </div>
      ) : (
        <StudentDetailClient studentUser={studentUser} currentUser={user} />
      )}
    </DashboardLayout>
  );
}
