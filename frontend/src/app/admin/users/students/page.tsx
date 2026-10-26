"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentOnboardingClient } from "./StudentOnboardingClient";
import { getAcademicHierarchy } from "@/lib/api/services.api";

export default function StudentsPage() {
  const user = useAuthStore((state) => state.user);

  // TanStack Query for academic classes and cohorts via Axios
  const { data: academicData } = useQuery({
    queryKey: ["academic", "hierarchy"],
    queryFn: async () => {
      const res = await getAcademicHierarchy();
      return res || {};
    },
    staleTime: 60 * 1000,
  });

  const classes = academicData?.classes || [];
  const academicYears = academicData?.academicYears || [];

  return (
    <DashboardLayout user={user}>
      <StudentOnboardingClient
        classes={classes}
        academicYears={academicYears}
        currentUser={user}
      />
    </DashboardLayout>
  );
}
