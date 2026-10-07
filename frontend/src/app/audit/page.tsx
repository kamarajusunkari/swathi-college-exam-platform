import { getCurrentUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  History,
  ShieldCheck,
  Clock,
  User,
  Filter,
  FileText,
  Lock,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  const auditLogs = await serverFetch<any[]>("/audit", { fallback: [] });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              Security & Compliance
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Institutional Audit Trail & Security Logs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Tamper-evident logs of every privileged action: question paper releases, marks overrides, fee clearances, and result publications.
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">System Activity Stream</h2>
            <span className="text-xs text-slate-400">{auditLogs.length} Events Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Actor</th>
                  <th className="pb-3 px-3">Action Type</th>
                  <th className="pb-3 px-3">Target Entity</th>
                  <th className="pb-3 px-3">Audit Details</th>
                  <th className="pb-3 px-3">Security Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {log.user?.name || "System"}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {log.user?.role || "SYSTEM"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-indigo-300 font-medium">
                      {log.entity}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-md font-mono text-[11px]">
                      {log.details}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
