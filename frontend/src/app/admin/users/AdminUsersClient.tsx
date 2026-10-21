"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Briefcase,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Search,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useUsersList } from "@/features/users/users.queries";
import { useUsersModuleStore } from "@/stores/users.store";

interface AdminUsersClientProps {
  initialUsers: any[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  // TanStack Query for reactive users list
  const { data: rawUsers = initialUsers, isLoading } = useUsersList();
  const users = rawUsers && rawUsers.length > 0 ? rawUsers : initialUsers;

  // Zustand Store for search and role filter
  const { search, setSearch, selectedRole, setSelectedRole } = useUsersModuleStore();

  const studentsCount = users.filter((u: any) => u.role === "STUDENT").length;
  const teachersCount = users.filter((u: any) => u.role === "TEACHER").length;
  const adminsCount = users.filter((u: any) =>
    ["SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "EXAM_PAPER_EVALUATOR", "EXAM_PAPER_CHECKER"].includes(u.role)
  ).length;

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentProfile?.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      u.teacherProfile?.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      selectedRole === "ALL"
        ? true
        : selectedRole === "ADMIN"
        ? ["SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "EXAM_PAPER_EVALUATOR", "EXAM_PAPER_CHECKER"].includes(u.role)
        : u.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">
            Institutional Identity &amp; Directory
          </h1>
          <p className="page-header-subtitle">
            Central identity registry for student enrollment, faculty assignments, and administrator clearance.
          </p>
        </div>

        {/* Quick Nav Shortcut Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users/students"
            className="btn-outline text-xs inline-flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            Students Roster
          </Link>
          <Link
            href="/admin/users/teachers"
            className="btn-outline text-xs inline-flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            Faculty
          </Link>
          <Link
            href="/admin/users/admins"
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Authorities
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedRole(selectedRole === "STUDENT" ? "ALL" : "STUDENT")}
          className={`kpi-card cursor-pointer transition-all hover:border-blue-300 ${
            selectedRole === "STUDENT" ? "ring-2 ring-blue-500 bg-blue-50/20" : ""
          }`}
        >
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{studentsCount}</p>
            <p className="kpi-label">Enrolled Students</p>
          </div>
        </div>

        <div
          onClick={() => setSelectedRole(selectedRole === "TEACHER" ? "ALL" : "TEACHER")}
          className={`kpi-card cursor-pointer transition-all hover:border-purple-300 ${
            selectedRole === "TEACHER" ? "ring-2 ring-purple-500 bg-purple-50/20" : ""
          }`}
        >
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{teachersCount}</p>
            <p className="kpi-label">Faculty Members</p>
          </div>
        </div>

        <div
          onClick={() => setSelectedRole(selectedRole === "ADMIN" ? "ALL" : "ADMIN")}
          className={`kpi-card cursor-pointer transition-all hover:border-emerald-300 ${
            selectedRole === "ADMIN" ? "ring-2 ring-emerald-500 bg-emerald-50/20" : ""
          }`}
        >
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{adminsCount}</p>
            <p className="kpi-label">Controllers &amp; Admins</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all directory entries by name, email, roll number, or role..."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-normal"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "ALL", label: "All Users" },
            { id: "STUDENT", label: "Students" },
            { id: "TEACHER", label: "Faculty" },
            { id: "ADMIN", label: "Authorities" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedRole === tab.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="data-container">
        <div className="data-header">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Verified Identity Registry
            </h2>
            <p className="page-header-subtitle">
              Showing {filteredUsers.length} of {users.length} verified accounts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-th">User Name &amp; ID</th>
                <th className="table-th">Email &amp; Contact</th>
                <th className="table-th">Role</th>
                <th className="table-th">Academic Department</th>
                <th className="table-th">Status</th>
                <th className="table-th">Joined Date</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u: any) => {
                const isStudent = u.role === "STUDENT";
                const isTeacher = u.role === "TEACHER";
                const identifier = isStudent
                  ? u.studentProfile?.rollNo
                  : isTeacher
                  ? u.teacherProfile?.employeeId
                  : "ADMIN";

                const detailHref = isStudent
                  ? `/admin/users/students/${u.id}`
                  : isTeacher
                  ? `/admin/users/teachers/${u.id}`
                  : `/admin/users/admins`;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center font-medium text-xs shadow-xs font-heading ${
                            isStudent
                              ? "bg-blue-100 text-blue-700"
                              : isTeacher
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-xs sm:text-sm leading-tight">
                            {u.name}
                          </p>
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
                      <span
                        className={
                          isStudent
                            ? "badge-blue"
                            : isTeacher
                            ? "badge-orange"
                            : "badge-emerald"
                        }
                      >
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="table-td">
                      {isStudent && u.studentProfile ? (
                        <div className="text-slate-700">
                          <p className="font-medium">
                            {u.studentProfile.class?.name || "B.Pharm"} - Sec{" "}
                            {u.studentProfile.section?.name || "A"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            AY {u.studentProfile.academicYear?.name || "Current"}
                          </p>
                        </div>
                      ) : isTeacher && u.teacherProfile ? (
                        <div className="text-slate-700">
                          <p className="font-medium">
                            {u.teacherProfile.department || "General Faculty"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {u.teacherProfile.designation || "Teacher"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-normal">
                          Central Administration
                        </span>
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
                    <td className="table-td text-right">
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
