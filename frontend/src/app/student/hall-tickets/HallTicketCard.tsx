"use client";

import React from "react";
import {
  Printer,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  student: {
    studentId: string;
    rollNo: string;
    user: { name: string; email: string };
    class: { name: string };
    section?: { name: string } | null;
    academicYear: { name: string };
  };
  hallTicket: {
    hallTicketNumber: string;
    centerName: string;
    roomNo?: string | null;
    seatNo?: string | null;
    status: string;
    exam: {
      title: string;
      examCode: string;
      examDate: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      maxMarks: number;
      subject: { name: string; code: string };
    };
  };
  qrCodeDataUrl: string;
}

export function HallTicketCard({ student, hallTicket, qrCodeDataUrl }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Clearance Verified • Eligible for Examination
          </span>
        </div>

        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Official Hall Ticket Document Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center relative">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight leading-tight">
                Swathi College of Engineering & Technology
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Autonomous Institution • Affiliated to State Technological University
              </p>
              <p className="text-[11px] text-slate-500">
                Examination Cell, Main Campus • Academic Session {student.academicYear.name}
              </p>
            </div>
          </div>

          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-bold tracking-wider uppercase">
            Official Examination Hall Ticket / Admit Card
          </div>
        </div>

        {/* Candidate Credentials & QR Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Details (3 cols) */}
          <div className="md:col-span-3 grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Candidate Name</span>
              <p className="text-sm font-bold text-slate-900">{student.user.name}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">University Roll Number</span>
              <p className="text-sm font-mono font-extrabold text-indigo-700">{student.rollNo}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Program & Section</span>
              <p className="font-semibold text-slate-800">{student.class.name} (Sec {student.section?.name || "A"})</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Hall Ticket Number</span>
              <p className="font-mono font-bold text-slate-800">{hallTicket.hallTicketNumber}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Examination Session</span>
              <p className="font-semibold text-slate-800">{hallTicket.exam.title}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Examination Center</span>
              <p className="font-semibold text-slate-800">{hallTicket.centerName}</p>
            </div>
          </div>

          {/* QR Verification Block (1 col) */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Encrypted Hall Ticket QR"
                className="w-28 h-28 object-contain"
              />
            ) : (
              <div className="w-28 h-28 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] font-mono">
                QR CODE
              </div>
            )}
            <p className="text-[9px] font-mono text-slate-500 mt-1 font-semibold">
              Scan to Authenticate
            </p>
          </div>
        </div>

        {/* Examination Schedule Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Approved Examination Timetable
          </h3>

          <div className="overflow-x-auto border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Subject Code</th>
                  <th className="py-2.5 px-3">Subject Title</th>
                  <th className="py-2.5 px-3">Date & Timings</th>
                  <th className="py-2.5 px-3">Max Marks</th>
                  <th className="py-2.5 px-3 text-right">Invigilator Sign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-indigo-700">{hallTicket.exam.subject.code}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{hallTicket.exam.subject.name}</td>
                  <td className="py-2 px-3 text-slate-600">
                    {formatDate(hallTicket.exam.examDate)} ({hallTicket.exam.startTime} – {hallTicket.exam.endTime})
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{hallTicket.exam.maxMarks}</td>
                  <td className="py-2 px-3 text-right text-slate-300 font-mono text-[10px]">
                    __________________
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Rules & Authorization Signatures */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-end text-xs">
          <div className="space-y-1 text-slate-500 text-[10px] leading-relaxed">
            <p className="font-bold text-slate-700">Important Instructions to Candidate:</p>
            <p>1. Candidates must arrive at the examination hall 30 minutes prior to commencement.</p>
            <p>2. Electronic gadgets, smart watches, and programmable calculators are strictly prohibited.</p>
            <p>3. This admit card must be preserved until final semester grade cards are issued.</p>
          </div>

          <div className="flex justify-between items-center text-center pt-6">
            <div>
              <div className="w-32 border-b border-slate-400 mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold">Candidate Signature</span>
            </div>

            <div>
              <div className="w-36 border-b-2 border-slate-900 mb-1 font-serif text-xs font-bold text-indigo-900">
                Dr. K. S. Narayana
              </div>
              <span className="text-[10px] text-slate-700 font-bold">Controller of Examinations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
