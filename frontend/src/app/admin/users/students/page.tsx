import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentOnboardingClient } from "./StudentOnboardingClient";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let students: any[] = [];
  let classes: any[] = [];
  let academicYears: any[] = [];

  try {
    const [usersRes, academicRes] = await Promise.all([
      fetch(`${API_BASE_URL}/users`, {
        headers: {
          Cookie: cookieStore.toString(),
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/academic`, {
        headers: {
          Cookie: cookieStore.toString(),
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        cache: "no-store",
      }),
    ]);

    if (usersRes.ok) {
      const uData = await usersRes.json();
      const allUsers = uData.users || [];
      students = allUsers.filter((u: any) => u.role === "STUDENT");
    }

    if (academicRes.ok) {
      const aData = await academicRes.json();
      classes = aData.classes || [];
      academicYears = aData.academicYears || [];
    }
  } catch (e) {
    console.error("Failed to load students and hierarchy:", e);
  }

  return (
    <DashboardLayout user={user}>
      <StudentOnboardingClient
        initialStudents={students}
        classes={classes}
        academicYears={academicYears}
        currentUser={user}
      />
    </DashboardLayout>
  );
}
