"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function ProgramSectionsPage() {
  const params = useParams();
  const classId = params?.classId as string;
  const groupId = params?.groupId as string;
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href={`/academic/programs/${classId}`} className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to {program?.name || "Program"} Years
            </Link>
            {program && group && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {program.code} - {group.code}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  {group.name} - Sections
                </h1>
              </div>
            )}
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

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="text-xs">Loading sections...</span>
            </div>
          ) : !program || !group ? (
            <div className="p-12 text-center space-y-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Cohort Not Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The requested year or group cohort could not be found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {program.sections?.length > 0 ? (
                program.sections.map((section: any) => {
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
