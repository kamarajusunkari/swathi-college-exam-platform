import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHallTicketsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let hallTickets: any[] = [];
  try {
    const data = await serverFetch<{ hallTickets: any[] }>("/hall-tickets");
    hallTickets = data.hallTickets || [];
  } catch (err) {
    console.error("Failed to load hall tickets:", err);
  }

  const activeCount = hallTickets.filter((h) => h.status === "ACTIVE").length;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              Admit Card Verification & Issue Center
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Encrypted QR Hall Ticket Generation & Gate Clearance
            </h1>
            <p className="text-sm text-slate-500">
              Automated gatekeeper validating student enrollment, fee clearance, and cryptographically signed QR codes.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Hall Tickets</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{activeCount}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">Available for Download</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Centers</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Main Campus</h3>
              <p className="text-xs text-slate-500 mt-0.5">Biometric Gate Scanner Node</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Digital QR Signatures</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-0.5">{hallTickets.length}</h3>
              <p className="text-xs text-purple-600 font-medium mt-0.5">Cryptographically Signed</p>
            </div>
          </div>
        </div>

        {/* Hall Tickets Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                Issued Hall Tickets & Security QR Signatures
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every ticket contains an encrypted verification QR readable by center invigilator scanners.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Candidate & Roll No</th>
                  <th className="py-3 px-4">Examination Session</th>
                  <th className="py-3 px-4">Fee Clearance</th>
                  <th className="py-3 px-4">Center & Hall</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View Admit Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {hallTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No hall tickets generated yet.
                    </td>
                  </tr>
                ) : (
                  hallTickets.map((ht) => {
                    const isPaid = ht.student.feePayments.some((f) => f.status === "PAID");
                    return (
                      <tr key={ht.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                          {ht.hallTicketNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{ht.student.user.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {ht.student.rollNo} • {ht.student.class.name}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-slate-800 font-semibold">{ht.exam.title}</p>
                          <p className="text-[11px] text-slate-400">Subject: {ht.exam.subject.name}</p>
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
                          <p className="font-semibold text-slate-800">{ht.centerName}</p>
                          <p className="text-[10px] text-slate-400">{ht.roomNo} • Seat {ht.seatNo}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {ht.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/student/hall-tickets"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview Card
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
