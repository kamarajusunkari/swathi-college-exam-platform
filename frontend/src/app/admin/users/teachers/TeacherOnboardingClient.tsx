"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  UploadCloud,
  Search,
  BookOpen,
  GraduationCap,
  Eye,
  Trash2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { BulkUploadModal } from "@/components/users/BulkUploadModal";
import { SingleUserModal, PHARMACY_DEPARTMENTS } from "@/components/users/SingleUserModal";
import { EditUserRoleModal } from "@/components/users/EditUserRoleModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

export function TeacherOnboardingClient({
  initialTeachers,
}: {
  initialTeachers: any[];
  currentUser: any;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filteredTeachers = initialTeachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.teacherProfile?.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      t.teacherProfile?.department?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "ALL" || t.teacherProfile?.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeachers.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const avatarColors = [
    "bg-[#ec4899]",
    "bg-[#3b82f6]",
    "bg-[#8b5cf6]",
    "bg-[#f97316]",
    "bg-[#10b981]",
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">
            Faculty & Evaluators
          </h1>
          <p className="page-header-subtitle">
            {initialTeachers.length} faculty members & evaluators in your college
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSingleOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>

          <button
            onClick={() => setIsBulkOpen(true)}
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{initialTeachers.length}</p>
            <p className="kpi-label">Total Faculty</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-orange-50 text-orange-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">8</p>
            <p className="kpi-label">Program Assignments</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">4</p>
            <p className="kpi-label">Avg Programs / Teacher</p>
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
            placeholder="Search by name, email, or employee ID..."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-normal"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Departments</option>
            {PHARMACY_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Directory Section */}
      <div className="data-container">
        <div className="data-header">
          <div className="flex items-center gap-2">
            <h2 className="section-title">Teacher Directory</h2>
            <span className="badge-slate">
              {filteredTeachers.length}
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-[#ff5722] focus:ring-[#ff5722]"
            />
            <span>Select All</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((t, idx) => {
                const profile = t.teacherProfile;
                const isChecked = selectedIds.includes(t.id);
                const colorBg = avatarColors[idx % avatarColors.length];
                const initials = t.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={t.id} className={`hover:bg-slate-50/70 transition-colors ${isChecked ? "bg-orange-50/20" : ""}`}>
                    <td className="table-td w-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(t.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#ff5722] focus:ring-[#ff5722] cursor-pointer"
                      />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full ${colorBg} text-white font-medium text-xs flex items-center justify-center shadow-xs shrink-0 font-heading`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-xs sm:text-sm leading-tight">{t.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                            {t.email} • ID: {profile?.employeeId || "FAC-01"} • {t.phone || "+91 98480 34567"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge-orange">
                          {profile?.department || "Pharmaceutics"}
                        </span>
                        <span className="badge-amber">
                          {profile?.designation || "Faculty"}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-center">
                      <p className="text-sm font-medium text-slate-800">4</p>
                      <p className="text-[10px] text-slate-400 font-normal">programs</p>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/users/teachers/${t.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          title="View Profile & Manage Permissions"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <button
                          onClick={() => setSelectedUserForEdit(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          title="Quick Role & Time Configuration"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>

                        <button
                          onClick={() => setDeleteTarget(t)}
                          title={`Delete ${t.name}`}
                          className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={() => router.refresh()}
        type="teacher"
        title="Bulk Import Faculty"
      />

      <SingleUserModal
        isOpen={isSingleOpen}
        onClose={() => setIsSingleOpen(false)}
        onSuccess={() => router.refresh()}
        type="teacher"
      />

      <EditUserRoleModal
        isOpen={Boolean(selectedUserForEdit)}
        onClose={() => setSelectedUserForEdit(null)}
        onSuccess={() => router.refresh()}
        user={
          selectedUserForEdit
            ? {
                ...selectedUserForEdit,
                permissions: selectedUserForEdit.permissions
                  ? typeof selectedUserForEdit.permissions === "string"
                    ? JSON.parse(selectedUserForEdit.permissions)
                    : selectedUserForEdit.permissions
                  : [],
              }
            : null
        }
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => router.refresh()}
        title="Delete Faculty Account"
        description={`Are you sure you want to permanently delete faculty member ${deleteTarget?.name} (${deleteTarget?.email})? This action cannot be undone.`}
        itemIdentifier={deleteTarget ? `${deleteTarget.name} — ${deleteTarget.teacherProfile?.department || "Faculty"}` : ""}
        deleteUrl={deleteTarget ? `/api/users/${deleteTarget.id}` : ""}
      />
    </div>
  );
}
