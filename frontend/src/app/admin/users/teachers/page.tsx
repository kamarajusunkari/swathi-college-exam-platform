"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherOnboardingClient } from "./TeacherOnboardingClient";

export default function TeachersPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout user={user}>
      <TeacherOnboardingClient currentUser={user} />
    </DashboardLayout>
  );
}
