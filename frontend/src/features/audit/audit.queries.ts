import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const AUDIT_KEYS = {
  all: ["audit"] as const,
  list: ["audit", "list"] as const,
  filter: (params?: any) => ["audit", "list", params] as const,
  summary: ["audit", "summary"] as const,
  myLogs: ["audit", "my-logs"] as const,
};

export function useAuditLogs(params?: any) {
  return useQuery({
    queryKey: AUDIT_KEYS.filter(params),
    queryFn: async () => {
      const res = await api.getAuditLogs(params);
      return res?.logs || (Array.isArray(res) ? res : []);
    },
  });
}

export function useAuditSummary() {
  return useQuery({
    queryKey: AUDIT_KEYS.summary,
    queryFn: async () => {
      const res = await api.getAuditSummary();
      return res?.summary || null;
    },
  });
}

export function useMyAuditLogs() {
  return useQuery({
    queryKey: AUDIT_KEYS.myLogs,
    queryFn: async () => {
      const res = await api.getMyAuditLogs();
      return res?.logs || [];
    },
  });
}
