"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  QrCode,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Printer,
  Clock,
  AlertCircle,
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { checkUserTimeAccess } from "@/lib/permissions";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePayFeeMutation } from "@/features/fees/fees.queries";
import { payFeeSchema } from "@/features/fees/fees.schema";

interface StudentDashboardProps {
  user: SessionUser | null;
  enrolledExams: any[];
  feeStatus: any[];
  hallTickets: any[];
  publishedResults: any[];
}

export function StudentDashboard({
  user,
  enrolledExams = [],
  feeStatus = [],
  hallTickets = [],
  publishedResults = [],
}: StudentDashboardProps) {
  const router = useRouter();
  const payFeeMutation = usePayFeeMutation();
  const paying = payFeeMutation.isPending;
  const timeAccess = checkUserTimeAccess(user);

  // Compute real fee status
  const totalDue = feeStatus
    .filter((f) => f.status !== "PAID")
    .reduce((acc, f) => acc + (f.amount || 0), 0);
  const totalPaid = feeStatus
    .filter((f) => f.status === "PAID")
    .reduce((acc, f) => acc + (f.amount || 0), 0);
  const isFeeCleared = feeStatus.length > 0 && totalDue === 0;

  // Active hall ticket
  const activeHallTicket = hallTickets.find((h) => h.status === "ACTIVE") || hallTickets[0];

  // Latest published result
  const latestResult = publishedResults[0];

  const handlePay = async (examId?: string) => {
    const payload = {
      examId,
      paymentMethod: "UPI_INSTANT",
    };

    const parseResult = payFeeSchema.safeParse(payload);
    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0]?.message || "Payment details invalid");
      return;
    }

    try {
      const data = await payFeeMutation.mutateAsync(parseResult.data);
      toast.success(data?.message || "Fee paid successfully! Hall ticket unlocked.");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Payment failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Time-Window / Portal Access Banner */}
      {user?.isTimeRestricted && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            timeAccess.isAllowed
              ? "bg-blue-50/70 border-blue-200 text-blue-950"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                timeAccess.isAllowed ? "bg-blue-100 text-[#075FA7]" : "bg-rose-100 text-rose-700"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs">
                {timeAccess.isAllowed ? "Student Portal Active Session" : "Portal Access Restricted"}
              </p>
              <p className="text-[11px] opacity-85">
                {timeAccess.message} • Scheduled Window: {user.dailyStartTime || "08:00"} to {user.dailyEndTime || "20:00"} IST
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              timeAccess.isAllowed
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            {timeAccess.isAllowed ? "● Portal Active" : "● Access Suspended"}
          </span>
        </div>
      )}

      {/* Student Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#075FA7] via-[#054b85] to-[#032b4d] p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 border-2 border-[#BB904E] p-0.5 shadow-md flex items-center justify-center font-medium text-2xl text-white font-heading">
              {user?.name?.[0] || "S"}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 border border-white/20 text-[#DDBB7A] text-xs font-medium mb-1 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#DDBB7A]" />
                Authenticated Student Portal
              </div>
              <h1 className="text-2xl font-semibold text-white font-heading">{user?.name}</h1>
              <p className="text-xs sm:text-sm text-white/85 mt-0.5">
                Roll No: <strong className="font-mono text-[#DDBB7A]">{user?.studentProfile?.rollNo || "N/A"}</strong>
                {user?.studentProfile?.className && (
                  <span> • {user.studentProfile.className}</span>
                )}
                {user?.studentProfile?.sectionName && (
                  <span> (Sec {user.studentProfile.sectionName})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/student/hall-tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#075FA7] hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#075FA7]" />
              Download Hall Ticket
            </Link>
            <Link
              href="/student/results"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white border border-white/25 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#DDBB7A]" />
              View Marksheet
            </Link>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Fee Payment Card */}
        <div className="kpi-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isFeeCleared ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fee Clearance</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-base font-bold ${isFeeCleared ? "text-emerald-600" : "text-rose-600"}`}>
                {isFeeCleared ? "Paid & Cleared" : totalDue > 0 ? `Dues: ${formatCurrency(totalDue)}` : "No Dues"}
              </span>
              {isFeeCleared && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <Link
              href="/student/fees"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold mt-1"
            >
              Manage & Receipts <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Hall Ticket Card */}
        <div className="kpi-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${activeHallTicket ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}>
            <QrCode className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admit Card / QR</span>
            <p className="text-base font-bold text-slate-800 font-mono mt-1 truncate">
              {activeHallTicket ? activeHallTicket.hallTicketNumber : "Clearance Pending"}
            </p>
            <Link
              href="/student/hall-tickets"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold mt-1"
            >
              {activeHallTicket ? "View QR Ticket" : "Check Status"} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Published Result Card */}
        <div className="kpi-card bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Official Result</span>
            {latestResult ? (
              <>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-bold text-slate-900">
                    {latestResult.totalMarksObtained} / {latestResult.maxMarksTotal}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    latestResult.resultStatus === "PASS" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {latestResult.resultStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {latestResult.exam?.title || "Semester Examination"}
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-slate-500 mt-1">
                Under evaluation at Exam Cell
              </p>
            )}
            <Link
              href="/student/results"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold mt-1"
            >
              Grade Card & Transcript <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Exam Timetable & 2-Hour Release Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <span>Exam Timetable &amp; Paper Release Status</span>
            </div>
            <Link
              href="/student/exams"
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Full Schedule →
            </Link>
          </div>

          <div className="space-y-3">
            {enrolledExams.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-400" />
                <p className="text-sm font-semibold">No scheduled exams found for your enrolled course.</p>
                <p className="text-xs text-slate-400">Timetable updates will appear automatically when published by Examination Cell.</p>
              </div>
            ) : (
              enrolledExams.map((exam: any) => {
                const examFee = feeStatus.find((f) => f.examId === exam.id);
                const isPaid = examFee ? examFee.status === "PAID" : isFeeCleared;

                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {exam.examCode || exam.subject?.code || "EXAM"}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {exam.title}
                        </span>
                        {exam.paperStatus === "RELEASED" ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            Paper Released (Active)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        Date: <strong className="text-slate-800">{exam.examDate ? formatDate(exam.examDate) : "Scheduled Session"}</strong>
                        {exam.startTime && exam.endTime && (
                          <span> • Time: <strong className="text-slate-800">{exam.startTime} - {exam.endTime}</strong></span>
                        )}
                        <span> • Max Marks: <strong className="text-indigo-600">{exam.totalMarks || 100}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPaid ? (
                        <Link
                          href="/student/hall-tickets"
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Admit Card
                        </Link>
                      ) : (
                        <button
                          onClick={() => handlePay(exam.id)}
                          disabled={paying}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Fee & Unlock
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Official Verified Scorecard Snapshot */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Latest Result</span>
            </div>
            {latestResult && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Official
              </span>
            )}
          </div>

          {latestResult ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-slate-900">{latestResult.exam?.subject?.name || latestResult.exam?.title}</p>
                  <p className="text-xs text-slate-500 font-mono">{latestResult.exam?.subject?.code}</p>
                </div>
                <span className="text-2xl font-black text-indigo-600">
                  {latestResult.grade || "-"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs border-t border-slate-200/80 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Marks Obtained:</span>
                  <strong className="text-slate-900">
                    {latestResult.totalMarksObtained} / {latestResult.maxMarksTotal}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Grade Assigned:</span>
                  <strong className="text-indigo-600">{latestResult.grade}</strong>
                </div>
                {latestResult.gpa && (
                  <div className="flex justify-between text-slate-600">
                    <span>Grade Points (GPA):</span>
                    <strong className="text-indigo-600">{latestResult.gpa} / 10.0</strong>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Status:</span>
                  <strong className={latestResult.resultStatus === "PASS" ? "text-emerald-600" : "text-rose-600"}>
                    {latestResult.resultStatus}
                  </strong>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/student/results"
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Full Official Transcript <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <p className="text-xs font-semibold text-slate-700">No Published Results</p>
              <p className="text-[11px] text-slate-400">
                Official marks will appear once results are published by the Controller of Examinations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
