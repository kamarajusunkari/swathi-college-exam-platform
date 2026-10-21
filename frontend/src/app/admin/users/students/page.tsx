import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentOnboardingClient } from "./StudentOnboardingClient";
import { getBackendBaseUrl } from "@/lib/server-api";

export const dynamic = "force-dynamic";

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
    const base = getBackendBaseUrl();
    const usersUrl = new URL("users", base.endsWith("/") ? base : `${base}/`).toString();
    const academicUrl = new URL("academic", base.endsWith("/") ? base : `${base}/`).toString();

    const [usersRes, academicRes] = await Promise.all([
      fetch(usersUrl, {
        headers: {
          Cookie: cookieStore.toString(),
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        cache: "no-store",
      }),
      fetch(academicUrl, {
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
