import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";
import { OnboardUserInput, UpdateUserRoleInput } from "./users.schema";

export const USERS_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_KEYS.all, "list"] as const,
  list: (filters?: { role?: string; classId?: string; search?: string }) =>
    [...USERS_KEYS.lists(), filters] as const,
  details: () => [...USERS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
};

export function useUsersList(filters?: { role?: string; classId?: string; search?: string }) {
  return useQuery({
    queryKey: USERS_KEYS.list(filters),
    queryFn: async () => {
      const data = await api.getUsers();
      let users = data?.users || [];

      if (filters?.role && filters.role !== "ALL") {
        users = users.filter((u: any) => u.role === filters.role);
      }
      if (filters?.classId && filters.classId !== "ALL") {
        users = users.filter((u: any) => u.studentProfile?.classId === filters.classId);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        users = users.filter(
          (u: any) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.studentProfile?.rollNo?.toLowerCase().includes(q) ||
            u.studentProfile?.studentId?.toLowerCase().includes(q) ||
            u.teacherProfile?.employeeId?.toLowerCase().includes(q)
        );
      }

      return users;
    },
    staleTime: 60 * 1000,
  });
}

export function useUserDetail(id: string, options?: { enabled?: boolean; initialData?: any }) {
  return useQuery({
    queryKey: USERS_KEYS.detail(id),
    queryFn: async () => {
      const data = await api.getUserById(id);
      return data?.user || null;
    },
    enabled: options?.enabled ?? Boolean(id),
    initialData: options?.initialData,
    staleTime: 60 * 1000,
  });
}

export function useOnboardUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OnboardUserInput) => {
      return await api.onboardUser(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useBulkOnboardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      return await api.bulkOnboard(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserRoleInput) => {
      return await api.updateUserRole(payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await api.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}
