"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminUsersClient } from "./AdminUsersClient";

export default function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout user={user}>
      <AdminUsersClient />
    </DashboardLayout>
  );
}
