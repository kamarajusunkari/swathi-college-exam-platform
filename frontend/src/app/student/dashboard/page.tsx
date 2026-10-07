import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (
    !user ||
    (user.role !== "STUDENT" &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  const data = await serverFetch<{
    exams: any[];
    feePayments: any[];
    results: any[];
    hallTickets: any[];
  }>("/users/student/dashboard", {
    fallback: { exams: [], feePayments: [], results: [], hallTickets: [] },
  });

  return (
    <DashboardLayout user={user}>
      <StudentDashboard
        user={user}
        enrolledExams={data.exams}
        feeStatus={data.feePayments}
        hallTickets={data.hallTickets}
        publishedResults={data.results}
      />
    </DashboardLayout>
  );
}
