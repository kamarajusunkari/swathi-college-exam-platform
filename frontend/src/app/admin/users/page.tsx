import React from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Users,
  GraduationCap,
  Briefcase,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let users: any[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Cookie: cookieStore.toString(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      users = data.users || [];
    }
  } catch (e) {
    console.error("Failed to load users:", e);
  }

  const studentsCount = users.filter((u) => u.role === "STUDENT").length;
  const teachersCount = users.filter((u) => u.role === "TEACHER").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header-title">
              User Directory & Permissions
            </h1>
            <p className="page-header-subtitle">
              Central identity registry for enrollment, faculty assignments, and role-based clearance.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="kpi-card">
            <div className="kpi-icon-box bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{studentsCount}</p>
              <p className="kpi-label">Enrolled Students</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-purple-50 text-purple-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{teachersCount}</p>
              <p className="kpi-label">Faculty Members</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="kpi-number">{adminsCount}</p>
              <p className="kpi-label">Controllers & Admins</p>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="data-container">
          <div className="data-header">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Verified Institutional Identity Registry
              </h2>
              <p className="page-header-subtitle">
                Showing all {users.length} active directory entries from live PostgreSQL.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-th">User Name & ID</th>
                  <th className="table-th">Email & Contact</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Academic Hierarchy</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isStudent = u.role === "STUDENT";
                  const isTeacher = u.role === "TEACHER";
                  const identifier = isStudent
                    ? u.studentProfile?.rollNo
                    : isTeacher
                    ? u.teacherProfile?.employeeId
                    : "ADMIN";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-medium text-xs shadow-xs font-heading ${
                            isStudent
                              ? "bg-blue-100 text-blue-700"
                              : isTeacher
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-xs sm:text-sm leading-tight">{u.name}</p>
                            <p className="text-[11px] font-mono text-indigo-600 mt-0.5 font-medium">
                              {identifier || u.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 flex items-center gap-1.5 font-normal">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {u.email}
                          </p>
                          {u.phone && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-normal">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {u.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={
                          isStudent
                            ? "badge-blue"
                            : isTeacher
                            ? "badge-orange"
                            : "badge-emerald"
                        }>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="table-td">
                        {isStudent && u.studentProfile ? (
                          <div className="text-slate-700">
                            <p className="font-medium">{u.studentProfile.class.name} - Sec {u.studentProfile.section.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">AY {u.studentProfile.academicYear.name}</p>
                          </div>
                        ) : isTeacher && u.teacherProfile ? (
                          <div className="text-slate-700">
                            <p className="font-medium">{u.teacherProfile.department || "General Faculty"}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{u.teacherProfile.designation}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-normal">Central Administration</span>
                        )}
                      </td>
                      <td className="table-td">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                            <XCircle className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="table-td text-slate-500 text-[11px] font-normal">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
