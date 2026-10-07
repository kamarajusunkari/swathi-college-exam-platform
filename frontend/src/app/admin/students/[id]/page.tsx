import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDetailClient } from "@/app/admin/users/students/[id]/StudentDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "TEACHER")) {
    redirect("/login");
  }

  const { id } = await params;

  let studentUser: any = null;
  try {
    const data = await serverFetch<{ user: any }>(`/users/${id}`);
    studentUser = data.user;
  } catch (err) {
    console.error("Failed to load student details:", err);
    notFound();
  }

  if (!studentUser || !studentUser.studentProfile) {
    notFound();
  }

  return (
    <DashboardLayout user={user}>
      <StudentDetailClient studentUser={studentUser} currentUser={user} />
    </DashboardLayout>
  );
}
