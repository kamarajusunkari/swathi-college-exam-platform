import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const FEES_KEYS = {
  all: ["fees"] as const,
  list: ["fees", "list"] as const,
  byId: (id: string) => ["fees", "detail", id] as const,
};

export function useFees() {
  return useQuery({
    queryKey: FEES_KEYS.list,
    queryFn: api.getFees,
  });
}

export function useFee(id: string) {
  return useQuery({
    queryKey: FEES_KEYS.byId(id),
    queryFn: () => api.getFeeById(id),
    enabled: Boolean(id),
  });
}

export function usePayFeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.payFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["hallTickets"] });
    },
  });
}
