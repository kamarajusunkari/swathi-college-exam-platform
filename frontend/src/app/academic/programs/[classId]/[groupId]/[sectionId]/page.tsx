"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserCircle2,
  Mail,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function SectionDetailsPage() {
  const params = useParams();
  const classId = params?.classId as string;
  const groupId = params?.groupId as string;
  const sectionId = params?.sectionId as string;
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["academic", "hierarchy"],
    queryFn: async () => {
      const res = await apiClient.get("/academic");
      return res.data || { classes: [] };
    },
    staleTime: 30 * 1000,
  });

  const classes = data?.classes || [];
  const program = classes.find((c: any) => c.id === classId);
  const group = program?.groups?.find((g: any) => g.id === groupId);
  const section = program?.sections?.find((s: any) => s.id === sectionId);

  const sectionStudents = program?.students?.filter(
    (s: any) => s.groupId === groupId && s.sectionId === sectionId
  ) || [];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href={`/academic/programs/${classId}/${groupId}`} className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sections
            </Link>
            {program && group && section && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {program.code} - {group.code} - {section.name}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  {program.name} ({group.name}) - {section.name}
                </h1>
              </div>
            )}
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

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
              <span className="text-xs">Loading enrolled students...</span>
            </div>
          ) : !program || !group || !section ? (
            <div className="p-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Section Not Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The requested section configuration could not be found.
              </p>
            </div>
          ) : sectionStudents.length > 0 ? (
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
                        <UserCircle2 className="w-8 h-8 text-slate-500" />
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
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/students/${student.userId || student.id}`}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                        >
                          View Profile
                        </Link>
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
