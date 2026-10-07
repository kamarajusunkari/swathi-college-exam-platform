import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const EXAMS_KEYS = {
  all: ["exams"] as const,
  list: (classId?: string) => ["exams", "list", classId || "ALL"] as const,
  byId: (id: string) => ["exams", "detail", id] as const,
  vault: ["exams", "vault"] as const,
};

export function useExams(classId?: string) {
  return useQuery({
    queryKey: EXAMS_KEYS.list(classId),
    queryFn: () => api.getExams(classId ? { classId } : undefined),
  });
}

export function useExam(id: string) {
  return useQuery({
    queryKey: EXAMS_KEYS.byId(id),
    queryFn: () => api.getExamById(id),
    enabled: Boolean(id),
  });
}

export function usePaperVault() {
  return useQuery({
    queryKey: EXAMS_KEYS.vault,
    queryFn: api.getPaperVault,
  });
}

export function useCreateExamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExam,
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
    mutationFn: api.togglePaperRelease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEYS.all });
    },
  });
}
