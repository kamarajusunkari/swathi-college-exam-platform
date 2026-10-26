import { create } from "zustand";
import Cookies from "js-cookie";
import { SessionUser, UserRole } from "@/lib/types";

interface AuthState {
  user: SessionUser | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: SessionUser | null, token?: string | null) => void;
  setToken: (token: string | null) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;

  // Selectors / Helpers
  isAuthenticated: () => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isHydrated: false,

  setUser: (user, token) => {
    if (typeof window !== "undefined") {
      if (user?.email) {
        Cookies.set("swathi_auth_user", user.email, { expires: 7, path: "/", sameSite: "lax" });
      }
    }

    set((state) => ({
      user,
      token: token !== undefined ? token : state.token,
      isLoading: false,
      isHydrated: true,
    }));
  },

  setToken: (token) => {
    set({ token });
  },

  clearUser: () => {
    if (typeof window !== "undefined") {
      Cookies.remove("swathi_auth_user", { path: "/" });
    }
    set({
      user: null,
      token: null,
      isLoading: false,
      isHydrated: true,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setHydrated: (isHydrated) => set({ isHydrated }),

  isAuthenticated: () => {
    return Boolean(get().user);
  },

  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  },

  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return Boolean(user.permissions?.includes(permission));
  },
}));
