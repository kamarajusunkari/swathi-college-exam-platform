import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminExamsClient } from "./AdminExamsClient";

export const dynamic = "force-dynamic";

export default async function AdminExamsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let exams: any[] = [];
  let papers: any[] = [];
  let academicYears: any[] = [];
  let classes: any[] = [];

  try {
    const [examsData, vaultData, academicData] = await Promise.all([
      serverFetch<{ exams: any[] }>("/exams").catch(() => ({ exams: [] })),
      serverFetch<{ papers: any[] }>("/exams/papers/vault").catch(() => ({ papers: [] })),
      serverFetch<{ academicYears: any[]; classes: any[] }>("/academic").catch(() => ({
        academicYears: [],
        classes: [],
      })),
    ]);
    exams = examsData.exams || [];
    papers = vaultData.papers || [];
    academicYears = academicData.academicYears || [];
    classes = academicData.classes || [];
  } catch (err) {
    console.error("Failed to load exams data:", err);
  }

  return (
    <DashboardLayout user={user}>
      <AdminExamsClient
        exams={exams}
        papers={papers}
        academicYears={academicYears}
        classes={classes}
      />
    </DashboardLayout>
  );
}
