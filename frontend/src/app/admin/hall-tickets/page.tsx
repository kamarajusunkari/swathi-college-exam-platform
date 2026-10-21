import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHallTicketsClient } from "./AdminHallTicketsClient";

export const dynamic = "force-dynamic";

export default async function AdminHallTicketsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let hallTickets: any[] = [];
  try {
    const data = await serverFetch<{ hallTickets: any[] }>("/hall-tickets");
    hallTickets = data?.hallTickets || [];
  } catch (err) {
    console.error("Failed to load hall tickets:", err);
  }

  return (
    <DashboardLayout user={user}>
      <AdminHallTicketsClient hallTickets={hallTickets} />
    </DashboardLayout>
  );
}
