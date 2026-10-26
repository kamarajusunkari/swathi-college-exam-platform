"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminOnboardingClient } from "./AdminOnboardingClient";

export default function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout user={user}>
      <AdminOnboardingClient currentUser={user} />
    </DashboardLayout>
  );
}
