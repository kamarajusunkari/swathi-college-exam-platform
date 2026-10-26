"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileView } from "@/components/profile/ProfileView";
import { useAuthStore } from "@/stores/auth.store";

export default function CreatorProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout user={user}>
      <ProfileView initialUser={user} />
    </DashboardLayout>
  );
}
