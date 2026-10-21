"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  UserPlus,
  UploadCloud,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  Clock,
  Edit3,
  FileSpreadsheet,
  Cpu,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { generateCsvTemplate, downloadCsvFile } from "@/lib/templates";
import { BulkUploadModal } from "@/components/users/BulkUploadModal";
import { SingleUserModal } from "@/components/users/SingleUserModal";
import { EditUserRoleModal } from "@/components/users/EditUserRoleModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { formatDate } from "@/lib/utils";
import { useUsersList, useDeleteUserMutation } from "@/features/users/users.queries";
import { useUsersModuleStore } from "@/stores/users.store";

export function AdminOnboardingClient({
  initialAdmins,
}: {
  initialAdmins: any[];
  currentUser: any;
}) {
  const router = useRouter();
  const deleteMutation = useDeleteUserMutation();

  const { data: rawUsers = initialAdmins } = useUsersList();
  const adminRoles = ["SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "EXAM_PAPER_EVALUATOR", "EXAM_PAPER_CHECKER"];
  const admins = (rawUsers && rawUsers.length > 0 ? rawUsers : initialAdmins).filter((u: any) =>
    adminRoles.includes(u.role)
  );

  const {
    search,
    setSearch,
    isSingleUserModalOpen,
    openSingleUserModal,
    closeSingleUserModal,
    isBulkUploadModalOpen,
    openBulkUploadModal,
    closeBulkUploadModal,
    isAccessModalOpen,
    openAccessModal,
    closeAccessModal,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    targetUser,
  } = useUsersModuleStore();

  const handleDownloadSample = () => {
    const csvContent = generateCsvTemplate("admin");
    downloadCsvFile("swathi_pharmacy_admins_template.csv", csvContent);
    toast.success("Downloaded sample admin onboarding CSV template");
  };

  const filteredAdmins = admins.filter(
    (a: any) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  const superAdminsCount = admins.filter((a: any) => a.role === "SUPER_ADMIN").length;
  const controllersCount = admins.filter((a: any) => a.role === "ADMIN").length;
  const creatorsCount = admins.filter((a: any) => a.role === "EXAM_PAPER_CREATOR").length;
  const evaluatorsCount = admins.filter((a: any) => a.role === "EXAM_PAPER_EVALUATOR").length;
  const checkersCount = admins.filter((a: any) => a.role === "EXAM_PAPER_CHECKER").length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="badge-purple font-bold">
            Super Admin
          </span>
        );
      case "ADMIN":
        return (
          <span className="badge-blue font-bold">
            Exam Controller
          </span>
        );
      case "EXAM_PAPER_CREATOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <FileSpreadsheet className="w-3 h-3" />
            Paper Creator
          </span>
        );
      case "EXAM_PAPER_EVALUATOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Cpu className="w-3 h-3" />
            Paper Evaluator
          </span>
        );
      case "EXAM_PAPER_CHECKER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3" />
            Paper Checker
          </span>
        );
      case "TEACHER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            Faculty
          </span>
        );
      default:
        return <span className="badge-slate">{role}</span>;
    }
  };

  const getTimeWindowDisplay = (admin: any) => {
    if (!admin.isTimeRestricted) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <Clock className="w-3 h-3 text-slate-400" />
          Unrestricted
        </span>
      );
    }

    const hours =
      admin.dailyStartTime && admin.dailyEndTime
        ? `${admin.dailyStartTime} - ${admin.dailyEndTime}`
        : "All Day";

    return (
      <div className="space-y-0.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {hours}
        </span>
        {admin.timeWindowEnd && (
          <p className="text-[10px] text-slate-400">
            Until {formatDate(admin.timeWindowEnd)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="badge-purple inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            Institutional Authorities, Paper Creators &amp; Evaluators
          </div>
          <h1 className="page-header-title mt-2">
            Authority &amp; Role-Based Permission Control Center
          </h1>
          <p className="page-header-subtitle">
            Configure roles, assign granular permissions, and schedule time-based operational access windows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadSample}
            className="btn-outline"
            title="Download CSV sample file with proper headers"
          >
            <Download className="w-4 h-4 text-purple-600" />
            Sample Template
          </button>

          <button
            onClick={() => openBulkUploadModal("admin")}
            className="btn-outline"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            Bulk CSV Onboard
          </button>

          <button
            onClick={() => openSingleUserModal("admin")}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            Authorize Authority / Staff
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{superAdminsCount}</p>
            <p className="kpi-label">Super Admins</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{controllersCount}</p>
            <p className="kpi-label">Controllers</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{creatorsCount}</p>
            <p className="kpi-label">Paper Creators</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{evaluatorsCount}</p>
            <p className="kpi-label">Evaluators</p>
          </div>
        </div>
      </div>

      {/* Search & Directory Table */}
      <div className="data-container">
        <div className="data-header">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Administrative &amp; Specialized Staff Registry
            </h2>
            <p className="page-header-subtitle">
              Showing {filteredAdmins.length} authorized accounts with active permission schedules.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-normal"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-th">Name &amp; Identity</th>
                <th className="table-th">Email &amp; Contact</th>
                <th className="table-th">Role Clearance</th>
                <th className="table-th">Access Window Schedule</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmins.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shadow-xs font-heading">
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">{a.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          ID: {a.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="space-y-0.5">
                      <p className="text-slate-800 flex items-center gap-1.5 font-normal">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {a.email}
                      </p>
                      {a.phone && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-normal">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {a.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="table-td">
                    {getRoleBadge(a.role)}
                  </td>
                  <td className="table-td">
                    {getTimeWindowDisplay(a)}
                  </td>
                  <td className="table-td">
                    {a.isActive ? (
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
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openAccessModal(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Configure
                      </button>

                      <button
                        onClick={() => openDeleteModal(a)}
                        title={`Delete ${a.name}`}
                        className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        type="admin"
        title="Bulk Onboard Authorities"
      />

      <SingleUserModal
        isOpen={isSingleUserModalOpen}
        onClose={closeSingleUserModal}
        onSuccess={() => {
          closeSingleUserModal();
          router.refresh();
        }}
        type="admin"
      />

      <EditUserRoleModal
        isOpen={isAccessModalOpen}
        onClose={closeAccessModal}
        onSuccess={() => {
          closeAccessModal();
          router.refresh();
        }}
        user={
          targetUser
            ? {
                ...targetUser,
                permissions: targetUser.permissions
                  ? typeof targetUser.permissions === "string"
                    ? JSON.parse(targetUser.permissions)
                    : targetUser.permissions
                  : [],
              }
            : null
        }
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onSuccess={() => {
          closeDeleteModal();
          router.refresh();
        }}
        title="Delete Authority Account"
        description={`Are you sure you want to permanently delete ${targetUser?.name} (${targetUser?.email}) from the institutional platform?`}
        itemIdentifier={targetUser ? `${targetUser.name} — ${targetUser.role}` : ""}
        customDeleteFn={
          targetUser
            ? async () => {
                await deleteMutation.mutateAsync(targetUser.id);
              }
            : undefined
        }
      />
    </div>
  );
}

