import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

  const [examsRes, overviewRes, academicRes] = await Promise.all([
    serverFetch<{ exams: any[] }>("/exams").catch(() => ({ exams: [] })),
    serverFetch<{ pendingAnswerSheets: any[]; evaluatedSheetsCount: number }>("/evaluation/evaluator/overview").catch(() => ({
      pendingAnswerSheets: [],
      evaluatedSheetsCount: 0,
    })),
    serverFetch<{ classes: any[]; subjects: any[] }>("/academic").catch(() => ({
      classes: [],
      subjects: [],
    })),
  ]);

  return (
    <DashboardLayout user={user}>
      <TeacherDashboard
        user={user}
        assignedExams={examsRes.exams || []}
        pendingAnswerSheets={overviewRes.pendingAnswerSheets || []}
        classes={academicRes.classes || []}
        subjects={academicRes.subjects || []}
      />
    </DashboardLayout>
  );
}

