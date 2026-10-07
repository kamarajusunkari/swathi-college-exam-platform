"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Receipt,
  Trash2,
} from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { useRouter } from "next/navigation";

interface Props {
  fees: any[];
}

export function AdminFeesClient({ fees: initialFees }: Props) {
  const router = useRouter();
  const [fees, setFees] = useState(initialFees);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const totalCollected = fees
    .filter((f) => f.status === "PAID")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = fees
    .filter((f) => f.status === "UNPAID" || f.status === "PENDING")
    .reduce((sum, f) => sum + f.amount, 0);

  const paidCount = fees.filter((f) => f.status === "PAID").length;
  const pendingCount = fees.filter((f) => f.status === "UNPAID" || f.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            Bursar &amp; Examination Fee Ledger
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Institutional Fee Collections &amp; Clearance Gate
          </h1>
          <p className="text-sm text-slate-500">
            Real-time fee receipts, pending examination fee dues, and automated hall ticket unlock tracking.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue Realized</p>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatCurrency(totalCollected)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{paidCount} Cleared Transactions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">
            {formatCurrency(totalPending)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{pendingCount} Accounts Pending</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cleared Candidates</p>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-2">{paidCount}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Hall Ticket Eligible</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collection Rate</p>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            {fees.length > 0 ? Math.round((paidCount / fees.length) * 100) : 0}%
          </h3>
          <p className="text-xs text-slate-500 mt-1">Institutional Clearance</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Student Fee Accounts &amp; Audit Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every transaction generates an irrevocable digital receipt and updates hall ticket gate conditions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Receipt / Txn ID</th>
                <th className="py-3 px-4">Student &amp; Roll No</th>
                <th className="py-3 px-4">Class &amp; Cohort</th>
                <th className="py-3 px-4">Examination Fee</th>
                <th className="py-3 px-4">Amount &amp; Status</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Cleared Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {fees.map((fee) => {
                const isPaid = fee.status === "PAID";
                return (
                  <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-indigo-600 text-xs">
                        {fee.receiptNo || "UNPAID-INV"}
                      </p>
                      {fee.transactionId && (
                        <p className="text-[10px] text-slate-400">{fee.transactionId}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{fee.student.user.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">{fee.student.rollNo}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">{fee.student.class.name}</p>
                      <p className="text-[10px] text-slate-400">Sec {fee.student.section?.name || "A"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {fee.exam.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {formatCurrency(fee.amount)}
                        </p>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" /> FULLY PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {fee.paymentMethod || "Pending Payment"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {fee.paidAt
                        ? formatDateTime(fee.paidAt)
                        : "Awaiting Clearance"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: fee.id,
                            name: `Receipt ${fee.receiptNo || fee.id.slice(0, 8)} (${fee.student.user.name})`,
                            url: `/api/fees/${fee.id}`,
                          })
                        }
                        title={`Delete fee receipt ${fee.receiptNo || fee.id}`}
                        className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          setFees((prev) => prev.filter((f) => f.id !== deleteTarget.id));
          router.refresh();
        }}
        title="Delete Fee Record"
        description={`Are you sure you want to permanently delete and void ${deleteTarget?.name}? This will revoke examination fee clearance for this candidate.`}
        itemIdentifier={deleteTarget?.name || ""}
        deleteUrl={deleteTarget?.url || ""}
      />
    </div>
  );
}
