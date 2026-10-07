import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDetailClient } from "./StudentDetailClient";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const { id } = await params;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let studentUser: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: {
        Cookie: cookieStore.toString(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      studentUser = data.user;
    }
  } catch (e) {
    console.error("Failed to load student:", e);
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
