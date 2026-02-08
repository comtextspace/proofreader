import { create } from "zustand"
import type { User } from "@/types/models"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (user: User) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setTokens: (access, refresh) => {
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
  },

  setUser: (user) => {
    set({ user })
  },

  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false })
  },

  initialize: () => {
    const access = localStorage.getItem("access_token")
    const refresh = localStorage.getItem("refresh_token")
    if (access && refresh) {
      set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
    }
  },
}))
