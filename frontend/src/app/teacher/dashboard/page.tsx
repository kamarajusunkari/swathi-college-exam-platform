import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { redirect } from "next/navigation";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== "TEACHER" &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  return (
    <DashboardLayout user={user}>
      <TeacherDashboard user={user} />
    </DashboardLayout>
  );
}

