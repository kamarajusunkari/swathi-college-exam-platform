import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherEvaluationClient } from "./TeacherEvaluationClient";

export const dynamic = "force-dynamic";

export default async function TeacherEvaluationQueuePage() {
  const user = await getCurrentUser();
  if (!user || user.role === "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{
    exams: any[];
    answerSheets: any[];
    allStudents: any[];
  }>("/evaluation/queue/overview", {
    fallback: { exams: [], answerSheets: [], allStudents: [] },
  });

  const exams = res.exams || [];
  const answerSheets = res.answerSheets || [];
  const allStudents = res.allStudents || [];

  return (
    <DashboardLayout user={user}>
      <TeacherEvaluationClient
        initialExams={exams}
        dbSheets={answerSheets}
        allStudents={allStudents}
        userRole={user.role}
        currentUser={user}
      />
    </DashboardLayout>
  );
}
