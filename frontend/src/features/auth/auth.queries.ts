import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, switchRole } from "@/lib/api/services.api";
import { useAuthStore } from "@/stores/auth.store";
import { LoginFormData, UserRole } from "./auth.schema";
import { SessionUser } from "@/lib/types";

export const AUTH_KEYS = {
  all: ["auth"] as const,
  me: () => [...AUTH_KEYS.all, "me"] as const,
};

export function useCurrentUser(options?: { enabled?: boolean }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useQuery({
    queryKey: AUTH_KEYS.me(),
    queryFn: async () => {
      try {
        const data = await getMe();
        if (data?.user) {
          setUser(data.user);
          return data.user as SessionUser;
        }
        return null;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      return await login(credentials);
    },
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user, data.token || null);
        queryClient.setQueryData(AUTH_KEYS.me(), data.user);
      }
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: async () => {
      try {
        return await logout();
      } catch (error) {
        // Even if network request fails, clear local session
        return { success: true };
      }
    },
    onSuccess: () => {
      clearUser();
      queryClient.clear();
    },
  });
}

export function useSwitchRoleMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (role: UserRole | string) => {
      return await switchRole(role);
    },
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user, (data as any).token || null);
        queryClient.setQueryData(AUTH_KEYS.me(), data.user);
      }
      queryClient.invalidateQueries();
    },
  });
}
