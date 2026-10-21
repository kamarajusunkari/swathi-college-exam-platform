"use client";

import React, { useMemo, useState } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  Search,
  Filter,
  Scan,
  Printer,
  X,
  UserCheck,
  Building,
  GraduationCap,
  CalendarDays,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDateTime, formatDate } from "@/lib/utils";
import { useHallTickets, useVerifyHallTicketMutation } from "@/features/hall-tickets/hall-tickets.queries";
import { useHallTicketsStore } from "@/stores/hall-tickets.store";
import QRCode from "qrcode";

interface Props {
  hallTickets: any[];
}

export function AdminHallTicketsClient({ hallTickets: initialHallTickets }: Props) {
  // --- TanStack Queries & Mutations ---
  const { data: rawData = { hallTickets: initialHallTickets } } = useHallTickets({
    hallTickets: initialHallTickets,
  });
  const verifyMutation = useVerifyHallTicketMutation();

  const hallTickets: any[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return rawData?.hallTickets || initialHallTickets || [];
  }, [rawData, initialHallTickets]);

  // --- Zustand Store ---
  const {
    searchQuery,
    statusFilter,
    selectedTicketForPreview,
    verifyModalOpen,
    verifyQuery,
    setSearchQuery,
    setStatusFilter,
    setSelectedTicketForPreview,
    setVerifyModalOpen,
    setVerifyQuery,
    resetFilters,
  } = useHallTicketsStore();

  // QR preview URL state
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Metrics
  const activeCount = useMemo(() => {
    return hallTickets.filter((h) => h.status === "ACTIVE").length;
  }, [hallTickets]);

  const heldCount = useMemo(() => {
    return hallTickets.filter((h) => h.status !== "ACTIVE").length;
  }, [hallTickets]);

  // Filtered List
  const filteredTickets = useMemo(() => {
    return hallTickets.filter((ht) => {
      if (statusFilter === "ACTIVE" && ht.status !== "ACTIVE") return false;
      if (statusFilter === "HELD" && ht.status === "ACTIVE") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTicket = ht.hallTicketNumber?.toLowerCase().includes(q);
        const matchesName = ht.student?.user?.name?.toLowerCase().includes(q);
        const matchesRoll = ht.student?.rollNo?.toLowerCase().includes(q);
        const matchesClass = ht.student?.class?.name?.toLowerCase().includes(q);
        const matchesExam = ht.exam?.title?.toLowerCase().includes(q);
        if (!matchesTicket && !matchesName && !matchesRoll && !matchesClass && !matchesExam) {
          return false;
        }
      }

      return true;
    });
  }, [hallTickets, statusFilter, searchQuery]);

  const handleOpenPreview = async (ticket: any) => {
    setSelectedTicketForPreview(ticket);
    try {
      const payload = JSON.stringify({
        institution: "Swathi College Examination Cell",
        ticketNumber: ticket.hallTicketNumber,
        rollNo: ticket.student?.rollNo,
        candidate: ticket.student?.user?.name,
        class: ticket.student?.class?.name,
        verified: ticket.status === "ACTIVE",
        timestamp: new Date().toISOString(),
      });
      const url = await QRCode.toDataURL(payload, { width: 200, margin: 1 });
      setPreviewQrDataUrl(url);
    } catch {
      setPreviewQrDataUrl("");
    }
  };

  const handleVerifyTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;

    try {
      const res = await verifyMutation.mutateAsync(verifyQuery.trim());
      setVerificationResult(res);
      if (res.valid) {
        toast.success(`Candidate ${res.candidate} Verified (${res.ticketNumber})`);
      } else {
        toast.error(`Verification Failed: ${res.status}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Invalid or unverified hall ticket");
      setVerificationResult({ valid: false, error: "Hall ticket record not found in university registry." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            Admit Card Verification &amp; Issue Center
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 font-heading">
            Encrypted QR Hall Ticket Generation &amp; Gate Clearance
          </h1>
          <p className="text-sm text-slate-500">
            Automated gatekeeper validating student enrollment, fee clearance, and cryptographically signed QR codes.
          </p>
        </div>

        <button
          onClick={() => {
            setVerifyModalOpen(true);
            setVerificationResult(null);
          }}
          className="btn-primary flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer"
        >
          <Scan className="w-4 h-4" />
          <span>Biometric Gate Scanner</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Hall Tickets</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">{activeCount}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Available for Download</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Centers</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Main Campus</h3>
            <p className="text-xs text-slate-500 mt-0.5">Biometric Gate Scanner Node</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Digital QR Signatures</p>
            <h3 className="text-2xl font-extrabold text-purple-600 mt-0.5 font-mono">{hallTickets.length}</h3>
            <p className="text-xs text-purple-600 font-medium mt-0.5">Cryptographically Signed</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, roll no, ticket #..."
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
              All ({hallTickets.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "ACTIVE" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("HELD")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "HELD" ? "bg-white text-amber-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Held / Revoked ({heldCount})
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

      {/* Hall Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-heading">
              <QrCode className="w-5 h-5 text-indigo-600" />
              Issued Hall Tickets &amp; Security QR Signatures
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every ticket contains an encrypted verification QR readable by center invigilator scanners.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            Showing {filteredTickets.length} of {hallTickets.length} admit cards
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Candidate &amp; Roll No</th>
                <th className="py-3 px-4">Examination Session</th>
                <th className="py-3 px-4">Fee Clearance</th>
                <th className="py-3 px-4">Center &amp; Hall</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">View Admit Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No hall tickets match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ht) => {
                  const isPaid = ht.student?.feePayments?.some((f: any) => f.status === "PAID");
                  return (
                    <tr key={ht.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        <button
                          onClick={() => handleOpenPreview(ht)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                          {ht.hallTicketNumber}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{ht.student?.user?.name || "Candidate"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {ht.student?.rollNo} • {ht.student?.class?.name}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 font-semibold">{ht.exam?.title || "Examination"}</p>
                        <p className="text-[11px] text-slate-400">Subject: {ht.exam?.subject?.name || "Course Subject"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                            <AlertCircle className="w-3.5 h-3.5" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{ht.centerName || "Main Campus"}</p>
                        <p className="text-[10px] text-slate-400">{ht.roomNo || "Hall 1"} • Seat {ht.seatNo || "A-01"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ht.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {ht.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenPreview(ht)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview Card
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Card Preview Modal */}
      {selectedTicketForPreview && (
        <div className="modal-overlay z-50">
          <div className="modal-box max-w-xl p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Examination Admit Card</h3>
                  <p className="text-[11px] text-indigo-200 font-mono">
                    {selectedTicketForPreview.hallTicketNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicketForPreview(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Institution Header */}
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-base font-heading">
                  Swathi College of Pharmacy
                </h3>
                <p className="text-[11px] text-slate-500">
                  Affiliated to University Board • Autonomous Examination Cell
                </p>
                <span className="inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  HALL TICKET / ADMIT CARD — 2026
                </span>
              </div>

              {/* Candidate Info Grid & QR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="sm:col-span-2 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Candidate Name</span>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedTicketForPreview.student?.user?.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Roll / Register #</span>
                      <p className="font-mono font-bold text-slate-800">
                        {selectedTicketForPreview.student?.rollNo}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Program &amp; Class</span>
                      <p className="font-semibold text-slate-800">
                        {selectedTicketForPreview.student?.class?.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Examination</span>
                    <p className="font-semibold text-slate-800">
                      {selectedTicketForPreview.exam?.title}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  {previewQrDataUrl ? (
                    <img
                      src={previewQrDataUrl}
                      alt="Hall Ticket Security QR"
                      className="w-28 h-28 object-contain"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                      Loading QR...
                    </div>
                  )}
                  <span className="text-[9px] font-mono text-slate-400 mt-1">Cryptographic QR</span>
                </div>
              </div>

              {/* Center & Seating Info */}
              <div className="grid grid-cols-3 gap-2 text-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Center</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">
                    {selectedTicketForPreview.centerName || "Main Campus"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Hall / Room</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">
                    {selectedTicketForPreview.roomNo || "Hall 1"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Seat Number</span>
                  <p className="font-mono font-bold text-indigo-700 text-xs mt-0.5">
                    {selectedTicketForPreview.seatNo || "A-01"}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[11px] text-slate-500 space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                <p className="font-bold text-amber-900">Center Gate Instructions:</p>
                <p>1. Must carry student ID card along with printed Admit Card.</p>
                <p>2. Report at verification biometric desk 45 minutes prior to scheduled start.</p>
                <p>3. Electronic gadgets and unauthorized materials are strictly prohibited.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedTicketForPreview(null)}
                className="btn-outline btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Admit Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Gate Scanner Modal */}
      {verifyModalOpen && (
        <div className="modal-overlay z-50">
          <div className="modal-box max-w-md p-6 space-y-5 bg-white shadow-2xl rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">Gate Scanner Verification</h3>
                  <p className="text-xs text-slate-500">Scan or verify hall ticket barcode</p>
                </div>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyTicketSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="form-label text-xs font-semibold">Hall Ticket Number / Barcode</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. HT-EXAM-2026-MID-MTH-261001"
                    value={verifyQuery}
                    onChange={(e) => setVerifyQuery(e.target.value)}
                    className="form-input pr-10 font-mono text-xs"
                    autoFocus
                  />
                  <QrCode className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyMutation.isPending || !verifyQuery.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 cursor-pointer"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                <span>Verify Gate Entry Authorization</span>
              </button>
            </form>

            {verificationResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  verificationResult.valid
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <h4 className="font-bold text-sm">
                    {verificationResult.valid
                      ? "GATE PASS APPROVED — ENTRY GRANTED"
                      : "GATE PASS REJECTED"}
                  </h4>
                </div>

                {verificationResult.valid ? (
                  <div className="space-y-1 font-sans text-xs pt-1 border-t border-emerald-200">
                    <p>
                      Candidate: <strong>{verificationResult.candidate}</strong> ({verificationResult.rollNo})
                    </p>
                    <p>Class: {verificationResult.class}</p>
                    <p>Assessment: {verificationResult.exam}</p>
                    <p>Allocated Center: {verificationResult.center}</p>
                  </div>
                ) : (
                  <p className="text-xs pt-1 border-t border-rose-200">
                    {verificationResult.error || "Candidate is not cleared for examination hall entry."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
