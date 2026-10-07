import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  GraduationCap,
  BookOpen,
  Users,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherAcademicPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const res = await serverFetch<{ subjects: any[] }>("/academic/subjects", {
    fallback: { subjects: [] },
  });
  const subjects = res.subjects || [];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              Faculty Academic Roster
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Curriculum Courses & Student Enrollment
            </h1>
            <p className="text-sm text-slate-500">
              Department subject curricula, assigned student cohorts, and credit definitions.
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {sub.code}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {sub.credits} Credits
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3">{sub.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Program: <strong className="text-slate-700">{sub.class?.name || "All Batches"}</strong>
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Enrolled Students
                </span>
                <span className="font-bold text-slate-900">
                  {sub.class?.students.length || 0} Students
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
