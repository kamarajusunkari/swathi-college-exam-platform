"use client";

import React, { use } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDetailClient } from "./StudentDetailClient";
import { useUserDetail } from "@/features/users/users.queries";
import { Loader2 } from "lucide-react";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);

  // TanStack Query via Axios - No RSC fetch
  const { data: studentUser, isLoading } = useUserDetail(id);

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff5722]" />
          <span className="text-sm font-medium text-slate-500">Loading student profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!studentUser) {
    return (
      <DashboardLayout user={user}>
        <div className="py-24 text-center text-slate-500 text-sm">
          Student profile not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <StudentDetailClient studentUser={studentUser} currentUser={user} />
    </DashboardLayout>
  );
}
