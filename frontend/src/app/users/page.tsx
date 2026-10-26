"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getUsers } from "@/lib/api/services.api";
import {
  Users,
  GraduationCap,
  UserCheck,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function UsersPage() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [activeTab, setActiveTab] = useState<"ALL" | "STUDENT" | "TEACHER">("STUDENT");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", "directory", { page, limit, role: activeTab }],
    queryFn: async () => {
      const res = await getUsers({
        page,
        limit,
        role: activeTab !== "ALL" ? activeTab : undefined,
      });
      return res || {};
    },
    staleTime: 30 * 1000,
  });

  const allUsers: any[] = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = usersData?.totalPages || 1;

  const students = allUsers
    .filter((u) => u.role === "STUDENT" || u.studentProfile)
    .map((u) => ({
      ...u.studentProfile,
      user: u,
      feePayments: u.studentProfile?.feePayments || [],
      class: u.studentProfile?.class || { name: "—" },
      section: u.studentProfile?.section || { name: "—" },
    }));

  const teachers = allUsers
    .filter((u) => u.role === "TEACHER" || u.teacherProfile)
    .map((u) => ({
      ...u.teacherProfile,
      user: u,
      assignments: u.teacherProfile?.assignments || [],
    }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              Institutional Roster
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Faculty, Staff & Student Directory
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live database queries via Axios & TanStack Query with server-side pagination.
            </p>
          </div>

          {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff5722] hover:bg-[#f4511e] text-white text-xs font-semibold shadow-md transition-all">
                <Plus className="w-4 h-4" />
                Add Student / Faculty
              </button>
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => { setActiveTab("STUDENT"); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "STUDENT"
                ? "bg-[#ff5722] text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Students Roster
          </button>
          <button
            onClick={() => { setActiveTab("TEACHER"); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "TEACHER"
                ? "bg-[#ff5722] text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Faculty Directory
          </button>
        </div>

        {/* Student Roster Table */}
        {activeTab === "STUDENT" && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Student Enrollment & Admission Directory</h2>
              </div>
              <span className="text-xs text-slate-400">{totalUsers} Total Students</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="pb-3 px-3">Student Name</th>
                    <th className="pb-3 px-3">Roll No / ID</th>
                    <th className="pb-3 px-3">Class & Section</th>
                    <th className="pb-3 px-3">Group</th>
                    <th className="pb-3 px-3">Father / Guardian</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#ff5722]" />
                          <span>Loading students from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    students.map((st: any) => (
                      <tr key={st.id || st.user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                              {st.user.name[0]}
                            </div>
                            <div>
                              <span>{st.user.name}</span>
                              <span className="block text-[11px] font-normal text-slate-400">{st.user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="font-bold text-amber-400">{st.rollNo || "N/A"}</span>
                          <span className="block text-[10px] text-slate-500">{st.studentId || st.user.id.slice(0, 8)}</span>
                        </td>
                        <td className="py-3 px-3">
                          {st.class?.name || "B.Pharmacy"} ({st.section?.name || "A"})
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {st.group?.name || "General"}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {st.fatherName || "—"}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
              <span>Page {page} of {totalPages} ({totalUsers} total)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Roster */}
        {activeTab === "TEACHER" && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Faculty & Evaluator Roster</h2>
              </div>
              <span className="text-xs text-slate-400">{totalUsers} Faculty Members</span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#ff5722]" />
                <span>Loading faculty list...</span>
              </div>
            ) : teachers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No faculty members registered.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map((tc) => (
                  <div key={tc.id || tc.user.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                      {tc.user.name[0]}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{tc.user.name}</p>
                      <p className="text-xs text-emerald-400 font-medium">{tc.designation || "Assistant Professor"}</p>
                      <p className="text-[11px] text-slate-400">
                        Dept: {tc.department || "Pharmaceutics"} • Emp ID: <span className="font-mono text-slate-300">{tc.employeeId || tc.user.id.slice(0, 6)}</span>
                      </p>
                      <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {tc.user.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {tc.user.phone || "+91 98480 00000"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
