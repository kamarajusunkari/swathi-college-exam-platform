import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Building2,
  BookOpen,
  Users,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function AcademicHierarchyPage() {
  const user = await getCurrentUser();

  let academicYears: any[] = [];
  let classes: any[] = [];
  let subjects: any[] = [];
  let assignments: any[] = [];

  try {
    const data = await serverFetch<{
      academicYears: any[];
      classes: any[];
      subjects: any[];
    }>("/academic");
    academicYears = data.academicYears || [];
    classes = data.classes || [];
    subjects = data.subjects || [];
    assignments = classes.flatMap((c) =>
      (c.subjects || []).flatMap((s: any) => s.assignments || [])
    );
  } catch (err) {
    console.error("Failed to load academic hierarchy:", err);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Institutional Structure
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Academic Hierarchy & Faculty Course Mapping
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure Academic Years, Classes, Sections, Groups, Subjects, and Teacher assignments.
            </p>
          </div>

          {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all">
                <Plus className="w-4 h-4" />
                Add New Class / Subject
              </button>
            </div>
          )}
        </div>

        {/* Academic Years & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-medium text-slate-400">Active Academic Year</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">2026–2027</span>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                CURRENT
              </span>
            </div>
            <p className="text-xs text-slate-400">1 June 2026 – 31 May 2027</p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-medium text-slate-400">Configured Classes</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{classes.length} Programs</span>
            </div>
            <p className="text-xs text-slate-400">Grade 10, Intermediate & Degree</p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-medium text-slate-400">Total Subjects</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{subjects.length} Subjects</span>
            </div>
            <p className="text-xs text-slate-400">With predefined maximum and pass marks</p>
          </div>
        </div>

        {/* Classes, Sections & Groups Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Class & Section Hierarchy</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {cls.code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{cls.name}</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                      {cls.students.length} Students
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{cls.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Sections: </span>
                      <span className="text-slate-200">
                        {cls.sections.map((s: any) => s.name).join(", ") || "General"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Groups/Streams: </span>
                      <span className="text-slate-200">
                        {cls.groups.map((g: any) => g.name).join(", ") || "General"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Curriculum: </span>
                      <span className="text-emerald-400 font-semibold">
                        {cls.subjects.length} Subjects Configured
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Academic Year: 2026-2027</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    Active <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Subject Assignments */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Faculty Course Mapping</h2>
            </div>
            <span className="text-xs text-slate-400">{assignments.length} Active Teaching Allocations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Faculty Member</th>
                  <th className="pb-3 px-3">Subject</th>
                  <th className="pb-3 px-3">Class & Section</th>
                  <th className="pb-3 px-3">Group / Stream</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {assignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {asg.teacher.user.name}
                      <span className="block text-[11px] font-normal text-slate-400 font-mono">
                        {asg.teacher.employeeId}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-400">{asg.subject.name}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">{asg.subject.code}</span>
                    </td>
                    <td className="py-3 px-3">
                      {asg.class.name} ({asg.section?.name || "All Sections"})
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {asg.group?.name || "General"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Assigned
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
