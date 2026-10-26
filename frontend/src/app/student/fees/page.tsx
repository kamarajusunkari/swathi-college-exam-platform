"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { FeePaymentAction } from "./FeePaymentAction";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

export default function StudentFeesPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["student", "fees"],
    queryFn: async () => {
      const res = await apiClient.get("/users/student/fees");
      return res.data || { student: null };
    },
    staleTime: 30 * 1000,
  });

  const student = data?.student;
  const feePayments: any[] = student?.feePayments || [];

  const totalFees = feePayments.reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const totalPaid = feePayments
    .filter((f: any) => f.status === "PAID")
    .reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const outstandingBalance = Math.max(0, totalFees - totalPaid);
  const isAllPaid = outstandingBalance === 0 && feePayments.length > 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              Student Finance &amp; Clearance
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Examination &amp; Academic Fee Clearance Desk
            </h1>
            <p className="text-sm text-slate-500">
              Clear outstanding examination dues instantly to release your authenticated QR hall ticket.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Semester Fees</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(totalFees)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Assigned in Ledger</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid Amount</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {formatCurrency(totalPaid)}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">Verified in Ledger</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              isAllPaid ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              {isAllPaid ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
              <h3 className={`text-2xl font-extrabold mt-0.5 ${
                isAllPaid ? "text-emerald-600" : "text-rose-600"
              }`}>
                {formatCurrency(outstandingBalance)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAllPaid ? "Hall Ticket Release Authorized" : "Payment Required for Admit Card"}
              </p>
            </div>
          </div>
        </div>

        {/* Ledger Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                Fee Payment Ledger &amp; Transaction Slips
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official institutional invoices and digital payment receipts.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs">Loading fee ledger...</span>
            </div>
          ) : feePayments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No Pending Fee Demands</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No unpaid dues are registered for your enrollment record.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Receipt ID</th>
                    <th className="py-3 px-4">Description / Exam</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Clearance Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {feePayments.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {fee.receiptNumber || fee.id.slice(0, 10).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{fee.description || (fee.exam ? fee.exam.title : "Semester Examination Fee")}</p>
                        <p className="text-[10px] text-slate-400">Institutional Examination Cell</p>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(fee.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {fee.paymentMethod || "UPI / NET_BANKING"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          fee.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {fee.status === "PAID" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid &amp; Reconciled
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-600" /> Pending Payment
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <FeePaymentAction
                          paymentId={fee.id}
                          isPaid={fee.status === "PAID"}
                          amount={fee.amount}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
