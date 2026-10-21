import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AcademicClient } from "./AcademicClient";

export const dynamic = "force-dynamic";

export default async function AdminAcademicPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let academicYears: any[] = [];
  let programs: any[] = [];
  let classes: any[] = [];
  let subjects: any[] = [];
  let totalStudents = 0;

  try {
    const data = await serverFetch<{
      academicYears: any[];
      programs: any[];
      classes: any[];
      subjects: any[];
    }>("/academic");
    academicYears = data.academicYears || [];
    programs = data.programs || [];
    classes = data.classes || [];
    subjects = data.subjects || [];
    totalStudents = classes.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  } catch (err) {
    console.error("Failed to load academic data:", err);
  }

  return (
    <DashboardLayout user={user}>
      <AcademicClient
        classes={classes}
        programs={programs}
        subjects={subjects}
        academicYears={academicYears}
        totalStudentsCount={totalStudents}
        currentUser={user}
      />
    </DashboardLayout>
  );
}
