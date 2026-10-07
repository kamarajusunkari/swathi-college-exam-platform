import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const ACADEMIC_KEYS = {
  hierarchy: ["academic", "hierarchy"] as const,
  subjects: (classId?: string) => ["academic", "subjects", classId || "ALL"] as const,
};

export function useAcademicHierarchy() {
  return useQuery({
    queryKey: ACADEMIC_KEYS.hierarchy,
    queryFn: api.getHierarchy,
  });
}

export function useSubjects(classId?: string) {
  return useQuery({
    queryKey: ACADEMIC_KEYS.subjects(classId),
    queryFn: () => api.getSubjects(classId),
  });
}

export function useCreateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
    },
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic"] });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic"] });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic"] });
    },
  });
}

export function useMapSubjectClassesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.mapSubjectToClasses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic"] });
    },
  });
}

export function useAssignTeacherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.assignTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic"] });
    },
  });
}

export function useDeleteEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: string; id: string }) =>
      api.deleteEntity(payload.type, payload.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic"] });
    },
  });
}
