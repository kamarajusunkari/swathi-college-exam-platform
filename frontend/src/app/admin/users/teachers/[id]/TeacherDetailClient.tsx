"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Award,
  Key,
  Sparkles,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api/services.api";
import { formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { ALL_PERMISSIONS } from "@/components/users/EditUserRoleModal";

interface Props {
  teacherUser: any;
  currentUser: any;
}

export function TeacherDetailClient({ teacherUser, currentUser }: Props) {
  const router = useRouter();
  const profile = teacherUser.teacherProfile;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Permissions & Access state
  const rawPermissions = teacherUser.permissions
    ? typeof teacherUser.permissions === "string"
      ? JSON.parse(teacherUser.permissions)
      : teacherUser.permissions
    : ["CREATE_INTERNAL_PAPER", "EVALUATE_INTERNAL_MARKS"];

  const [permissions, setPermissions] = useState<string[]>(rawPermissions);
  const [isActive, setIsActive] = useState<boolean>(teacherUser.isActive ?? true);
  const [isTimeRestricted, setIsTimeRestricted] = useState<boolean>(
    teacherUser.isTimeRestricted ?? false
  );
  const [timeWindowStart, setTimeWindowStart] = useState<string>(
    teacherUser.timeWindowStart ? new Date(teacherUser.timeWindowStart).toISOString().slice(0, 10) : ""
  );
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>(
    teacherUser.timeWindowEnd ? new Date(teacherUser.timeWindowEnd).toISOString().slice(0, 10) : ""
  );
  const [dailyStartTime, setDailyStartTime] = useState<string>(
    teacherUser.dailyStartTime || "08:00"
  );
  const [dailyEndTime, setDailyEndTime] = useState<string>(
    teacherUser.dailyEndTime || "20:00"
  );
  const [saving, setSaving] = useState(false);

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = await api.updateUserRole({
        userId: teacherUser.id,
        role: "TEACHER",
        permissions,
        isActive,
        isTimeRestricted,
        timeWindowStart: timeWindowStart ? new Date(timeWindowStart).toISOString() : null,
        timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd).toISOString() : null,
        dailyStartTime: isTimeRestricted ? dailyStartTime : null,
        dailyEndTime: isTimeRestricted ? dailyEndTime : null,
      });

      if (data && data.success) {
        toast.success(`Updated permissions & time access for ${teacherUser.name}`);
        setIsPermissionModalOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update permissions.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while updating teacher permissions.");
    } finally {
      setSaving(false);
    }
  };

  const assignments = profile?.assignments || [];
  const papersDrafted = teacherUser.uploadedPapers || [];
  const evaluationsDone = teacherUser.evaluationsDone || [];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users/teachers"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider font-mono">
              <Users className="w-4 h-4" />
              Faculty Profile &amp; Permission Delegation
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 font-heading">
              {teacherUser.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPermissionModalOpen(true)}
            className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Key className="w-3.5 h-3.5" />
            Grant Special Permissions
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition shadow-2xs cursor-pointer"
            title="Delete Faculty Account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Faculty Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-2xl font-heading shadow-md shadow-orange-500/20">
              {teacherUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{teacherUser.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-orange-50 text-orange-800 border border-orange-200">
                  {profile?.employeeId || "FAC-01"}
                </span>
                <span className="badge-purple">
                  {profile?.department || "Pharmaceutics"}
                </span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Active Faculty
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3 h-3" /> Suspended
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {teacherUser.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {teacherUser.phone || "+91 98480 34567"}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.qualification || "M.Pharm, Ph.D"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Designation &amp; Role</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {profile?.designation || "Professor"}
              </p>
              <p className="text-xs text-slate-500">
                Swathi College of Pharmacy Faculty Member
              </p>
            </div>
          </div>
        </div>

        {/* Access Status Summary Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Operational Access Window:</span>
            {isTimeRestricted ? (
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-mono">
                {dailyStartTime} – {dailyEndTime} IST (Scheduled Window)
              </span>
            ) : (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Standard Faculty Access
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Active Permissions:</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
              {permissions.length} Granted Authorities
            </span>
          </div>
        </div>
      </div>

      {/* Permissions Badges Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Current Granted Authorities &amp; Capabilities</h3>
          </div>
          <button
            onClick={() => setIsPermissionModalOpen(true)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition cursor-pointer"
          >
            Modify Permissions &rarr;
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {permissions.map((pKey: string) => {
            const found = ALL_PERMISSIONS.find((p) => p.key === pKey);
            return (
              <span
                key={pKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                {found ? found.label : pKey}
              </span>
            );
          })}
          {permissions.length === 0 && (
            <p className="text-xs text-slate-400">No permissions assigned.</p>
          )}
        </div>
      </div>

      {/* Grid: Teaching Assignments & Internal Papers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teaching Assignments */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Courses &amp; Class Cohorts</h3>
                <p className="text-[11px] text-slate-400">Subject mapping for continuous assessment</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">{assignments.length} Courses</span>
          </div>

          {assignments.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No formal course allocations linked in system.
            </div>
          ) : (
            <div className="space-y-2.5">
              {assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:border-teal-300 hover:bg-white transition group"
                >
                  <div>
                    <Link
                      href={`/admin/subjects/${a.subjectId || a.subject?.id}`}
                      className="font-bold text-slate-900 group-hover:text-teal-700 hover:underline block"
                    >
                      {a.subject?.name || "Subject"}
                    </Link>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Code: {a.subject?.code} • {a.class?.name} {a.section?.name ? `(${a.section.name})` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-semibold text-[11px]">
                      Session {a.academicYear?.name || "2026-27"}
                    </span>
                    <Link
                      href={`/admin/subjects/${a.subjectId || a.subject?.id}`}
                      className="p-1 text-slate-400 hover:text-teal-600 transition"
                      title="View Subject Hub"
                    >
                      &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papers Drafted / Evaluation History */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Papers Drafted &amp; Evaluated</h3>
                <p className="text-[11px] text-slate-400">Question blueprints and evaluations history</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">{papersDrafted.length} Blueprints</span>
          </div>

          {papersDrafted.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No question papers uploaded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {papersDrafted.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{p.exam?.subject?.name || p.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {p.exam?.title} • Version {p.version}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[10px]">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Special Permissions Grant Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Teacher Permission Matrix &amp; Override</h3>
                  <p className="text-xs text-slate-500">Grant custom exam authorities or time schedules to {teacherUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Time Window Override */}
              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ff5722]" />
                    <span className="font-bold text-slate-900">Scheduled Operational Hours Gate</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTimeRestricted}
                      onChange={(e) => setIsTimeRestricted(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff5722]"></div>
                  </label>
                </div>

                {isTimeRestricted && (
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-amber-200/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Daily Start Time
                      </label>
                      <input
                        type="time"
                        value={dailyStartTime}
                        onChange={(e) => setDailyStartTime(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Daily End Time
                      </label>
                      <input
                        type="time"
                        value={dailyEndTime}
                        onChange={(e) => setDailyEndTime(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Permission Checkboxes */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900">
                  Select Granted Permissions ({permissions.length} selected)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? "bg-purple-50/60 border-purple-300 text-purple-900"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600"
                        />
                        <div>
                          <p className="font-bold text-xs leading-tight">{perm.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => {
          router.push("/admin/users/teachers");
          router.refresh();
        }}
        title="Delete Faculty Account"
        description={`Are you sure you want to permanently delete faculty member ${teacherUser.name} (${teacherUser.email})? This action cannot be undone.`}
        itemIdentifier={`${teacherUser.name} — ${profile?.department || "Faculty"}`}
        deleteUrl={`/api/users/${teacherUser.id}`}
      />
    </div>
  );
}
