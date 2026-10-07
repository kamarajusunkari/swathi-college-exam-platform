import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckerDashboard } from "@/components/dashboard/CheckerDashboard";

export const dynamic = "force-dynamic";

export default async function CheckerDashboardPage() {
  const user = await getCurrentUser();
  if (
    !user ||
    (user.role !== "EXAM_PAPER_CHECKER" &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      !user.permissions?.includes("CHECK_MAIN_SHEETS"))
  ) {
    redirect("/login");
  }

  const overview = await serverFetch<{ pendingForChecking: any[]; finalizedCount: number }>(
    "/evaluation/checker/overview",
    { fallback: { pendingForChecking: [], finalizedCount: 0 } }
  );

  return (
    <DashboardLayout user={user}>
      <CheckerDashboard
        user={user}
        pendingForChecking={overview.pendingForChecking}
        finalizedCount={overview.finalizedCount}
      />
    </DashboardLayout>
  );
}
