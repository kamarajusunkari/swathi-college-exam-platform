import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { CreatorDashboard } from "@/components/dashboard/CreatorDashboard";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function CreatorDashboardPage() {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== "EXAM_PAPER_CREATOR" &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      !user.permissions?.includes("CREATE_MAIN_PAPER"))
  ) {
    redirect("/login");
  }

  const [examsRes, papersRes] = await Promise.all([
    serverFetch<{ exams: any[] }>("/exams", { fallback: { exams: [] } }),
    serverFetch<{ papers: any[] }>("/exams/papers/vault", { fallback: { papers: [] } }),
  ]);

  return (
    <DashboardLayout user={user}>
      <CreatorDashboard
        user={user}
        exams={examsRes.exams || []}
        papers={papersRes.papers || []}
      />
    </DashboardLayout>
  );
}
