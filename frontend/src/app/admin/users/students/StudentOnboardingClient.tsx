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
} from "lucide-react";
import { toast } from "sonner";
import { BulkUploadModal } from "@/components/users/BulkUploadModal";
import { SingleUserModal } from "@/components/users/SingleUserModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

export function StudentOnboardingClient({
  initialStudents,
  classes,
  academicYears,
}: {
  initialStudents: any[];
  classes: any[];
  academicYears: any[];
  currentUser: any;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filteredStudents = initialStudents
    .filter((s) => {
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
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "roll") return (a.studentProfile?.rollNo || "").localeCompare(b.studentProfile?.rollNo || "");
      return 0;
    });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
            {initialStudents.length} pharmacy students enrolled across active cohorts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSingleOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Student
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
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{initialStudents.length}</p>
            <p className="kpi-label">Total Students</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{initialStudents.length}</p>
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
            onChange={(e) => setSortBy(e.target.value)}
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
              {filteredStudents.map((s, idx) => {
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
                        <span>96% Pass</span>
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toast.info(`Viewing academic record for ${s.name}`)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 border border-slate-200"
                        >
                          Move Class
                        </button>
                        <Link
                          href={`/admin/users/students/${s.id}`}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                          title="View Full Profile & Access Control"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          title={`Delete ${s.name}`}
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
        type="student"
        title="Bulk Import Students"
      />

      <SingleUserModal
        isOpen={isSingleOpen}
        onClose={() => setIsSingleOpen(false)}
        onSuccess={() => router.refresh()}
        type="student"
        classes={classes}
        academicYears={academicYears}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => router.refresh()}
        title="Delete Student Record"
        description={`Are you sure you want to permanently delete student ${deleteTarget?.name} (Roll: ${deleteTarget?.studentProfile?.rollNo || "N/A"})? This will purge all associated exam attendances and internal marks.`}
        itemIdentifier={deleteTarget ? `${deleteTarget.name} — Roll: ${deleteTarget.studentProfile?.rollNo || "N/A"}` : ""}
        deleteUrl={deleteTarget ? `/api/users/${deleteTarget.id}` : ""}
      />
    </div>
  );
}
