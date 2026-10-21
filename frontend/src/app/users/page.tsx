import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Plus,
  Mail,
  Phone,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { getBackendBaseUrl } from "@/lib/server-api";

export default async function UsersPage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let allUsers: any[] = [];
  try {
    const base = getBackendBaseUrl();
    const url = new URL("users", base.endsWith("/") ? base : `${base}/`).toString();
    const res = await fetch(url, {
      headers: {
        Cookie: cookieStore.toString(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      allUsers = data.users || [];
    }
  } catch (e) {
    console.error("Failed to load users from backend:", e);
  }

  const students = allUsers
    .filter((u) => u.studentProfile)
    .map((u) => ({
      ...u.studentProfile,
      user: u,
      feePayments: u.studentProfile.feePayments || [],
      class: u.studentProfile.class || { name: "Class" },
      section: u.studentProfile.section || { name: "A" },
    }));

  const teachers = allUsers
    .filter((u) => u.teacherProfile)
    .map((u) => ({
      ...u.teacherProfile,
      user: u,
      assignments: u.teacherProfile.assignments || [],
    }));

  const admins = allUsers.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN");


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
              Manage student admissions, roll numbers, class allocations, faculty designations, and administrative permissions.
            </p>
          </div>

          {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all">
                <Plus className="w-4 h-4" />
                Add Student / Faculty
              </button>
            </div>
          )}
        </div>

        {/* Counts summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
            <span className="text-xs font-medium text-slate-400">Total Enrolled Students</span>
            <p className="text-2xl font-bold text-white mt-2">{students.length}</p>
            <span className="text-xs text-blue-400 font-medium">Mapped to Grade 10 & Intermediate</span>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
            <span className="text-xs font-medium text-slate-400">Faculty Members</span>
            <p className="text-2xl font-bold text-white mt-2">{teachers.length}</p>
            <span className="text-xs text-emerald-400 font-medium">HODs & Professors</span>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
            <span className="text-xs font-medium text-slate-400">Exam Administrators</span>
            <p className="text-2xl font-bold text-white mt-2">{admins.length}</p>
            <span className="text-xs text-purple-400 font-medium">Super Admin & Controllers</span>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Student Enrollment & Admission Directory</h2>
            </div>
            <span className="text-xs text-slate-400">{students.length} Registered Students</span>
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
                  <th className="pb-3 px-3">Fee Status</th>
                  <th className="pb-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {students.map((st: any) => {
                  const feePaid = st.feePayments?.some((f: any) => f.status === "PAID");
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
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
                        <span className="font-bold text-amber-400">{st.rollNo}</span>
                        <span className="block text-[10px] text-slate-500">{st.studentId}</span>
                      </td>
                      <td className="py-3 px-3">
                        {st.class.name} ({st.section.name})
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {st.group?.name || "General"}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {st.fatherName || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            feePaid
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {feePaid ? "Fee Paid" : "Fee Due"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Faculty Roster */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Faculty & Evaluator Roster</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((tc) => (
              <div key={tc.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                  {tc.user.name[0]}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{tc.user.name}</p>
                  <p className="text-xs text-emerald-400 font-medium">{tc.designation}</p>
                  <p className="text-[11px] text-slate-400">
                    Dept: {tc.department} • Emp ID: <span className="font-mono text-slate-300">{tc.employeeId}</span>
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {tc.user.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {tc.user.phone || "+91 98480 00000"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
