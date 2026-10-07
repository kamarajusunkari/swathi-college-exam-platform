import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const EVALUATION_KEYS = {
  all: ["evaluation"] as const,
  queue: ["evaluation", "queue"] as const,
  byId: (id: string) => ["evaluation", "detail", id] as const,
  bundles: ["evaluation", "bundles"] as const,
};

export function useEvaluationQueue() {
  return useQuery({
    queryKey: EVALUATION_KEYS.queue,
    queryFn: api.getQueue,
  });
}

export function useAnswerSheet(id: string) {
  return useQuery({
    queryKey: EVALUATION_KEYS.byId(id),
    queryFn: () => api.getAnswerSheetById(id),
    enabled: Boolean(id),
  });
}

export function useBundles() {
  return useQuery({
    queryKey: EVALUATION_KEYS.bundles,
    queryFn: api.getBundles,
  });
}

export function useSubmitEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEYS.all });
    },
  });
}

export function useCheckModerationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.checkModeration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEYS.all });
    },
  });
}

export function useOverrideMarksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; data: { finalScore?: number; grade?: string; remarks?: string } }) =>
      api.overrideMarks(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEYS.all });
    },
  });
}

export function useIngestSheetsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.ingestSheets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEYS.all });
    },
  });
}
