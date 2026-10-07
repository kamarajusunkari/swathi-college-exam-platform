"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ShieldCheck,
  FileText,
  Lock,
  Unlock,
  Building,
  GraduationCap,
  Plus,
  UploadCloud,
  Bot,
  Sparkles,
  Key,
  Eye,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import UploadZone from "@/components/evaluation/UploadZone";
import AiKeyPickerModal from "@/components/evaluation/AiKeyPickerModal";
import AdminPaperInspectModal from "@/components/evaluation/AdminPaperInspectModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  exams: any[];
  papers: any[];
  academicYears: any[];
  classes: any[];
}

export function AdminExamsClient({ exams: initialExams, papers, academicYears, classes }: Props) {
  const router = useRouter();
  const [exams, setExams] = useState(initialExams);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const [paperVaultList, setPaperVaultList] = useState(papers);
  const [selectedExamForInspect, setSelectedExamForInspect] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const ongoingCount = exams.filter((e) => e.status === "ACTIVE" || e.status === "UPCOMING").length;
  const releasedPapersCount = paperVaultList.filter((p) => p.isReleased || p.status === "RELEASED").length;
  const pendingVaultCount = paperVaultList.filter((p) => !p.isReleased).length;

  const handleToggleRelease = (paperId: string, currentReleased: boolean) => {
    setPaperVaultList((prev) =>
      prev.map((p) => (p.id === paperId ? { ...p, isReleased: !currentReleased } : p))
    );
    setExams((prev) =>
      prev.map((e) => {
        const hasPaper = e.papers?.some((p: any) => p.id === paperId);
        if (hasPaper || e.id === paperId) {
          return {
            ...e,
            releaseStatus: !currentReleased ? "RELEASED" : "SCHEDULED",
            status: !currentReleased ? "ACTIVE" : "UPCOMING",
          };
        }
        return e;
      })
    );
    toast.success(
      !currentReleased
        ? "Question Paper released to examination center nodes!"
        : "Question paper locked back into encrypted vault."
    );
  };

  const handleExamUpdated = (updatedExam: any) => {
    setExams((prev) =>
      prev.map((e) => (e.id === updatedExam.id ? { ...e, ...updatedExam } : e))
    );
    if (updatedExam.papers?.[0]) {
      const updatedPaper = updatedExam.papers[0];
      setPaperVaultList((prev) =>
        prev.map((p) => (p.id === updatedPaper.id || p.examId === updatedExam.id ? { ...p, ...updatedPaper } : p))
      );
    }
    setSelectedExamForInspect(updatedExam);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#ff5722] uppercase tracking-wider font-mono">
            <CalendarDays className="w-4 h-4" />
            Examination Control Center
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight mt-1 font-heading">
            Examination Schedules &amp; Secure Paper Vault
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Manage institution examination timelines, 2-hour encrypted paper release, and center rosters.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAiKeyModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-normal flex items-center gap-1.5 transition cursor-pointer"
          >
            <Bot className="w-4 h-4 text-purple-600" />
            AI Keys (BYOK)
          </button>

          <button
            onClick={() => setShowUploadZone(true)}
            className="btn-outline btn-sm"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            Upload Scans / Bundle
          </button>

          <Link
            href="/admin/exams/create"
            className="btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule &amp; Create Exam
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-slate-100 text-slate-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{ongoingCount}</p>
            <p className="kpi-label">Active Examinations</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-emerald-700">{releasedPapersCount}</p>
            <p className="kpi-label">Papers Released</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-50 text-amber-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-amber-700">{pendingVaultCount}</p>
            <p className="kpi-label">Locked in Vault</p>
          </div>
        </div>
      </div>

      {/* Examination Schedules Table */}
      <div className="data-container">
        <div className="data-header">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800 font-heading">
              Active Examinations &amp; Encrypted Paper Vault
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Automated 2-Hour Release Countdown and Center Dispatch Hub
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono font-normal">
            {exams.length} Examination Timetables
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50/80 text-slate-400 font-normal border-b border-slate-100">
              <tr>
                <th className="table-th">Subject Code &amp; Title</th>
                <th className="table-th">Class / Cohort</th>
                <th className="table-th">Exam Date &amp; Time</th>
                <th className="table-th">Author / Created By</th>
                <th className="table-th">Max Marks</th>
                <th className="table-th">Vault Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => {
                const paper = paperVaultList.find((p) => p.examId === exam.id) || exam.papers?.[0];
                const isReleased = paper?.isReleased || paper?.status === "RELEASED" || exam.releaseStatus === "RELEASED";
                const uploader = paper?.uploadedBy;
                const isTeacher = uploader?.role === "TEACHER";

                return (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition">
                    <td className="table-td">
                      <div className="font-medium text-slate-800">{exam.subject?.name || exam.title}</div>
                      <div className="font-mono text-[11px] text-[#ff5722] mt-0.5 font-medium">
                        {exam.examCode} • {exam.subject?.code}
                      </div>
                    </td>

                    <td className="table-td">
                      <span className="font-medium text-slate-700">{exam.class?.name}</span>
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {exam.academicYear?.name}
                      </span>
                    </td>

                    <td className="table-td">
                      <div className="font-medium text-slate-800 font-mono">
                        {formatDate(exam.examDate)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono font-normal">{exam.durationMinutes} Mins ({exam.startTime} – {exam.endTime})</div>
                    </td>

                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">
                          {uploader?.name || "Admin Office"}
                        </span>
                        {isTeacher && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 font-mono">
                            FACULTY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {uploader?.email || "Controller of Exams"}
                      </span>
                    </td>

                    <td className="table-td font-mono font-medium text-slate-800">
                      {exam.maxMarks} Marks
                    </td>

                    <td className="table-td">
                      {isReleased ? (
                        <span className="badge-emerald font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Released
                        </span>
                      ) : (
                        <span className="badge-amber font-mono">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          2-Hr Encrypted
                        </span>
                      )}
                    </td>

                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedExamForInspect(exam)}
                          className="btn-outline btn-sm inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 hover:border-indigo-300"
                          title="Inspect question paper, rubrics, and modify blueprint"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Inspect &amp; Edit</span>
                        </button>

                        <button
                          onClick={() => handleToggleRelease(paper?.id || exam.id, isReleased)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            isReleased
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : "btn-primary btn-sm"
                          }`}
                        >
                          {isReleased ? "Lock Vault" : "Release Paper"}
                        </button>

                        <button
                          onClick={() => setDeleteTarget(exam)}
                          title={`Delete Examination: ${exam.title}`}
                          className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 shadow-2xs transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Question Paper Inspection & Modification Modal */}
      {selectedExamForInspect && (
        <AdminPaperInspectModal
          isOpen={!!selectedExamForInspect}
          onClose={() => setSelectedExamForInspect(null)}
          exam={selectedExamForInspect}
          onExamUpdated={handleExamUpdated}
        />
      )}

      {/* Upload Zone Modal */}
      {showUploadZone && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 font-heading">
                  Upload Answer Sheet Scans &amp; Barcode Bundles
                </h3>
                <p className="text-xs text-slate-400 font-normal">
                  Upload scanned PDF answer scripts or use device camera for physical grading
                </p>
              </div>
              <button
                onClick={() => setShowUploadZone(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <UploadZone
              onFilesSelected={(files) => {
                setShowUploadZone(false);
                toast.success(`Cataloged ${files.length} answer script files.`);
              }}
            />
          </div>
        </div>
      )}

      {/* AI Key Settings Modal */}
      <AiKeyPickerModal
        isOpen={showAiKeyModal}
        onClose={() => setShowAiKeyModal(false)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          setExams((prev) => prev.filter((e) => e.id !== deleteTarget?.id));
          router.refresh();
        }}
        title="Delete Examination"
        description={`Are you sure you want to permanently delete examination "${deleteTarget?.title}" (${deleteTarget?.examCode})? This will delete all associated question blueprints, rubric items, and student test assignments.`}
        itemIdentifier={deleteTarget ? `${deleteTarget.title} (${deleteTarget.examCode})` : ""}
        deleteUrl={deleteTarget ? `/api/exams/${deleteTarget.id}` : ""}
      />
    </div>
  );
}
