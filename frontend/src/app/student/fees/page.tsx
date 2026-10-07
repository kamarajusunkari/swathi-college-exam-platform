import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { FeePaymentAction } from "./FeePaymentAction";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentFeesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{ student: any }>("/users/student/fees", {
    fallback: { student: null },
  });
  const student = res.student;

  if (!student) {
    redirect("/login");
  }

  const totalFees = student.feePayments.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = student.feePayments
    .filter((f) => f.status === "PAID")
    .reduce((acc, f) => acc + f.amount, 0);
  const outstandingBalance = totalFees - totalPaid;
  const isAllPaid = outstandingBalance === 0 && student.feePayments.length > 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              Student Finance & Clearance
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Examination & Academic Fee Clearance Desk
            </h1>
            <p className="text-sm text-slate-500">
              Clear outstanding examination dues instantly to release your authenticated QR hall ticket.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Semester Fees</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(totalFees)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tuition + Examination</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
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

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
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
                {isAllPaid ? "Zero Dues • Clearance Active" : "Action Required"}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Invoices & Payment Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Fee Invoices & Digital Payment Receipts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Online payments are processed securely with instant institutional reconciliation.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {student.feePayments.map((fee) => {
              const isPaid = fee.status === "PAID";
              return (
                <div
                  key={fee.id}
                  className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {fee.receiptNo || "INV-" + fee.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {isPaid ? "PAID & CLEARED" : "DUE FOR PAYMENT"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {fee.exam.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Semester examination fees and institutional lab infrastructure levies.
                    </p>

                    {isPaid && fee.transactionId && (
                      <p className="text-[11px] font-mono text-emerald-600 font-semibold">
                        Txn ID: {fee.transactionId} • Mode: {fee.paymentMethod || "UPI"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Amount</p>
                      <p className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(fee.amount)}
                      </p>
                    </div>

                    <FeePaymentAction paymentId={fee.id} isPaid={isPaid} amount={fee.amount} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
