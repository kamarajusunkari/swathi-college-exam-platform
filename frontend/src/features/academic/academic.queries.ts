import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const ACADEMIC_KEYS = {
  all: ["academic"] as const,
  hierarchy: ["academic", "hierarchy"] as const,
  subjects: (classId?: string) => ["academic", "subjects", classId || "ALL"] as const,
  subject: (id: string) => ["academic", "subject", id] as const,
};

// --- Queries ---

export function useAcademicHierarchy(initialData?: any) {
  return useQuery({
    queryKey: ACADEMIC_KEYS.hierarchy,
    queryFn: api.getAcademicHierarchy,
    initialData,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useSubjects(classId?: string, initialData?: any) {
  return useQuery({
    queryKey: ACADEMIC_KEYS.subjects(classId),
    queryFn: () => api.getSubjects(classId),
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// --- Hierarchy & Structure Mutations ---

export function useCreateProgramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; code: string; description?: string; duration?: number }) =>
      api.createProgram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useUpdateProgramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: { name?: string; code?: string; description?: string; duration?: number } }) =>
      api.updateProgram(variables.id, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useCreateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; code: string; sectionName?: string; programId?: string }) =>
      api.createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: { name?: string; code?: string } }) =>
      api.updateClass(variables.id, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useCreateSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; classId: string }) =>
      api.createSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useUpdateSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: { name?: string } }) =>
      api.updateSection(variables.id, variables.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useBulkImportClassesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.bulkImportClasses(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.hierarchy });
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

// --- Subject Mutations ---

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.updateSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useMapSubjectClassesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      sourceSubjectId: string;
      targetClassIds: string[];
      copyTeacher?: boolean;
      perClassTeachers?: Record<string, string>;
    }) => api.mapSubjectToClasses(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useAssignTeacherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      subjectId: string;
      teacherId: string;
      classId?: string;
      sectionId?: string;
    }) => api.assignTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useDeleteTeacherAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTeacherAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}

export function useDeleteEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: string; id: string }) =>
      api.deleteEntity(payload.type, payload.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_KEYS.all });
    },
  });
}
