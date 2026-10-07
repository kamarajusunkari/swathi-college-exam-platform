import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubjectsClient } from "./SubjectsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let classes: any[] = [];
  let subjects: any[] = [];
  let teachers: any[] = [];
  let totalStudents = 0;

  try {
    const [academicData, subjectsData, usersData] = await Promise.all([
      serverFetch<{ classes: any[] }>("/academic").catch(() => ({ classes: [] })),
      serverFetch<{ subjects: any[] }>("/academic/subjects").catch(() => ({ subjects: [] })),
      serverFetch<{ users: any[] }>("/users").catch(() => ({ users: [] })),
    ]);
    classes = academicData.classes || [];
    subjects = subjectsData.subjects || [];
    teachers = (usersData.users || []).filter((u) => u.role === "TEACHER");
    totalStudents = classes.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  } catch (err) {
    console.error("Failed to load subjects page data:", err);
  }

  return (
    <DashboardLayout user={user}>
      <SubjectsClient
        classes={classes}
        initialSubjects={subjects}
        teachers={teachers}
        totalStudentsCount={totalStudents}
        currentUser={user}
      />
    </DashboardLayout>
  );
}
