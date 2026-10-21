import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

export default async function ProgramSectionsPage({
  params,
}: {
  params: Promise<{ classId: string; groupId: string }>;
}) {
  const { classId, groupId } = await params;
  const user = await getCurrentUser();

  let program: any = null;
  let group: any = null;

  try {
    const data = await serverFetch<{ classes: any[] }>("/academic");
    const classes = data.classes || [];
    program = classes.find((c: any) => c.id === classId);
    if (program) {
      group = program.groups?.find((g: any) => g.id === groupId);
    }
  } catch (err) {
    console.error("Failed to load academic hierarchy:", err);
  }

  if (!program || !group) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href={`/academic/programs/${classId}`} className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to {program.name} Years
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {program.code} - {group.code}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {group.name} - Sections
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Select a section to view student details and assignments.
            </p>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Sections</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {program.sections?.length > 0 ? (
              program.sections.map((section: any) => {
                // Filter students who belong to this class, group, and section
                const sectionStudents = program.students?.filter(
                  (s: any) => s.groupId === groupId && s.sectionId === section.id
                ) || [];

                return (
                  <Link href={`/academic/programs/${classId}/${groupId}/${section.id}`} key={section.id}>
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col justify-between h-full group">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mt-1 group-hover:text-purple-300 transition-colors">{section.name}</h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5" />
                            {sectionStudents.length} Students
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-purple-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full rounded-2xl bg-slate-900/50 border border-slate-800 border-dashed p-8 text-center">
                <Layers className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-white font-medium">No Sections Configured</h3>
                <p className="text-slate-400 text-sm mt-1">This program does not have any sections configured yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
