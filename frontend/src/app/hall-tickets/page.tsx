"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function HallTicketsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>({
    hallTicketNumber: "HT-2026-1001-MTH",
    studentName: "Rahul Sharma",
    studentId: "SWC-2026-1001",
    rollNo: "261001",
    fatherName: "Sanjay Sharma",
    className: "Grade 10 (Secondary Division)",
    sectionName: "Section A",
    groupName: "Science (MPC)",
    academicYear: "2026–2027",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
    centerName: "Swathi College Main Examination Center — Block A",
    roomNo: "Hall 101",
    seatNo: "A-01",
    examTitle: "Mid-Term Mathematics Board Examination 2026",
    examCode: "EXAM-2026-MID-MTH",
    subjectName: "Mathematics - Pure & Applied (MTH-101)",
    examDate: "23 September 2026",
    examTime: "10:00 AM – 1:00 PM (3 Hours)",
    feeReceipt: "RCPT-2026-00412",
    verified: true,
  });

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
            Official Examination Hall Ticket & Admit Card
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generated automatically upon verified examination fee payment. Includes cryptographic QR code for exam hall gate verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Hall Ticket
          </button>
        </div>
      </div>

      {/* Official Hall Ticket Document Card (Print Optimized) */}
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
              {selectedStudent.hallTicketNumber}
            </p>
          </div>
        </div>

        {/* Candidate Information & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-3 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Candidate Name:</span>
              <strong className="text-sm font-semibold text-slate-900">{selectedStudent.studentName}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Roll Number:</span>
              <strong className="text-sm font-semibold font-mono text-indigo-700">{selectedStudent.rollNo}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Student ID / Admission No:</span>
              <strong className="text-slate-900 font-mono font-medium">{selectedStudent.studentId}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Father / Guardian:</span>
              <strong className="text-slate-900 font-medium">{selectedStudent.fatherName}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Class & Section:</span>
              <strong className="text-slate-900 font-medium">{selectedStudent.className} ({selectedStudent.sectionName})</strong>
            </div>

            <div>
              <span className="text-slate-500 font-normal block text-[11px]">Group / Stream:</span>
              <strong className="text-slate-900 font-medium">{selectedStudent.groupName}</strong>
            </div>
          </div>

          {/* Student Photo & Anti-Counterfeit Barcode */}
          <div className="flex flex-col items-center justify-center p-2 border border-slate-300 rounded-xl bg-slate-50 text-center space-y-2">
            <div className="h-28 w-24 rounded-lg bg-slate-200 border border-slate-400 overflow-hidden">
              <img
                src={selectedStudent.photoUrl}
                alt="Student Passport"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-600 font-mono">
              SEAL VERIFIED
            </span>
          </div>
        </div>

        {/* Examination Center & Timetable Schedule */}
        <div className="border border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex justify-between items-center text-xs font-bold text-slate-800">
            <span>EXAMINATION TIMETABLE & SEATING ALLOCATION</span>
            <span className="text-emerald-700">FEE STATUS: PAID ({selectedStudent.feeReceipt})</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
              <tr>
                <th className="py-2.5 px-3">Subject & Code</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Timings</th>
                <th className="py-2.5 px-3">Center & Hall</th>
                <th className="py-2.5 px-3">Assigned Seat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              <tr>
                <td className="py-3 px-3 font-bold">
                  {selectedStudent.subjectName}
                  <span className="block text-[11px] font-normal text-slate-600 font-mono">
                    {selectedStudent.examCode}
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold">{selectedStudent.examDate}</td>
                <td className="py-3 px-3">{selectedStudent.examTime}</td>
                <td className="py-3 px-3">
                  {selectedStudent.centerName}
                  <span className="block text-[11px] font-semibold text-indigo-700">{selectedStudent.roomNo}</span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                  {selectedStudent.seatNo}
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
              {/* Simulated High Density Security QR Code */}
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
              M. Venkat Rao
            </div>
            <span className="font-medium text-[11px]">Controller of Examinations</span>
          </div>

          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-36 mb-1 flex items-end justify-center font-serif text-[11px] italic font-bold text-slate-800">
              Dr. K. S. Narayana
            </div>
            <span className="font-medium text-[11px]">Principal / Chief Superintendent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
