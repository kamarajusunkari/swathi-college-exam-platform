"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  Building2,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AcademicHierarchyPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["academic", "hierarchy"],
    queryFn: async () => {
      const res = await apiClient.get("/academic");
      return res.data || { academicYears: [], classes: [], subjects: [] };
    },
    staleTime: 30 * 1000,
  });

  const academicYears = data?.academicYears || [];
  const classes = data?.classes || [];
  const subjects = data?.subjects || [];
  const currentAcademicYear = academicYears.find((y: any) => y.isCurrent);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Institutional Structure
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Academic Programs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Select a program to configure Years, Sections, and view Students.
            </p>
          </div>
        </div>

        {/* Academic Years & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-medium text-slate-400">Active Academic Year</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                {currentAcademicYear?.name || "Active Session"}
              </span>
              {currentAcademicYear && (
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  CURRENT
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-medium text-slate-400">Total Programs</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{classes.length} Programs</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-medium text-slate-400">Total Subjects</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{subjects.length} Subjects</span>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Available Programs</span>
          </h2>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-xs">Loading academic programs...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-12 text-center space-y-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No programs configured</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No academic courses or classes are registered in the institution database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((cls: any) => (
                <Link href={`/academic/programs/${cls.id}`} key={cls.id}>
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col justify-between h-full group">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {cls.code}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">{cls.name}</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                          {cls.students?.length || 0} Students
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">{cls.description || "No description provided."}</p>

                      <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Years / Groups: </span>
                          <span className="text-slate-200 font-semibold">{cls.groups?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Sections: </span>
                          <span className="text-slate-200 font-semibold">{cls.sections?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Subjects: </span>
                          <span className="text-slate-200 font-semibold">{cls.subjects?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-indigo-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Years <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
