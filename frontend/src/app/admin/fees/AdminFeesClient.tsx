"use client";

import React, { useMemo } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Receipt,
  Trash2,
  Search,
  Filter,
  Eye,
  Printer,
  X,
  Building,
  GraduationCap,
} from "lucide-react";
import { formatDateTime, formatCurrency, formatDate } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { toast } from "sonner";
import { useFees, useDeleteFeeMutation } from "@/features/fees/fees.queries";
import { useFeesStore } from "@/stores/fees.store";

interface Props {
  fees: any[];
}

export function AdminFeesClient({ fees: initialFees }: Props) {
  // --- TanStack Queries & Mutations ---
  const { data: rawFees = initialFees } = useFees(initialFees);
  const deleteFeeMutation = useDeleteFeeMutation();

  const fees: any[] = useMemo(() => {
    return Array.isArray(rawFees) ? rawFees : rawFees?.fees || initialFees || [];
  }, [rawFees, initialFees]);

  // --- Zustand Store ---
  const {
    searchQuery,
    statusFilter,
    selectedReceipt,
    deleteTarget,
    setSearchQuery,
    setStatusFilter,
    setSelectedReceipt,
    setDeleteTarget,
    resetFilters,
  } = useFeesStore();

  // Metrics
  const totalCollected = useMemo(() => {
    return fees
      .filter((f) => f.status === "PAID")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [fees]);

  const totalPending = useMemo(() => {
    return fees
      .filter((f) => f.status === "UNPAID" || f.status === "PENDING" || f.status === "DUE")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [fees]);

  const paidCount = useMemo(() => {
    return fees.filter((f) => f.status === "PAID").length;
  }, [fees]);

  const pendingCount = useMemo(() => {
    return fees.filter((f) => f.status === "UNPAID" || f.status === "PENDING" || f.status === "DUE").length;
  }, [fees]);

  // Filtered List
  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      // Status filter
      if (statusFilter === "PAID" && f.status !== "PAID") return false;
      if (
        (statusFilter === "PENDING" || statusFilter === "UNPAID") &&
        f.status === "PAID"
      )
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.student?.user?.name?.toLowerCase().includes(q);
        const matchesRoll = f.student?.rollNo?.toLowerCase().includes(q);
        const matchesReceipt = f.receiptNo?.toLowerCase().includes(q);
        const matchesTxn = f.transactionId?.toLowerCase().includes(q);
        const matchesExam = f.exam?.title?.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesReceipt && !matchesTxn && !matchesExam) {
          return false;
        }
      }

      return true;
    });
  }, [fees, statusFilter, searchQuery]);

  const handleDeleteFee = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeeMutation.mutateAsync(deleteTarget.id);
      toast.success("Fee record voided and revoked from registry");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to delete fee record");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            Bursar &amp; Examination Fee Ledger
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 font-heading">
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
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
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
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2 font-mono">
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
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">{paidCount}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Hall Ticket Eligible</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collection Rate</p>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {fees.length > 0 ? Math.round((paidCount / fees.length) * 100) : 0}%
          </h3>
          <p className="text-xs text-slate-500 mt-1">Institutional Clearance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, roll no, receipt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({fees.length})
            </button>
            <button
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "PAID" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paid ({paidCount})
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "PENDING" ? "bg-white text-rose-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>

          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-heading">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Student Fee Accounts &amp; Audit Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every transaction generates an irrevocable digital receipt and updates hall ticket gate conditions.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            Showing {filteredFees.length} of {fees.length} records
          </span>
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
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No fee records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const isPaid = fee.status === "PAID";
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <button
                          onClick={() => setSelectedReceipt(fee)}
                          className="font-bold text-indigo-600 hover:underline cursor-pointer text-xs flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          {fee.receiptNo || "UNPAID-INV"}
                        </button>
                        {fee.transactionId && (
                          <p className="text-[10px] text-slate-400">{fee.transactionId}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{fee.student?.user?.name || "Student"}</p>
                        <p className="text-[11px] font-mono text-slate-500">{fee.student?.rollNo || "ROLL-NO"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-700">{fee.student?.class?.name || "B.Pharm"}</p>
                        <p className="text-[10px] text-slate-400">Sec {fee.student?.section?.name || "A"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {fee.exam?.title || "Semester Examination"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm font-mono">
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
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid && (
                            <button
                              onClick={() => setSelectedReceipt(fee)}
                              title="View & Print Official Receipt"
                              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 shadow-2xs transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: fee.id,
                                name: `Receipt ${fee.receiptNo || fee.id.slice(0, 8)} (${fee.student?.user?.name || "Student"})`,
                              })
                            }
                            title={`Delete fee receipt ${fee.receiptNo || fee.id}`}
                            className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Fee Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-overlay z-50">
          <div className="modal-box max-w-lg p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Institutional Fee Voucher</h3>
                  <p className="text-[11px] text-indigo-200 font-mono">
                    Receipt #{selectedReceipt.receiptNo || "PENDING"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-600">
              <div className="text-center pb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">Swathi College of Pharmacy</h4>
                <p className="text-[11px] text-slate-400">Official Bursar Office & Examination Accounts Desk</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Candidate Name</span>
                  <p className="font-bold text-slate-900 text-xs">{selectedReceipt.student?.user?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Roll / Register No</span>
                  <p className="font-mono font-bold text-slate-900 text-xs">{selectedReceipt.student?.rollNo}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Class</span>
                  <p className="font-semibold text-xs">{selectedReceipt.student?.class?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Fee Purpose</span>
                  <p className="font-semibold text-xs">{selectedReceipt.exam?.title || "Examination Assessment"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Transaction Reference</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.transactionId || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Payment Gateway / Mode</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod || "UPI"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Paid Timestamp</span>
                  <span className="font-medium text-slate-800">
                    {selectedReceipt.paidAt ? formatDateTime(selectedReceipt.paidAt) : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-slate-900 bg-emerald-50/60 px-3 rounded-lg border border-emerald-200/80">
                  <span className="text-emerald-800">Total Cleared Amount</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(selectedReceipt.amount)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center italic">
                * This document serves as automated proof of payment for Admit Card / Hall Ticket biometric release.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="btn-outline btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteFee}
          title="Delete Fee Record"
          description={`Are you sure you want to permanently delete and void ${deleteTarget?.name}? This will revoke examination fee clearance for this candidate.`}
          itemIdentifier={deleteTarget?.name || ""}
          deleteUrl={`/api/fees/${deleteTarget.id}`}
        />
      )}
    </div>
  );
}
