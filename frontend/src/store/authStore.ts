import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (partialUser) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partialUser } : null })),
      logout: () => {
        import("@/lib/socket").then(({ disconnectSocket }) => disconnectSocket());
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: "aisms-auth" }
  )
);
