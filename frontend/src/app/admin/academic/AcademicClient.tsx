"use client";

import React, { useState } from "react";
import {
  Building,
  Plus,
  UploadCloud,
  Search,
  Users,
  BookOpen,
  UserCheck,
  ChevronRight,
  GraduationCap,
  X,
  FileDown,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

interface Props {
  classes: any[];
  subjects: any[];
  academicYears: any[];
  totalStudentsCount: number;
  currentUser: any;
}

export function AcademicClient({
  classes: initialClasses,
  subjects,
  academicYears,
  totalStudentsCount,
  currentUser,
}: Props) {
  const router = useRouter();
  const [classList, setClassList] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [filterDegree, setFilterDegree] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // New Class Form State
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newDegree, setNewDegree] = useState("B.Pharm");
  const [newYear, setNewYear] = useState(1);
  const [newSemester, setNewSemester] = useState(1);
  const [newSection, setNewSection] = useState("Section A");
  const [newIntake, setNewIntake] = useState(60);

  // Bulk Import File State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);

  const filteredClasses = classList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());

    const matchesDegree =
      filterDegree === "ALL" ||
      (filterDegree === "BPHARM" && c.code.startsWith("BPHARM")) ||
      (filterDegree === "MPHARM" && c.code.startsWith("MPHARM")) ||
      (filterDegree === "PHARMD" && c.code.startsWith("PHARMD")) ||
      (filterDegree === "DPHARM" && c.code.startsWith("DPHARM"));

    return matchesSearch && matchesDegree;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) {
      toast.error("Please fill in both Class Name and Class Code.");
      return;
    }

    const created = {
      id: `class-${Date.now()}`,
      name: newClassName,
      code: newClassCode,
      degree: newDegree,
      year: newYear,
      semester: newSemester,
      sections: [{ id: `sec-${Date.now()}`, name: newSection }],
      _count: { studentProfiles: 0 },
    };

    setClassList((prev) => [created, ...prev]);
    toast.success(`Class ${newClassName} (${newClassCode}) created successfully!`);
    setIsAddOpen(false);
    setNewClassName("");
    setNewClassCode("");
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Class Code,Class Name,Degree,Year,Semester,Section,Intake Capacity\n" +
      "BPHARM-SEM-05,B.Pharm V-Semester,B.Pharm,3,5,Section A,60\n" +
      "BPHARM-SEM-06,B.Pharm VI-Semester,B.Pharm,3,6,Section A,60\n" +
      "MPHARM-PCHEM-01,M.Pharm Pharmaceutical Chemistry I-Sem,M.Pharm,1,1,Section A,18\n" +
      "PHARMD-YR-01,Pharm.D 1st Year,Pharm.D,1,1,Section A,30";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Swathi_College_Classes_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample template downloaded.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);

    // Mock parsing rows for instant preview
    setBulkPreview([
      { code: "BPHARM-SEM-07", name: "B.Pharm VII-Semester", degree: "B.Pharm", year: 4, sem: 7, sec: "Section A", intake: 60 },
      { code: "BPHARM-SEM-08", name: "B.Pharm VIII-Semester", degree: "B.Pharm", year: 4, sem: 8, sec: "Section A", intake: 60 },
      { code: "MPHARM-PCOL-01", name: "M.Pharm Pharmacology I-Sem", degree: "M.Pharm", year: 1, sem: 1, sec: "Section A", intake: 18 },
    ]);
  };

  const handleExecuteBulk = () => {
    if (bulkPreview.length === 0) {
      toast.error("Please choose a CSV file first.");
      return;
    }

    const newItems = bulkPreview.map((item, idx) => ({
      id: `class-bulk-${Date.now()}-${idx}`,
      name: item.name,
      code: item.code,
      degree: item.degree,
      year: item.year,
      semester: item.sem,
      sections: [{ id: `sec-${Date.now()}-${idx}`, name: item.sec }],
      _count: { studentProfiles: 0 },
    }));

    setClassList((prev) => [...newItems, ...prev]);
    toast.success(`Successfully imported ${bulkPreview.length} academic classes!`);
    setIsBulkOpen(false);
    setBulkFile(null);
    setBulkPreview([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">Academic Programs & Classes</h1>
          <p className="page-header-subtitle">
            {classList.length} academic programs • {totalStudentsCount} enrolled students
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/subjects" className="btn-outline">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Manage Subjects
          </Link>

          <button onClick={() => setIsAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Class
          </button>

          <button onClick={() => setIsBulkOpen(true)} className="btn-outline">
            <UploadCloud className="w-4 h-4 text-slate-500" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-50 text-blue-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{classList.length}</p>
            <p className="kpi-label">Total Classes</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{totalStudentsCount}</p>
            <p className="kpi-label">Total Students</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{subjects.length}</p>
            <p className="kpi-label">Subject Assignments</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-teal-50 text-teal-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{academicYears.length}</p>
            <p className="kpi-label">Academic Sessions</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes or degree code..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Programs" },
            { id: "BPHARM", label: "B.Pharm" },
            { id: "MPHARM", label: "M.Pharm" },
            { id: "PHARMD", label: "Pharm.D" },
            { id: "DPHARM", label: "D.Pharm" },
          ].map((deg) => (
            <button
              key={deg.id}
              onClick={() => setFilterDegree(deg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterDegree === deg.id
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {deg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 hover:border-teal-300 transition shadow-xs group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-mono text-[11px] font-semibold border border-teal-200">
                  {c.code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{c.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDeleteTarget(c)}
                  title={`Delete ${c.name}`}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Enrolled Students</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{c._count?.studentProfiles ?? 60}</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Sections</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {c.sections?.map((s: any) => s.name).join(", ") || "Section A"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Add New Academic Class</h2>
                  <p className="text-xs text-slate-500">Create program cohort for curriculum & evaluation</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Program / Degree</label>
                <select
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden"
                >
                  <option value="B.Pharm">Bachelor of Pharmacy (B.Pharm)</option>
                  <option value="M.Pharm - Chemistry">M.Pharm (Pharmaceutical Chemistry)</option>
                  <option value="M.Pharm - Pharmacology">M.Pharm (Pharmacology)</option>
                  <option value="M.Pharm - Pharmaceutics">M.Pharm (Pharmaceutics)</option>
                  <option value="Pharm.D">Doctor of Pharmacy (Pharm.D)</option>
                  <option value="D.Pharm">Diploma in Pharmacy (D.Pharm)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Class Name</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. B.Pharm V-Semester"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Class Code</label>
                  <input
                    type="text"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    placeholder="e.g. BPHARM-SEM-05"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Year</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Intake Capacity</label>
                  <input
                    type="number"
                    value={newIntake}
                    onChange={(e) => setNewIntake(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Initial Section</label>
                <input
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="Section A"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-teal-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bulk Import Classes & Cohorts</h2>
                  <p className="text-xs text-slate-500">Upload CSV spreadsheet with class codes & sections</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                <div>
                  <p className="font-semibold text-teal-900">Download Official CSV Template</p>
                  <p className="text-teal-700 text-[11px]">Use our standardized column formatting for error-free import</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-semibold flex items-center gap-1.5 transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="class-file-input"
                />
                <label htmlFor="class-file-input" className="cursor-pointer space-y-2 block">
                  <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-800">
                    {bulkFile ? bulkFile.name : "Click to browse or drop CSV file here"}
                  </p>
                  <p className="text-[11px] text-slate-400">Supports .CSV, .XLSX (Max 10MB)</p>
                </label>
              </div>

              {/* Preview Table */}
              {bulkPreview.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    Preview Classes to Import ({bulkPreview.length} items)
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2">Code</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Degree</th>
                          <th className="p-2">Intake</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkPreview.map((item, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono text-teal-700 font-semibold">{item.code}</td>
                            <td className="p-2 font-medium text-slate-900">{item.name}</td>
                            <td className="p-2 text-slate-600">{item.degree}</td>
                            <td className="p-2 text-slate-600">{item.intake}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulk}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Import Classes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          setClassList((prev) => prev.filter((c) => c.id !== deleteTarget?.id));
          router.refresh();
        }}
        title="Delete Academic Program/Class"
        description={`Are you sure you want to permanently delete program "${deleteTarget?.name}" (${deleteTarget?.code})? This will purge all associated class cohorts and subject mappings.`}
        itemIdentifier={deleteTarget ? `${deleteTarget.name} (${deleteTarget.code})` : ""}
        deleteUrl="/api/academic/delete"
        deletePayload={deleteTarget ? { type: "class", id: deleteTarget.id } : undefined}
      />
    </div>
  );
}
