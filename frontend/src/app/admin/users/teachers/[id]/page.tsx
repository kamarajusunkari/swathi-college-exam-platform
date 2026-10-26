"use client";

import React, { use } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherDetailClient } from "./TeacherDetailClient";
import { useUserDetail } from "@/features/users/users.queries";
import { Loader2 } from "lucide-react";

export default function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);

  // TanStack Query via Axios - No RSC fetch
  const { data: teacherUser, isLoading } = useUserDetail(id);

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-500">Loading faculty profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacherUser) {
    return (
      <DashboardLayout user={user}>
        <div className="py-24 text-center text-slate-500 text-sm">
          Faculty profile not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <TeacherDetailClient teacherUser={teacherUser} currentUser={user} />
    </DashboardLayout>
  );
}
