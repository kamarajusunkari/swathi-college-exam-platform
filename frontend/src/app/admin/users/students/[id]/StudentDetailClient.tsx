"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Award,
  BookOpen,
  Building,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api/services.api";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

interface Props {
  studentUser: any;
  currentUser: any;
}

export function StudentDetailClient({ studentUser, currentUser }: Props) {
  const router = useRouter();
  const profile = studentUser.studentProfile;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Access state
  const [isActive, setIsActive] = useState<boolean>(studentUser.isActive ?? true);
  const [isTimeRestricted, setIsTimeRestricted] = useState<boolean>(
    studentUser.isTimeRestricted ?? false
  );
  const [timeWindowStart, setTimeWindowStart] = useState<string>(
    studentUser.timeWindowStart ? new Date(studentUser.timeWindowStart).toISOString().slice(0, 10) : ""
  );
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>(
    studentUser.timeWindowEnd ? new Date(studentUser.timeWindowEnd).toISOString().slice(0, 10) : ""
  );
  const [dailyStartTime, setDailyStartTime] = useState<string>(
    studentUser.dailyStartTime || "08:00"
  );
  const [dailyEndTime, setDailyEndTime] = useState<string>(
    studentUser.dailyEndTime || "22:00"
  );
  const [savingAccess, setSavingAccess] = useState(false);

  const handleSaveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccess(true);
    try {
      const data = await api.updateUserRole({
        userId: studentUser.id,
        role: "STUDENT",
        permissions: [],
        isActive,
        isTimeRestricted,
        timeWindowStart: timeWindowStart ? new Date(timeWindowStart).toISOString() : null,
        timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd).toISOString() : null,
        dailyStartTime: isTimeRestricted ? dailyStartTime : null,
        dailyEndTime: isTimeRestricted ? dailyEndTime : null,
      });

      if (data && data.success) {
        toast.success("Student portal access permissions updated successfully!");
        setIsAccessModalOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update access settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while updating access.");
    } finally {
      setSavingAccess(false);
    }
  };

  const fees = profile?.feePayments || [];
  const hallTickets = profile?.hallTickets || [];
  const answerSheets = profile?.answerSheets || [];
  const examResults = profile?.examResults || [];

  const totalFeeCount = fees.length;
  const paidFeeCount = fees.filter((f: any) => f.status === "PAID").length;
  const isAllFeesCleared = totalFeeCount > 0 && paidFeeCount === totalFeeCount;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users/students"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider font-mono">
              <GraduationCap className="w-4 h-4" />
              Student Academic Profile &amp; Clearance
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 font-heading">
              {studentUser.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAccessModalOpen(true)}
            className="btn-outline inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Portal Access &amp; Time Gate
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition shadow-2xs cursor-pointer"
            title="Delete Student Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-bold text-2xl font-heading shadow-md shadow-teal-500/20">
              {studentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{studentUser.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Roll: {profile?.rollNo || "N/A"}
                </span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Active Enrolled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3 h-3" /> Portal Suspended
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {studentUser.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {studentUser.phone || "+91 98480 00000"}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  ID: {profile?.studentId || "SWC-STU"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Class &amp; Section</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {profile?.class?.name || "B.Pharmacy"}
              </p>
              <p className="text-xs text-slate-500">
                Sec {profile?.section?.name || "A"} • Session {profile?.academicYear?.name || "2026-27"}
              </p>
            </div>
          </div>
        </div>

        {/* Access Status Summary Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Student Portal Access Schedule:</span>
            {isTimeRestricted ? (
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-mono">
                {dailyStartTime} – {dailyEndTime} IST
              </span>
            ) : (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                24/7 Unrestricted Student Access
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Fee Clearance:</span>
            {isAllFeesCleared ? (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Cleared ({paidFeeCount}/{totalFeeCount})
              </span>
            ) : (
              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                Dues Pending ({totalFeeCount - paidFeeCount} Unpaid)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Academic Subjects Card */}
      {profile?.class?.subjects && profile.class.subjects.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Enrolled Academic Subjects</h3>
                <p className="text-[11px] text-slate-400">Class curriculum courses for {profile.class.name}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">{profile.class.subjects.length} Subjects</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.class.subjects.map((sub: any) => {
              const faculty = sub.assignments?.[0]?.teacher;
              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-teal-300 hover:bg-white transition flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{sub.credits} Credits</span>
                    </div>
                    <Link
                      href={`/admin/subjects/${sub.id}`}
                      className="font-bold text-xs text-slate-900 group-hover:text-teal-700 hover:underline block mt-1.5"
                    >
                      {sub.name}
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Faculty: <strong>{faculty?.user?.name || "Unassigned"}</strong>
                    </span>
                    <Link
                      href={`/admin/subjects/${sub.id}`}
                      className="text-teal-600 font-bold hover:underline"
                    >
                      Hub &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Sections: Fee Ledger & Hall Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Clearance Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Fee Accounts &amp; Clearances</h3>
                <p className="text-[11px] text-slate-400">Exam dues and official receipts</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">{fees.length} Invoices</span>
          </div>

          {fees.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No fee transactions recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {fees.map((f: any) => (
                <div
                  key={f.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{f.exam?.title || "Examination Fee"}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Receipt: {f.receiptNo || "PENDING"} • {f.paymentMethod || "Counter"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 font-mono">{formatCurrency(f.amount)}</p>
                    {f.status === "PAID" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                        <Clock className="w-3 h-3" /> UNPAID
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hall Tickets Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">QR Hall Tickets Issued</h3>
                <p className="text-[11px] text-slate-400">Admit cards with digital verification QR</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">{hallTickets.length} Passes</span>
          </div>

          {hallTickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hall tickets issued yet.</p>
          ) : (
            <div className="space-y-2.5">
              {hallTickets.map((ht: any) => (
                <div
                  key={ht.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{ht.exam?.title || "Semester Examination"}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      No: {ht.hallTicketNumber} • Seat {ht.seatNo || "A-12"} • {ht.centerName}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                    {ht.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Answer Booklets & Examination Results */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Answer Booklets &amp; Exam Performance</h3>
              <p className="text-xs text-slate-500">Graded answer scripts and official marks</p>
            </div>
          </div>
        </div>

        {answerSheets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No answer scripts cataloged for this student yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Sheet Code</th>
                  <th className="p-3.5">Subject &amp; Exam</th>
                  <th className="p-3.5">Evaluation Status</th>
                  <th className="p-3.5 text-right">AI Score</th>
                  <th className="p-3.5 text-right">Final Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {answerSheets.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-700">
                      {s.sheetCode || `SCR-${s.id.slice(0, 6)}`}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{s.exam?.subject?.name || "Subject"}</p>
                      <p className="text-[11px] text-slate-400">{s.exam?.title}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> {s.evaluationStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      {s.aiTotalScore !== null ? `${s.aiTotalScore} M` : "—"}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {s.finalScore !== null ? `${s.finalScore} / ${s.exam?.maxMarks || 100} M` : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Access Control Modal */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Portal Access Gate</h3>
                  <p className="text-xs text-slate-500">Configure access status &amp; operational window</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccessModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccess} className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div>
                  <p className="font-bold text-slate-900">Student Portal Account Status</p>
                  <p className="text-slate-500 text-[11px]">Allow or suspend login to student portal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ff5722]" />
                    <span className="font-bold text-slate-900">Time-Restricted Portal Window</span>
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
                  <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Valid From (Date)
                        </label>
                        <input
                          type="date"
                          value={timeWindowStart}
                          onChange={(e) => setTimeWindowStart(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Valid Until (Date)
                        </label>
                        <input
                          type="date"
                          value={timeWindowEnd}
                          onChange={(e) => setTimeWindowEnd(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
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
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAccess}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition disabled:opacity-50"
                >
                  {savingAccess ? "Saving..." : "Update Access"}
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
          router.push("/admin/users/students");
          router.refresh();
        }}
        title="Delete Student Record"
        description={`Are you sure you want to permanently delete student ${studentUser.name} (Roll: ${profile?.rollNo})? All test submissions, hall tickets, and fee receipts will be purged.`}
        itemIdentifier={`${studentUser.name} — Roll: ${profile?.rollNo}`}
        deleteUrl={`/api/users/${studentUser.id}`}
      />
    </div>
  );
}
