import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HallTicketCard } from "./HallTicketCard";
import QRCode from "qrcode";
import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentHallTicketsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  const res = await serverFetch<{ student: any }>("/users/student/hall-tickets", {
    fallback: { student: null },
  });
  const student = res.student;

  if (!student) {
    redirect("/login");
  }

  const latestHallTicket = student.hallTickets[0];
  const isFeePaid = student.feePayments.some((f) => f.status === "PAID");

  // Generate real QR code data URL
  let qrCodeDataUrl = "";
  if (latestHallTicket) {
    const payload = JSON.stringify({
      institution: "Swathi College Examination Cell",
      ticketNumber: latestHallTicket.hallTicketNumber,
      rollNo: student.rollNo,
      candidate: student.user.name,
      class: student.class.name,
      verified: true,
      timestamp: new Date().toISOString(),
    });
    qrCodeDataUrl = await QRCode.toDataURL(payload, { width: 220, margin: 1 });
  }

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

        {!latestHallTicket || latestHallTicket.status !== "ACTIVE" ? (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-base font-bold text-amber-900">
                Hall Ticket Held Pending Clearance
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your examination hall ticket is currently blocked due to pending semester fee clearance or attendance shortage. Please clear your institutional dues to immediately release your admit card.
              </p>
              <Link
                href="/student/fees"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Clear Outstanding Fees
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
