import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminFeesClient } from "./AdminFeesClient";

export const dynamic = "force-dynamic";

export default async function AdminFeesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let fees: any[] = [];
  try {
    const data = await serverFetch<{ fees: any[] }>("/fees");
    fees = data.fees || [];
  } catch (err) {
    console.error("Failed to load fees data:", err);
  }

  return (
    <DashboardLayout user={user}>
      <AdminFeesClient fees={fees} />
    </DashboardLayout>
  );
}
