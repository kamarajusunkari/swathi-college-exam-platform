import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  History,
  ShieldCheck,
  User,
  Clock,
  Terminal,
  FileCode2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let logs: any[] = [];
  try {
    const data = await serverFetch<{ logs: any[] }>("/audit");
    logs = data.logs || [];
  } catch (err) {
    console.error("Failed to load audit logs:", err);
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <History className="w-4 h-4" />
              Security & Compliance Governance
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Irrevocable Cryptographic Audit Log Trail
            </h1>
            <p className="text-sm text-slate-500">
              Immutable forensic ledger recording every examination vault access, score override, and fee reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SOC2 / ISO 27001 Audit Ready
            </span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                Live System Mutation Stream
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displaying the latest {logs.length} critical system transactions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor / Operator</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Payload & Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {log.user ? log.user.name.slice(0, 2).toUpperCase() : "SYS"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {log.user?.name || "System Automated"}
                            </p>
                            <p className="text-[10px] text-slate-400">{log.user?.role || "DAEMON"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{log.entity}</p>
                        {log.entityId && (
                          <p className="text-[10px] font-mono text-slate-400">{log.entityId.slice(0, 12)}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.details ? (
                          <pre className="p-2 rounded-lg bg-slate-900 text-slate-300 font-mono text-[10px] max-w-md overflow-x-auto whitespace-pre-wrap">
                            {log.details}
                          </pre>
                        ) : (
                          <span className="text-slate-400 italic">No additional payload</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
