import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const USERS_KEYS = {
  all: ["users"] as const,
  list: ["users", "list"] as const,
  byId: (id: string) => ["users", "detail", id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEYS.list,
    queryFn: api.getUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USERS_KEYS.byId(id),
    queryFn: () => api.getUserById(id),
    enabled: Boolean(id),
  });
}

export function useOnboardUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.onboardUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useBulkOnboardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.bulkOnboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.all });
    },
  });
}
