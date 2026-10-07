import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { EvaluatorDashboard } from "@/components/dashboard/EvaluatorDashboard";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function EvaluatorDashboardPage() {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== "EXAM_PAPER_EVALUATOR" &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      !user.permissions?.includes("EVALUATE_MAIN_SHEETS"))
  ) {
    redirect("/login");
  }

  const overview = await serverFetch<{
    pendingAnswerSheets: any[];
    evaluatedSheetsCount: number;
  }>("/evaluation/evaluator/overview", {
    fallback: { pendingAnswerSheets: [], evaluatedSheetsCount: 0 },
  });

  return (
    <DashboardLayout user={user}>
      <EvaluatorDashboard
        user={user}
        pendingAnswerSheets={overview.pendingAnswerSheets}
        evaluatedSheetsCount={overview.evaluatedSheetsCount}
      />
    </DashboardLayout>
  );
}
