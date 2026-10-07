import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const RESULTS_KEYS = {
  all: ["results"] as const,
  list: ["results", "list"] as const,
};

export function useResults() {
  return useQuery({
    queryKey: RESULTS_KEYS.list,
    queryFn: api.getResults,
  });
}

export function usePublishResultsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.publishResults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_KEYS.all });
    },
  });
}
