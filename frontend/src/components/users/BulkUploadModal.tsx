"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api/services.api";
import { useBulkOnboardMutation } from "@/features/users/users.queries";
import { generateCsvTemplate, downloadCsvFile } from "@/lib/templates";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "admin" | "teacher" | "student";
  title: string;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  title,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const bulkOnboardMutation = useBulkOnboardMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent = generateCsvTemplate(type);
    const filename = `swathi_pharmacy_${type}s_onboarding_template.csv`;
    downloadCsvFile(filename, csvContent);
    toast.success(`Downloaded sample template: ${filename}`);
  };

  const parseCsv = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setErrors(["CSV file is empty or only contains headers."]);
      return;
    }

    // Split headers
    const rawHeaders = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
    setHeaders(rawHeaders);

    const rows: any[] = [];
    const validationErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex for CSV split handling quotes
      const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
      const values: string[] = [];
      let match;
      const line = lines[i];

      // fallback split if simple
      const rawValues = line.split(",").map((v) => v.replace(/^["']|["']$/g, "").trim());

      const rowObj: any = { _rowIndex: i + 1, _isValid: true, _error: "" };

      rawHeaders.forEach((h, idx) => {
        rowObj[h] = rawValues[idx] || "";
      });

      // Validate required fields
      if (!rowObj.Name || rowObj.Name.length < 2) {
        rowObj._isValid = false;
        rowObj._error = "Missing valid Name";
      } else if (!rowObj.Email || !rowObj.Email.includes("@")) {
        rowObj._isValid = false;
        rowObj._error = "Invalid Email address";
      }

      if (type === "teacher" && (!rowObj.EmployeeId || !rowObj.Department)) {
        rowObj._isValid = false;
        rowObj._error = "Missing EmployeeId or Department";
      }

      if (type === "student" && (!rowObj.RollNo || !rowObj.StudentId || !rowObj.ClassCode)) {
        rowObj._isValid = false;
        rowObj._error = "Missing RollNo, StudentId, or ClassCode";
      }

      if (!rowObj._isValid) {
        validationErrors.push(`Row ${i + 1}: ${rowObj._error}`);
      }

      rows.push(rowObj);
    }

    setParsedRows(rows);
    setErrors(validationErrors);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".csv")) {
      toast.error("Please select a valid .CSV file");
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCsv(content);
    };
    reader.readAsText(selected);
  };

  const handleUploadSubmit = async () => {
    if (parsedRows.length === 0) {
      toast.error("No valid records to upload.");
      return;
    }

    const validRows = parsedRows.filter((r) => r._isValid);
    if (validRows.length === 0) {
      toast.error("All rows have validation errors. Please check the sample template.");
      return;
    }

    bulkOnboardMutation.mutate(
      {
        type,
        records: validRows,
      },
      {
        onSuccess: (data: any) => {
          if (data && data.success) {
            toast.success(`Successfully onboarded ${data.count} ${type} records!`);
            onSuccess();
            onClose();
          } else {
            toast.error("Bulk onboarding failed");
          }
        },
        onError: (err: any) => {
          toast.error(err.message || "Network error during bulk onboarding");
        },
      }
    );
  };

  const validCount = parsedRows.filter((r) => r._isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                Batch import institutional accounts via validated CSV spreadsheet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Download Template Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-950">
                  Need the required CSV format & sample pharmacy columns?
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Download pre-populated template with valid pharmacy courses and fields.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-xs font-bold text-indigo-700 shadow-xs transition-all cursor-pointer hover:scale-102 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Sample Template (.CSV)
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-200 mx-auto flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 mt-3">
                Click to browse or drop your filled CSV spreadsheet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports .CSV files with UTF-8 encoding
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{file.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} Total Rows Detected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                      setErrors([]);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> {validCount} Valid Records
                  </span>
                  {errors.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                      <AlertCircle className="w-4 h-4" /> {errors.length} Errors Found
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Showing first 8 preview entries
                </p>
              </div>

              {/* Data Table Preview */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      {type === "teacher" && <th className="py-2.5 px-3">Dept & ID</th>}
                      {type === "student" && <th className="py-2.5 px-3">Roll & Program</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className={row._isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}>
                        <td className="py-2 px-3">
                          {row._isValid ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              Valid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px]" title={row._error}>
                              Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.Name}</td>
                        <td className="py-2 px-3 text-slate-600">{row.Email}</td>
                        {type === "teacher" && (
                          <td className="py-2 px-3 text-slate-600">
                            {row.Department} ({row.EmployeeId})
                          </td>
                        )}
                        {type === "student" && (
                          <td className="py-2 px-3 text-slate-600">
                            {row.RollNo} ({row.ClassCode})
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-xs font-bold text-slate-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={bulkOnboardMutation.isPending || !file || validCount === 0}
            onClick={handleUploadSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-102"
          >
            {bulkOnboardMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing Records...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload & Commit {validCount} Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
