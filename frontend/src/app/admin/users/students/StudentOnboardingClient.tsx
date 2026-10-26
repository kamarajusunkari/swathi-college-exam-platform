"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  UploadCloud,
  Search,
  CheckCircle2,
  Eye,
  Award,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { BulkUploadModal } from "@/components/users/BulkUploadModal";
import { SingleUserModal } from "@/components/users/SingleUserModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { useUsersList, useDeleteUserMutation } from "@/features/users/users.queries";
import { useUsersModuleStore } from "@/stores/users.store";

export function StudentOnboardingClient({
  classes = [],
  academicYears = [],
}: {
  initialStudents?: any[];
  classes?: any[];
  academicYears?: any[];
  currentUser?: any;
}) {
  const router = useRouter();
  const deleteUserMutation = useDeleteUserMutation();

  // Zustand Store for search, filters, pagination, selection, and modal controls
  const {
    search,
    setSearch,
    selectedClassId,
    setSelectedClassId,
    sortBy,
    setSortBy,
    page,
    setPage,
    limit,
    setLimit,
    selectedIds,
    toggleSelectId,
    selectAllIds,
    clearSelection,
    isSingleUserModalOpen,
    openSingleUserModal,
    closeSingleUserModal,
    isBulkUploadModalOpen,
    openBulkUploadModal,
    closeBulkUploadModal,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    targetUser,
  } = useUsersModuleStore();

  // TanStack Query for reactive server-paginated and server-filtered student data via Axios
  const { data: result, isLoading } = useUsersList({
    role: "STUDENT",
    page,
    limit,
    classId: selectedClassId,
    search,
  });

  const students = result?.users || [];
  const totalStudents = result?.total || 0;
  const totalPages = result?.totalPages || 1;

  const filteredStudents = students
    .filter((s: any) => {
      const profile = s.studentProfile;
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        profile?.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
        profile?.studentId?.toLowerCase().includes(search.toLowerCase()) ||
        profile?.class?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesClass = selectedClassId === "ALL" || profile?.classId === selectedClassId;

      return matchesSearch && matchesClass;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "roll") return (a.studentProfile?.rollNo || "").localeCompare(b.studentProfile?.rollNo || "");
      return 0;
    });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      clearSelection();
    } else {
      selectAllIds(filteredStudents.map((s: any) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    toggleSelectId(id);
  };

  const avatarColors = [
    "bg-[#3b82f6]",
    "bg-[#8b5cf6]",
    "bg-[#ec4899]",
    "bg-[#f97316]",
    "bg-[#10b981]",
    "bg-[#6366f1]",
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">
            Students Roster & Enrollment
          </h1>
          <p className="page-header-subtitle">
            {students.length} pharmacy students enrolled across active cohorts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openSingleUserModal("student")}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>

          <button
            onClick={() => openBulkUploadModal("student")}
            className="btn-outline"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{students.length}</p>
            <p className="kpi-label">Total Students</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{students.length}</p>
            <p className="kpi-label">Enrolled in Classes</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">96%</p>
            <p className="kpi-label">Avg Performance Rate</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="filter-bar">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or roll number..."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-normal"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Classes / Programs</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "roll" | "date")}
            className="filter-select"
          >
            <option value="name">Sort: Name</option>
            <option value="roll">Sort: Roll Number</option>
          </select>
        </div>
      </div>

      {/* Student Roster Section */}
      <div className="data-container">
        <div className="data-header">
          <div className="flex items-center gap-2">
            <h2 className="section-title">Student Directory</h2>
            <span className="badge-slate">
              {filteredStudents.length}
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-[#ff5722] focus:ring-[#ff5722]"
            />
            <span>Select All</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-th w-10"></th>
                <th className="table-th">STUDENT</th>
                <th className="table-th">CLASS & ROLL</th>
                <th className="table-th">STATUS</th>
                <th className="table-th text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#ff5722]" />
                      <span className="text-xs font-medium">Fetching students from server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-xs">No students found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s: any, idx: number) => {
                  const profile = s.studentProfile;
                  const isChecked = selectedIds.includes(s.id);
                  const colorBg = avatarColors[idx % avatarColors.length];
                  const initials = s.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={s.id} className={`hover:bg-slate-50/70 transition-colors ${isChecked ? "bg-orange-50/20" : ""}`}>
                      <td className="table-td">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(s.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#ff5722] focus:ring-[#ff5722] cursor-pointer"
                        />
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full ${colorBg} text-white font-medium text-xs flex items-center justify-center shadow-xs shrink-0 font-heading`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-xs sm:text-sm leading-tight">{s.name}</p>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {s.email} • ID: {profile?.studentId || s.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <p className="font-medium text-slate-800 text-xs">
                          {profile?.class?.name || "B.Pharmacy"} - {profile?.section?.name || "A"}
                        </p>
                        <p className="text-[11px] font-mono font-medium text-slate-400 mt-0.5">
                          Roll {profile?.rollNo || "26BPH001"}
                        </p>
                      </td>
                      <td className="table-td">
                        <span className="badge-emerald">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      </td>
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/users/students/${s.id}`}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                            title="View Full Profile & Access Control"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(s)}
                            title={`Delete ${s.name}`}
                            className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {totalStudents === 0 ? 0 : (page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(page * limit, totalStudents)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{totalStudents}</span> students
            </span>

            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
              <span className="text-slate-400">Per page:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#ff5722]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-700">
              <span>Page {page} of {totalPages}</span>
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={closeBulkUploadModal}
        onSuccess={() => {
          closeBulkUploadModal();
          router.refresh();
        }}
        type="student"
        title="Bulk Import Students"
      />

      <SingleUserModal
        isOpen={isSingleUserModalOpen}
        onClose={closeSingleUserModal}
        onSuccess={() => {
          closeSingleUserModal();
          router.refresh();
        }}
        type="student"
        classes={classes}
        academicYears={academicYears}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onSuccess={() => {
          closeDeleteModal();
          router.refresh();
        }}
        title="Delete Student Record"
        description={`Are you sure you want to permanently delete student ${targetUser?.name} (Roll: ${targetUser?.studentProfile?.rollNo || "N/A"})? This will purge all associated exam attendances and internal marks.`}
        itemIdentifier={targetUser ? `${targetUser.name} — Roll: ${targetUser.studentProfile?.rollNo || "N/A"}` : ""}
        customDeleteFn={
          targetUser
            ? async () => {
                await deleteUserMutation.mutateAsync(targetUser.id);
              }
            : undefined
        }
      />
    </div>
  );
}
