import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminUsersClient } from "./AdminUsersClient";
import { getBackendBaseUrl } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let users: any[] = [];
  try {
    const base = getBackendBaseUrl();
    const url = new URL("users", base.endsWith("/") ? base : `${base}/`).toString();
    const res = await fetch(url, {
      headers: {
        Cookie: cookieStore.toString(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      users = data.users || [];
    }
  } catch (e) {
    console.error("Failed to load users:", e);
  }

  return (
    <DashboardLayout user={user}>
      <AdminUsersClient initialUsers={users} />
    </DashboardLayout>
  );
}
