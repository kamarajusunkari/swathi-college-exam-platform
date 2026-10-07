import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResultMarksheetCard } from "./ResultMarksheetCard";
import { Award, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentResultsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{ student: any }>("/users/student/results", {
    fallback: { student: null },
  });
  const student = res.student;

  if (!student) {
    redirect("/login");
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Academic Performance & Results
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Official Semester Grade Card & Transcript
            </h1>
            <p className="text-sm text-slate-500">
              Verified digital transcript with subject-wise scores, UGC 10-point grades, and cumulative SGPA.
            </p>
          </div>
        </div>

        {student.examResults.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No Published Results for Current Semester
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Evaluation is currently underway at the Examination Cell. Results will appear here once official marks moderation is published.
            </p>
          </div>
        ) : (
          <ResultMarksheetCard student={student as any} results={student.examResults as any} />
        )}
      </div>
    </DashboardLayout>
  );
}
