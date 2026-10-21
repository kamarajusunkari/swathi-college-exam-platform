import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserCircle2,
  Mail,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { notFound } from "next/navigation";

export default async function SectionDetailsPage({
  params,
}: {
  params: Promise<{ classId: string; groupId: string; sectionId: string }>;
}) {
  const { classId, groupId, sectionId } = await params;
  const user = await getCurrentUser();

  let program: any = null;
  let group: any = null;
  let section: any = null;

  try {
    const data = await serverFetch<{ classes: any[] }>("/academic");
    const classes = data.classes || [];
    program = classes.find((c: any) => c.id === classId);
    if (program) {
      group = program.groups?.find((g: any) => g.id === groupId);
      section = program.sections?.find((s: any) => s.id === sectionId);
    }
  } catch (err) {
    console.error("Failed to load academic hierarchy:", err);
  }

  if (!program || !group || !section) {
    notFound();
  }

  const sectionStudents = program.students?.filter(
    (s: any) => s.groupId === groupId && s.sectionId === sectionId
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href={`/academic/programs/${classId}/${groupId}`} className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sections
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {program.code} - {group.code} - {section.name}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {program.name} ({group.name}) - {section.name}
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Full details and student list for this section.
            </p>
          </div>
        </div>

        {/* Student List */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Students Enrolled</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {sectionStudents.length} Students
            </span>
          </div>

          {sectionStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-xs">
                  <tr>
                    <th className="pb-3 px-4">Student</th>
                    <th className="pb-3 px-4">Roll No / ID</th>
                    <th className="pb-3 px-4">DOB</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {sectionStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                        ) : (
                          <UserCircle2 className="w-8 h-8 text-slate-500" />
                        )}
                        <div>
                          <span>{student.user?.name || student.studentId}</span>
                          <span className="block text-[11px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.user?.email || "No Email"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-rose-400">{student.rollNo}</span>
                        <span className="block text-[11px] text-slate-400 font-mono mt-0.5">{student.studentId}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {student.dob ? (
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {student.dob}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p>No students enrolled in this section yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
