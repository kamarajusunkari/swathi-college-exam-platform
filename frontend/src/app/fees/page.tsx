"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
  Download,
  Filter,
  Sparkles,
  QrCode,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useFees, usePayFeeMutation } from "@/features/fees/fees.queries";

export default function FeeManagementPage() {
  const { data: rawFees, isLoading, refetch } = useFees();
  const payFeeMutation = usePayFeeMutation();
  const [payingId, setPayingId] = useState<string | null>(null);

  const fees: any[] = Array.isArray(rawFees)
    ? rawFees
    : Array.isArray((rawFees as any)?.fees)
    ? (rawFees as any).fees
    : [];

  const handleProcessPayment = async (id: string, studentName: string) => {
    setPayingId(id);
    try {
      await payFeeMutation.mutateAsync({
        paymentId: id,
        paymentMethod: "UPI",
      });

      toast.success(`Fee Paid for ${studentName}! Hall Ticket unlocked.`);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Payment processing failed");
    } finally {
      setPayingId(null);
    }
  };

  const totalCollected = fees
    .filter((f) => f.status === "PAID")
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const paidCount = fees.filter((f) => f.status === "PAID").length;
  const unpaidCount = fees.filter((f) => f.status !== "PAID").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-400 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            Institutional Fee Clearance System
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Examination Fee Collection &amp; Reconciliation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track student fee payments, UPI/Card transactions, and enforce automatic Hall Ticket eligibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/fees"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            Open Admin Ledger Console →
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400">Total Fees Reconciled</span>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalCollected)}</p>
          <span className="text-xs text-emerald-400 font-medium">Clearance Verified</span>
        </div>

        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400">Eligible Hall Tickets</span>
          <p className="text-2xl font-bold text-white mt-2">
            {paidCount} / {fees.length}
          </p>
          <span className="text-xs text-blue-400 font-medium">Automatic QR Generation</span>
        </div>

        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400">Pending Student Dues</span>
          <p className="text-2xl font-bold text-white mt-2">
            {unpaidCount} Students
          </p>
          <span className="text-xs text-amber-400 font-medium">Awaiting Clearance</span>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Student Examination Fee Register</h2>
          <span className="text-xs text-slate-400 font-mono">Academic Year 2026-2027</span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs">Loading institutional fee records from database...</p>
          </div>
        ) : fees.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <IndianRupee className="w-10 h-10 mx-auto text-slate-500" />
            <h3 className="text-base font-bold text-white">No Fee Records Registered</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Student examination fee obligations will appear automatically upon exam scheduling or student enrollment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Student &amp; Roll No</th>
                  <th className="pb-3 px-3">Examination</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Payment Status</th>
                  <th className="pb-3 px-3">Receipt / Txn ID</th>
                  <th className="pb-3 px-3">Hall Ticket Eligibility</th>
                  <th className="pb-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {fees.map((f) => {
                  const isPaid = f.status === "PAID";
                  const studentName = f.student?.user?.name || f.studentName || "Candidate";
                  const rollNo = f.student?.rollNo || f.rollNo || "N/A";
                  const examTitle = f.exam?.title || f.examTitle || "Examination";
                  const examCode = f.exam?.examCode || f.examCode || "";

                  return (
                    <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {studentName}
                        <span className="block text-[11px] font-mono text-amber-400 font-bold">
                          Roll: {rollNo}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-200">{examTitle}</span>
                        {examCode && (
                          <span className="block text-[11px] text-slate-400 font-mono">{examCode}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {formatCurrency(Number(f.amount) || 0)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            isPaid
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {f.receiptNo ? (
                          <>
                            <span className="text-emerald-400 font-bold">{f.receiptNo}</span>
                            {f.transactionId && (
                              <span className="block text-slate-400 text-[10px]">{f.transactionId}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500">Unpaid</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isPaid ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible (Issued)
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Blocked until Paid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {!isPaid ? (
                          <button
                            onClick={() => handleProcessPayment(f.id, studentName)}
                            disabled={payingId === f.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                          >
                            {payingId === f.id ? "Processing..." : "Clear Fee"}
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">Cleared</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
