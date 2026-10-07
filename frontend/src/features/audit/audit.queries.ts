import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const AUDIT_KEYS = {
  list: ["audit", "list"] as const,
};

export function useAuditLogs() {
  return useQuery({
    queryKey: AUDIT_KEYS.list,
    queryFn: api.getLogs,
  });
}
