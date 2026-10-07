import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherOnboardingClient } from "./TeacherOnboardingClient";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function TeachersPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let teachers: any[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Cookie: cookieStore.toString(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const allUsers = data.users || [];
      teachers = allUsers.filter((u: any) => u.role === "TEACHER");
    }
  } catch (e) {
    console.error("Failed to load teachers:", e);
  }

  return (
    <DashboardLayout user={user}>
      <TeacherOnboardingClient initialTeachers={teachers} currentUser={user} />
    </DashboardLayout>
  );
}
