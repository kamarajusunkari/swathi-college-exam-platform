import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const EXAMS_KEYS = {
  all: ["exams"] as const,
  list: (classId?: string) => ["exams", "list", classId || "ALL"] as const,
  byId: (id: string) => ["exams", "detail", id] as const,
  vault: ["exams", "vault"] as const,
};

// --- Queries ---

export function useExams(classId?: string, initialData?: any) {
  return useQuery({
    queryKey: EXAMS_KEYS.list(classId),
    queryFn: () => api.getExams(classId ? { classId } : undefined),
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useExam(id: string) {
  return useQuery({
    queryKey: EXAMS_KEYS.byId(id),
    queryFn: () => api.getExamById(id),
    enabled: Boolean(id),
  });
}

export function usePaperVault(initialData?: any) {
  return useQuery({
    queryKey: EXAMS_KEYS.vault,
    queryFn: api.getPaperVault,
    initialData,
    staleTime: 1000 * 60 * 2,
  });
}

// --- Mutations ---

export function useCreateExamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEYS.all });
    },
  });
}

export function useUpdateExamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: any }) =>
      api.updateExam(variables.id, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEYS.all });
    },
  });
}

export function useDeleteExamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEYS.all });
    },
  });
}

export function useTogglePaperReleaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { paperId?: string; examId?: string; release: boolean }) =>
      api.togglePaperRelease(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEYS.all });
    },
  });
}

export function useSubmitPaperMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paperId: string) => api.submitPaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEYS.all });
    },
  });
}
