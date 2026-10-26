import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";
import { OnboardUserInput, UpdateUserRoleInput } from "./users.schema";

export const USERS_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_KEYS.all, "list"] as const,
  list: (filters?: {
    page?: number;
    limit?: number;
    role?: string;
    classId?: string;
    search?: string;
  }) => [...USERS_KEYS.lists(), filters] as const,
  details: () => [...USERS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
};

export function useUsersList(filters?: {
  page?: number;
  limit?: number;
  role?: string;
  classId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: USERS_KEYS.list(filters),
    queryFn: async () => {
      const data = await api.getUsers({
        page: filters?.page,
        limit: filters?.limit,
        role: filters?.role !== "ALL" ? filters?.role : undefined,
        classId: filters?.classId !== "ALL" ? filters?.classId : undefined,
        search: filters?.search?.trim() ? filters.search.trim() : undefined,
      });

      return {
        users: data?.users || [],
        total: data?.total || (data?.users?.length || 0),
        page: data?.page || filters?.page || 1,
        limit: data?.limit || filters?.limit || 20,
        totalPages: data?.totalPages || 1,
      };
    },
    staleTime: 30 * 1000,
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
