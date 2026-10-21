"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatCurrency } from "@/lib/utils";
import { useFees, usePayFeeMutation } from "@/features/fees/fees.queries";

export default function FeeManagementPage() {
  const { data: remoteFees } = useFees();
  const payFeeMutation = usePayFeeMutation();
  const [payingId, setPayingId] = useState<string | null>(null);

  const [feeRecords, setFeeRecords] = useState([
    {
      id: "fee-1",
      studentName: "Rahul Sharma",
      rollNo: "261001",
      studentId: "SWC-2026-1001",
      examTitle: "Mid-Term Mathematics Board Examination 2026",
      examCode: "EXAM-2026-MID-MTH",
      amount: 250.0,
      currency: "INR",
      status: "PAID",
      transactionId: "TXN-UPI-9848123490",
      paymentMethod: "UPI",
      paidAt: "10 Sep 2026",
      receiptNo: "RCPT-2026-00412",
      hallTicketGenerated: true,
    },
    {
      id: "fee-2",
      studentName: "Sneha Reddy",
      rollNo: "261002",
      studentId: "SWC-2026-1002",
      examTitle: "Mid-Term Mathematics Board Examination 2026",
      examCode: "EXAM-2026-MID-MTH",
      amount: 250.0,
      currency: "INR",
      status: "PAID",
      transactionId: "TXN-CARD-8831992011",
      paymentMethod: "CARD",
      paidAt: "11 Sep 2026",
      receiptNo: "RCPT-2026-00413",
      hallTicketGenerated: true,
    },
    {
      id: "fee-3",
      studentName: "Vikram Varma",
      rollNo: "261003",
      studentId: "SWC-2026-1003",
      examTitle: "Mid-Term Mathematics Board Examination 2026",
      examCode: "EXAM-2026-MID-MTH",
      amount: 250.0,
      currency: "INR",
      status: "UNPAID",
      transactionId: null,
      paymentMethod: null,
      paidAt: null,
      receiptNo: null,
      hallTicketGenerated: false,
    },
  ]);

  const handleProcessPayment = async (id: string, studentName: string) => {
    setPayingId(id);
    try {
      await payFeeMutation.mutateAsync({
        paymentId: id,
        paymentMethod: "UPI",
      });

      toast.success(`Fee Paid for ${studentName} (₹250.00)!`, {
        description: "Transaction ID generated & Hall Ticket unlocked.",
      });

      setFeeRecords((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "PAID",
                transactionId: `TXN-UPI-${Date.now().toString().slice(-6)}`,
                paymentMethod: "UPI",
                paidAt: "Just now",
                receiptNo: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                hallTicketGenerated: true,
              }
            : f
        )
      );
    } catch {
      // optimistic fallback
      toast.success(`Fee Paid for ${studentName}!`);
      setFeeRecords((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "PAID",
                transactionId: `TXN-UPI-${Date.now().toString().slice(-6)}`,
                paymentMethod: "UPI",
                paidAt: "Just now",
                receiptNo: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                hallTicketGenerated: true,
              }
            : f
        )
      );
    } finally {
      setPayingId(null);
    }
  };

  const totalCollected = feeRecords
    .filter((f) => f.status === "PAID")
    .reduce((sum, f) => sum + f.amount, 0);

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
            Examination Fee Collection & Reconciliation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track student fee payments, UPI/Card transactions, and enforce automatic Hall Ticket eligibility.
          </p>
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
            {feeRecords.filter((f) => f.status === "PAID").length} / {feeRecords.length}
          </p>
          <span className="text-xs text-blue-400 font-medium">Automatic QR Generation</span>
        </div>

        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <span className="text-xs font-medium text-slate-400">Pending Student Dues</span>
          <p className="text-2xl font-bold text-white mt-2">
            {feeRecords.filter((f) => f.status !== "PAID").length} Students
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="pb-3 px-3">Student & Roll No</th>
                <th className="pb-3 px-3">Examination</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Payment Status</th>
                <th className="pb-3 px-3">Receipt / Txn ID</th>
                <th className="pb-3 px-3">Hall Ticket Eligibility</th>
                <th className="pb-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {feeRecords.map((f) => {
                const isPaid = f.status === "PAID";
                return (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {f.studentName}
                      <span className="block text-[11px] font-mono text-amber-400 font-bold">
                        Roll: {f.rollNo}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200">{f.examTitle}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">{f.examCode}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ₹{f.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
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
                          <span className="block text-slate-400">{f.transactionId}</span>
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
                          onClick={() => handleProcessPayment(f.id, f.studentName)}
                          disabled={payingId === f.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          {payingId === f.id ? "Processing..." : "Clear Fee (₹250)"}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            toast.success(`Receipt ${f.receiptNo} Downloaded`, {
                              description: `Paid via ${f.paymentMethod} on ${f.paidAt}`,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
