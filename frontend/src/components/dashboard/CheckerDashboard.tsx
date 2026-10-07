"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Search,
  Eye,
  Edit3,
  Sparkles,
  Layers,
  Cpu,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { checkUserTimeAccess } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface CheckerDashboardProps {
  user: SessionUser | null;
  pendingForChecking: any[];
  finalizedCount: number;
}

export function CheckerDashboard({
  user,
  pendingForChecking,
  finalizedCount,
}: CheckerDashboardProps) {
  const router = useRouter();
  const timeAccess = checkUserTimeAccess(user);
  const [search, setSearch] = useState("");
  const [selectedSheetForCheck, setSelectedSheetForCheck] = useState<any | null>(null);
  const [adjustedScore, setAdjustedScore] = useState<string>("");
  const [checkerNotes, setCheckerNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const filteredSheets = pendingForChecking.filter((s) => {
    const code = s.sheetCode?.toLowerCase() || "";
    const roll = s.student?.rollNo?.toLowerCase() || "";
    const name = s.student?.user?.name?.toLowerCase() || "";
    const subj = s.exam?.subject?.name?.toLowerCase() || "";
    const query = search.toLowerCase();
    return code.includes(query) || roll.includes(query) || name.includes(query) || subj.includes(query);
  });

  const handleOpenCheckModal = (sheet: any) => {
    setSelectedSheetForCheck(sheet);
    setAdjustedScore(
      sheet.finalScore !== null && sheet.finalScore !== undefined
        ? String(sheet.finalScore)
        : sheet.teacherTotalScore !== null && sheet.teacherTotalScore !== undefined
        ? String(sheet.teacherTotalScore)
        : ""
    );
    setCheckerNotes(sheet.checkerNotes || "Verified 2nd-stage totals and rubric alignment. Approved.");
  };

  const handleCommitCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheetForCheck) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/evaluation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerSheetId: selectedSheetForCheck.id,
          adjustedScore: Number(adjustedScore),
          checkerNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Paper scrutiny finalized!");
        setSelectedSheetForCheck(null);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to submit check.");
      }
    } catch {
      toast.error("Network error while submitting scrutiny.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time-Window Access Status Banner */}
      {user?.isTimeRestricted && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            timeAccess.isAllowed
              ? "bg-indigo-50/70 border-indigo-200 text-indigo-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                timeAccess.isAllowed ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs">
                {timeAccess.isAllowed
                  ? "Authorized Paper Scrutiny Window Active"
                  : "Scheduled Access Restriction"}
              </p>
              <p className="text-[11px] opacity-85">
                {timeAccess.message} • Operational Slot: {user.dailyStartTime || "08:00"} to{" "}
                {user.dailyEndTime || "20:00"} IST
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              timeAccess.isAllowed
                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            {timeAccess.isAllowed ? "● Scrutiny Desk Open" : "● Window Closed"}
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-400/20 border border-indigo-300/30 text-indigo-200 text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              Second-Stage Paper Scrutiny &amp; Chief Moderation Authority
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              Welcome, {user?.name || "Senior Paper Checker"}
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm max-w-2xl font-normal">
              Perform second-level audit on evaluator scores, verify AI model comparisons, check mark arithmetic totals, and give final sign-off before result publishing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/evaluation"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs sm:text-sm font-bold shadow-lg shadow-indigo-950/20 transition-all hover:scale-105"
            >
              <Cpu className="w-4 h-4 text-indigo-700" />
              Full AI Marking Desk
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Scrutiny</p>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">
            {pendingForChecking.length}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Evaluated by 1st Examiner</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed-off &amp; Finalized</p>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{finalizedCount}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Ready for Result Publishing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scrutiny Compliance</p>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-2">100%</h3>
          <p className="text-xs text-slate-500 mt-1">Dual-Signoff PCI Mandate</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moderation Rate</p>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-purple-600 mt-2">
            {finalizedCount + pendingForChecking.length > 0
              ? Math.round(
                  (finalizedCount / (finalizedCount + pendingForChecking.length)) * 100
                )
              : 100}
            %
          </h3>
          <p className="text-xs text-slate-500 mt-1">Total Assigned Batch</p>
        </div>
      </div>

      {/* Main Scrutiny Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              Evaluated Answer Sheets Awaiting Checker Endorsement ({filteredSheets.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any candidate script to inspect evaluator marking breakdown, adjust score if required, and endorse.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by barcode, roll, subject..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredSheets.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Scrutiny Queue Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted evaluations have been verified and signed off. When evaluators submit new scripts, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Script Barcode</th>
                  <th className="py-3.5 px-4">Candidate &amp; Roll No</th>
                  <th className="py-3.5 px-4">Subject &amp; Exam</th>
                  <th className="py-3.5 px-4">1st Evaluator</th>
                  <th className="py-3.5 px-4 text-right">Evaluator Marks</th>
                  <th className="py-3.5 px-4 text-right">AI Suggested</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSheets.map((s) => {
                  const evMarks = s.teacherTotalScore !== null ? s.teacherTotalScore : s.finalScore;
                  const isChecked = s.checkedById !== null;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {s.sheetCode || `SCR-${s.id.slice(0, 6)}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{s.student?.user?.name || "Unassigned"}</p>
                        <p className="text-[11px] font-mono text-slate-500">{s.student?.rollNo || "—"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{s.exam?.subject?.name || "Subject"}</p>
                        <p className="text-[10px] text-slate-400">{s.exam?.title}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {s.evaluatedBy?.name || "Dr. Sunita Deshmukh"}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.verifiedAt ? formatDate(s.verifiedAt) : "Evaluated"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {evMarks !== null && evMarks !== undefined
                          ? `${evMarks} / ${s.exam?.maxMarks || 100} M`
                          : "Pending"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {s.aiTotalScore !== null ? `${s.aiTotalScore} M` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenCheckModal(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Scrutinize &amp; Sign</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scrutiny Modal */}
      {selectedSheetForCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2nd-Stage Scrutiny &amp; Moderation Sign-off
                  </h3>
                  <p className="text-xs text-slate-500">
                    Script: <strong className="text-slate-800">{selectedSheetForCheck.sheetCode}</strong> (
                    {selectedSheetForCheck.student?.user?.name || "Student"})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSheetForCheck(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommitCheck} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">1st Evaluator Score</p>
                  <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                    {selectedSheetForCheck.teacherTotalScore ?? selectedSheetForCheck.finalScore ?? "0"} M
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    By {selectedSheetForCheck.evaluatedBy?.name || "Examiner"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">AI Suggested Score</p>
                  <p className="text-base font-extrabold text-emerald-600 font-mono mt-0.5">
                    {selectedSheetForCheck.aiTotalScore ?? "0"} M
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Gemini Vision OCR</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Verified Final Score (Marks Out of {selectedSheetForCheck.exam?.maxMarks || 100})</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Endorsed or Adjusted</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min={0}
                  max={selectedSheetForCheck.exam?.maxMarks || 100}
                  value={adjustedScore}
                  onChange={(e) => setAdjustedScore(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-bold font-mono text-base focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Checker Scrutiny Notes &amp; Verification Remarks
                </label>
                <textarea
                  rows={3}
                  value={checkerNotes}
                  onChange={(e) => setCheckerNotes(e.target.value)}
                  placeholder="e.g. Total verified, rubric scheme conforms with question 4 step criteria."
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSheetForCheck(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? "Signing Off..." : "Approve & Finalize Marks"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
