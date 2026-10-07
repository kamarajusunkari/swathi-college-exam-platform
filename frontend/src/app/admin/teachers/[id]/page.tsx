import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherDetailClient } from "@/app/admin/users/teachers/[id]/TeacherDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "TEACHER")) {
    redirect("/login");
  }

  const { id } = await params;

  let teacherUser: any = null;
  try {
    const data = await serverFetch<{ user: any }>(`/users/${id}`);
    teacherUser = data.user;
  } catch (err) {
    console.error("Failed to load teacher details:", err);
    notFound();
  }

  if (!teacherUser || !teacherUser.teacherProfile) {
    notFound();
  }

  return (
    <DashboardLayout user={user}>
      <TeacherDetailClient teacherUser={teacherUser} currentUser={user} />
    </DashboardLayout>
  );
}
