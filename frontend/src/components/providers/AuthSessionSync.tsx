"use client";

import { useEffect } from "react";
import { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_KEYS } from "@/features/auth/auth.queries";

interface Props {
  user?: SessionUser | null;
}

export function AuthSessionSync({ user }: Props) {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setUser(user);
      queryClient.setQueryData(AUTH_KEYS.me(), user);
    }
  }, [user, setUser, queryClient]);

  return null;
}
