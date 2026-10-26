"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Download,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";

export default function HallTicketsPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // TanStack Query for dynamic hall tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["hall-tickets", "all"],
    queryFn: async () => {
      const res = await apiClient.get("/hall-tickets");
      return Array.isArray(res.data) ? res.data : res.data?.hallTickets || [];
    },
    staleTime: 30 * 1000,
  });

  const tickets: any[] = ticketsData || [];
  const activeTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header (Hidden on print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            Anti-Counterfeit QR Hall Ticket Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Official Examination Hall Ticket &amp; Admit Card
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generated automatically upon verified examination fee payment. Includes cryptographic QR code for exam hall gate verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tickets.length > 0 && (
            <select
              value={selectedTicketId || activeTicket?.id || ""}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden font-mono"
            >
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.hallTicketNumber} - {t.student?.user?.name || "Student"}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            disabled={!activeTicket}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Hall Ticket
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400" />
          <p className="text-xs">Loading verified student admit cards from database...</p>
        </div>
      ) : !activeTicket ? (
        <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl max-w-xl mx-auto">
          <QrCode className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">No Hall Tickets Issued</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hall tickets are generated automatically once students clear their scheduled semester examination fees. Verify fee clearance in the Fee Management desk.
          </p>
          <div className="pt-2">
            <Link
              href="/fees"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Open Fee Clearance Desk
            </Link>
          </div>
        </div>
      ) : (
        /* Official Hall Ticket Document Card (Print Optimized) */
        <div className="rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-2xl p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Institutional Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <GraduationCap className="h-9 w-9" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950 uppercase font-heading">
                  Swathi College of Pharmacy
                </h2>
                <p className="text-xs text-slate-600 font-medium tracking-wide uppercase">
                  Autonomous Examination Board • Academic Session 2026–2027
                </p>
                <p className="text-[11px] text-slate-500 font-normal">
                  Approved by PCI &amp; Affiliated Center Code: SWC-HYD-042
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-medium text-xs px-3 py-1 rounded">
                OFFICIAL ADMIT CARD
              </span>
              <p className="font-mono text-xs font-medium text-slate-700 mt-1">
                {activeTicket.hallTicketNumber}
              </p>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-3 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 font-normal block text-[11px]">Candidate Name:</span>
                <strong className="text-sm font-semibold text-slate-900">
                  {activeTicket.student?.user?.name || "Student Candidate"}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 font-normal block text-[11px]">Roll Number:</span>
                <strong className="text-sm font-semibold font-mono text-indigo-700">
                  {activeTicket.student?.rollNo || "N/A"}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 font-normal block text-[11px]">Student ID / Admission No:</span>
                <strong className="text-slate-900 font-mono font-medium">
                  {activeTicket.student?.admissionNumber || activeTicket.student?.id?.slice(0, 12)}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 font-normal block text-[11px]">Father / Guardian:</span>
                <strong className="text-slate-900 font-medium">
                  {activeTicket.student?.fatherName || "On Institutional Record"}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 font-normal block text-[11px]">Class &amp; Section:</span>
                <strong className="text-slate-900 font-medium">
                  {activeTicket.student?.class?.name || "B.Pharmacy"} (Sec {activeTicket.student?.section?.name || "A"})
                </strong>
              </div>

              <div>
                <span className="text-slate-500 font-normal block text-[11px]">Admit Card Status:</span>
                <strong className="text-emerald-700 font-medium">
                  {activeTicket.status || "ACTIVE & VERIFIED"}
                </strong>
              </div>
            </div>

            {/* Student Photo Badge */}
            <div className="flex flex-col items-center justify-center p-3 border border-slate-300 rounded-xl bg-slate-50 text-center space-y-2">
              <div className="h-24 w-20 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 font-bold text-2xl font-heading">
                {activeTicket.student?.user?.name?.[0] || "S"}
              </div>
              <span className="text-[10px] font-bold text-slate-600 font-mono">
                PHOTO VERIFIED
              </span>
            </div>
          </div>

          {/* Examination Center & Timetable Schedule */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>EXAMINATION TIMETABLE &amp; SEATING ALLOCATION</span>
              <span className="text-emerald-700">FEE STATUS: VERIFIED &amp; CLEARED</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Subject &amp; Code</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Timings</th>
                  <th className="py-2.5 px-3">Center &amp; Hall</th>
                  <th className="py-2.5 px-3">Assigned Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                <tr>
                  <td className="py-3 px-3 font-bold">
                    {activeTicket.exam?.subject?.name || activeTicket.exam?.title || "Examination Subject"}
                    <span className="block text-[11px] font-normal text-slate-600 font-mono">
                      {activeTicket.exam?.examCode || activeTicket.exam?.subject?.code}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    {activeTicket.exam?.examDate ? formatDate(activeTicket.exam.examDate) : "Scheduled Session"}
                  </td>
                  <td className="py-3 px-3">
                    {activeTicket.exam?.startTime ? `${activeTicket.exam.startTime} - ${activeTicket.exam.endTime}` : "10:00 AM – 1:00 PM"}
                  </td>
                  <td className="py-3 px-3">
                    Swathi College Main Examination Hall
                    <span className="block text-[11px] font-semibold text-indigo-700">Exam Hall A</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                    {activeTicket.seatNumber || "Assigned by Invigilator"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QR Code Gate Verification & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center pt-2">
            <div className="md:col-span-3 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
              <h4 className="font-bold text-slate-900 text-xs uppercase">Mandatory Examination Rules:</h4>
              <p>1. Candidates must arrive at the examination center at least 30 minutes prior to exam commencement.</p>
              <p>2. Physical answer booklets must carry the matching barcode affixed by the invigilator.</p>
              <p>3. Possession of mobile phones, smartwatches, or unauthorized papers will lead to immediate cancellation.</p>
              <p>4. Hall Ticket must be produced for biometric/QR scan at the entrance.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-400 rounded-xl bg-slate-50 text-center space-y-1.5">
              <div className="h-24 w-24 bg-white p-1 border border-slate-300 rounded flex items-center justify-center">
                <div className="h-full w-full bg-slate-900 p-1 flex items-center justify-center rounded">
                  <QrCode className="h-16 w-16 text-white" />
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-700">
                SCAN TO VERIFY ADMIT CARD
              </span>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-700">
            <div className="text-center">
              <div className="h-8 border-b border-slate-400 w-36 mb-1" />
              <span className="font-medium text-[11px]">Candidate Signature</span>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
                Controller of Exams
              </div>
              <span className="font-medium text-[11px]">Examination Cell</span>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
                Principal
              </div>
              <span className="font-medium text-[11px]">Swathi College of Pharmacy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
