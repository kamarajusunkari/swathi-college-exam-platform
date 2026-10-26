"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HallTicketCard } from "./HallTicketCard";
import QRCode from "qrcode";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";

export default function StudentHallTicketsPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["student", "hall-tickets"],
    queryFn: async () => {
      const res = await apiClient.get("/users/student/hall-tickets");
      return res.data || { student: null };
    },
    staleTime: 30 * 1000,
  });

  const student = data?.student;
  const hallTickets: any[] = student?.hallTickets || [];
  const latestHallTicket = hallTickets[0];
  const feePayments: any[] = student?.feePayments || [];

  const isFeePaid = latestHallTicket
    ? feePayments.some((f: any) => f.examId === latestHallTicket.examId && f.status === "PAID")
    : feePayments.some((f: any) => f.status === "PAID");

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (latestHallTicket && student) {
      const payload = JSON.stringify({
        institution: "Swathi College Examination Cell",
        ticketNumber: latestHallTicket.hallTicketNumber,
        rollNo: student.rollNo,
        candidate: student.user?.name || user?.name,
        class: student.class?.name,
        verified: true,
        timestamp: new Date().toISOString(),
      });
      QRCode.toDataURL(payload, { width: 220, margin: 1 }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [latestHallTicket, student, user]);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Examination Admit Card
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Official Encrypted QR Hall Ticket
            </h1>
            <p className="text-sm text-slate-500">
              Present this verified digital / printed hall ticket at the examination center for biometric entry.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-xs">Loading authorized hall ticket...</span>
          </div>
        ) : !latestHallTicket ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No Active Hall Ticket Generated
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The Examination Cell has not yet generated hall tickets for your active class semester exams. Hall tickets are automatically released 72 hours prior to scheduled exam dates once fee clearance is reconciled.
              </p>
            </div>
          </div>
        ) : !isFeePaid ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Hall Ticket Locked — Pending Fee Clearance
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your examination dues have not been reconciled in the financial ledger. Please clear your examination fee to instantly release your QR admit card.
              </p>
            </div>
            <div>
              <Link
                href="/student/fees"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Clear Outstanding Fees →
              </Link>
            </div>
          </div>
        ) : (
          <HallTicketCard
            student={student as any}
            hallTicket={latestHallTicket as any}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
