import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubjectDetailClient } from "./SubjectDetailClient";

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "TEACHER")) {
    redirect("/login");
  }

  const { id } = await params;

  let subject: any = null;
  let siblingSubjects: any[] = [];
  let allClasses: any[] = [];
  let allTeachers: any[] = [];

  try {
    const [academicData, subjectsData, usersData] = await Promise.all([
      serverFetch<{ classes: any[] }>("/academic").catch(() => ({ classes: [] })),
      serverFetch<{ subjects: any[] }>("/academic/subjects").catch(() => ({ subjects: [] })),
      serverFetch<{ users: any[] }>("/users").catch(() => ({ users: [] })),
    ]);

    const allSubs = subjectsData.subjects || [];
    subject = allSubs.find((s: any) => s.id === id);
    if (!subject) {
      notFound();
    }

    siblingSubjects = allSubs.filter(
      (s: any) => s.name?.toLowerCase() === subject.name?.toLowerCase() && s.id !== subject.id
    );
    allClasses = academicData.classes || [];
    allTeachers = (usersData.users || [])
      .filter((u: any) => u.role === "TEACHER")
      .map((u: any) => u.teacherProfile || { id: u.id, user: u });
  } catch (err) {
    console.error("Failed to load subject detail:", err);
    notFound();
  }

  return (
    <DashboardLayout user={user}>
      <SubjectDetailClient
        subject={subject}
        siblingSubjects={siblingSubjects}
        allClasses={allClasses}
        allTeachers={allTeachers}
        currentUser={user}
      />
    </DashboardLayout>
  );
}
