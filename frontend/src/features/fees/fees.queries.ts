import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const FEES_KEYS = {
  all: ["fees"] as const,
  list: ["fees", "list"] as const,
  student: ["fees", "student"] as const,
  byId: (id: string) => ["fees", "detail", id] as const,
};

export function useFees(initialData?: any) {
  return useQuery({
    queryKey: FEES_KEYS.list,
    queryFn: api.getFees,
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useStudentFees(initialData?: any) {
  return useQuery({
    queryKey: FEES_KEYS.student,
    queryFn: api.getStudentFees,
    initialData,
    staleTime: 1000 * 60 * 2,
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
      queryClient.invalidateQueries({ queryKey: ["users", "student"] });
    },
  });
}

export function useDeleteFeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteFee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["hallTickets"] });
    },
  });
}
