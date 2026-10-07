import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EvaluationWorkspace } from "./EvaluationWorkspace";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ sheetId: string }>;
}

export default async function EvaluationDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const { sheetId } = await params;

  const res = await serverFetch<{ sheet: any }>(`/evaluation/${sheetId}`, {
    fallback: { sheet: null },
  });

  const sheet = res.sheet;
  if (!sheet) {
    notFound();
  }

  return (
    <DashboardLayout user={user}>
      <EvaluationWorkspace sheet={sheet as any} currentUser={user} />
    </DashboardLayout>
  );
}
