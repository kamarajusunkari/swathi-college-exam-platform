"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ExamSetup from "@/components/evaluation/ExamSetup";
import { useAuthStore } from "@/stores/auth.store";

export default function GenericCreateExamPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout user={user}>
      <ExamSetup />
    </DashboardLayout>
  );
}
