import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminAnswerSheetsClient } from "./AdminAnswerSheetsClient";

export const dynamic = "force-dynamic";

export default async function AdminAnswerSheetsPage() {
  const user = await getCurrentUser();
  if (
    !user ||
    !["SUPER_ADMIN", "ADMIN", "EXAM_PAPER_EVALUATOR", "EXAM_PAPER_CHECKER", "TEACHER"].includes(
      user.role
    )
  ) {
    redirect("/login");
  }

  let bundles: any[] = [];
  let answerSheets: any[] = [];

  try {
    const [bundlesData, sheetsData] = await Promise.all([
      serverFetch<{ bundles: any[] }>("/evaluation/bundles/all").catch(() => ({ bundles: [] })),
      serverFetch<{ answerSheets: any[] }>("/evaluation/queue").catch(() => ({ answerSheets: [] })),
    ]);
    bundles = bundlesData.bundles || [];
    answerSheets = sheetsData.answerSheets || [];
  } catch (err) {
    console.error("Failed to load answer sheets data:", err);
  }

  return (
    <DashboardLayout user={user}>
      <AdminAnswerSheetsClient bundles={bundles} answerSheets={answerSheets} />
    </DashboardLayout>
  );
}
