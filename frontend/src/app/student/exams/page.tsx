import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{ student: any; exams: any[] }>(
    "/users/student/exams",
    { fallback: { student: null, exams: [] } }
  );

  const student = res.student;
  if (!student) {
    redirect("/login");
  }

  const exams = res.exams || [];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <CalendarDays className="w-4 h-4" />
              Candidate Exam Schedule
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Official Examination Timetable & Hall Roster
            </h1>
            <p className="text-sm text-slate-500">
              Personalized exam schedule for <strong className="text-slate-800">{student.class.name}</strong> • Roll: <span className="font-mono font-bold text-indigo-600">{student.rollNo}</span>
            </p>
          </div>

          <Link
            href="/student/hall-tickets"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <FileText className="w-4 h-4" />
            Download Admit Card
          </Link>
        </div>

        {/* Exam Timetable Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Semester Examinations — AY {student.academicYear.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reporting time is strictly 30 minutes before exam commencement.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Exam Session</th>
                  <th className="py-3 px-4">Date & Timing</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Exam Hall</th>
                  <th className="py-3 px-4">Admit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {exams.map((exam, idx) => (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {exam.subject.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {exam.subject.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {exam.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(exam.examDate)} ({exam.startTime} – {exam.endTime})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {exam.maxMarks} Marks
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Block B - Hall #{101 + idx}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Admitted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
