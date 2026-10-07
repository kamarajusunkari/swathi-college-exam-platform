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
} from "lucide-react";
import { SessionUser } from "@/lib/types";
import { checkUserTimeAccess } from "@/lib/permissions";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface StudentDashboardProps {
  user: SessionUser | null;
  enrolledExams: any[];
  feeStatus: any[];
  hallTickets: any[];
  publishedResults: any[];
}

export function StudentDashboard({
  user,
  enrolledExams,
  feeStatus,
  hallTickets,
  publishedResults,
}: StudentDashboardProps) {
  const [paying, setPaying] = useState(false);
  const timeAccess = checkUserTimeAccess(user);

  const handleSimulatePayment = async (examId: string) => {
    setPaying(true);
    try {
      const res = await fetch("/api/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          amount: 250.0,
          paymentMethod: "UPI",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Exam Fee Paid Successfully (₹250)!", {
          description: "Hall Ticket automatically generated and verified with QR code.",
        });
        window.location.reload();
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch {
      toast.error("Network error during payment");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6 bg-white">
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
                Verified Student Portal
              </div>
              <h1 className="text-2xl font-semibold text-white font-heading">{user?.name}</h1>
              <p className="text-xs sm:text-sm text-white/85 mt-0.5">
                Roll No: <strong className="font-mono text-[#DDBB7A]">{user?.studentProfile?.rollNo || "2026-CSE-001"}</strong> • ID: SW-2026-101 • Grade 10 (Section A)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/hall-tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#075FA7] hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#075FA7]" />
              Download Hall Ticket
            </Link>
            <Link
              href="/results"
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
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-[#075FA7]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="kpi-label">Fee Clearance</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-semibold text-[#075FA7]">Paid &amp; Verified</span>
              <CheckCircle2 className="w-4 h-4 text-[#075FA7]" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Receipt: <span className="text-slate-600 font-mono">RCPT-2026-00412</span>
            </p>
          </div>
        </div>

        {/* Hall Ticket Card */}
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-[#075FA7]">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="kpi-label">Hall Ticket Status</span>
            <p className="text-base sm:text-lg font-semibold text-slate-800 font-mono mt-0.5">HT-2026-1001-MTH</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Seat: <span className="text-[#075FA7] font-medium">A-01 (Hall 101)</span>
            </p>
          </div>
        </div>

        {/* Published Result Card */}
        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="kpi-label">Official Result</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-semibold text-slate-800">94 / 100</span>
              <span className="badge-blue">
                PASSED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mid-Term Mathematics
            </p>
          </div>
        </div>
      </div>

      {/* Exam Timetable & 2-Hour Release Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <CalendarDays className="w-4.5 h-4.5 text-[#075FA7]" />
              <span>Exam Timetable &amp; Release Status</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Session: 2026-2027</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#075FA7] bg-[#075FA7]/10 px-2 py-0.5 rounded border border-[#075FA7]/20">
                    EXAM-2026-MID-MTH
                  </span>
                  <span className="text-sm font-bold text-slate-900">Mathematics - Pure &amp; Applied</span>
                  <span className="text-xs font-bold bg-blue-50 text-[#075FA7] px-2 py-0.5 rounded-full border border-blue-200">
                    Paper Released (2-Hr Window)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Date: <strong className="text-slate-800">Tomorrow</strong> • Time: <strong className="text-slate-800">10:00 AM - 1:00 PM</strong> • Mode: <strong className="text-[#075FA7]">Offline Physical Booklet</strong>
                </p>
              </div>

              <Link
                href="/hall-tickets"
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Hall Ticket
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#075FA7] bg-[#075FA7]/10 px-2 py-0.5 rounded border border-[#075FA7]/20">
                    EXAM-2026-MID-PHY
                  </span>
                  <span className="text-sm font-bold text-slate-900">Physics - Concepts &amp; Mechanics</span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    Scheduled (Releases 8:00 AM)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Date: <strong className="text-slate-800">In 3 Days</strong> • Time: <strong className="text-slate-800">10:00 AM - 1:00 PM</strong> • Fee: <strong className="text-[#BB904E]">₹250 (Clearance needed)</strong>
                </p>
              </div>

              <button
                onClick={() => handleSimulatePayment("exam-phys-id")}
                disabled={paying}
                className="px-3.5 py-2 rounded-lg bg-[#075FA7] hover:bg-[#054b85] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay Fee (₹250)
              </button>
            </div>
          </div>
        </div>

        {/* Official Verified Scorecard Snapshot */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <Award className="w-4.5 h-4.5 text-[#BB904E]" />
              <span>Scorecard</span>
            </div>
            <span className="text-xs font-bold text-[#075FA7] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Official
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-900 font-heading">Mathematics</p>
                <p className="text-xs text-slate-500 font-normal">Mid-Term Examination</p>
              </div>
              <span className="text-2xl font-semibold text-[#075FA7] font-heading">94%</span>
            </div>

            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Marks Obtained:</span>
                <strong className="text-slate-900">94 / 100</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Grade Assigned:</span>
                <strong className="text-[#075FA7]">A+ (Outstanding)</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Grade Points (GPA):</span>
                <strong className="text-[#075FA7]">9.4 / 10.0</strong>
              </div>
            </div>

            <div className="pt-1.5">
              <Link
                href="/results"
                className="w-full py-2 rounded-lg bg-[#075FA7]/10 hover:bg-[#075FA7]/20 text-[#075FA7] border border-[#075FA7]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                View &amp; Print Marksheet <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
