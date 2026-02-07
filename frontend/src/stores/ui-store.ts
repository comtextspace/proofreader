import { create } from "zustand"

type Theme = "light" | "dark" | "system"

interface UIState {
  theme: Theme
  textSize: number
  setTheme: (theme: Theme) => void
  setTextSize: (size: number) => void
  initializeTheme: () => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.toggle("dark", prefersDark)
  } else {
    root.classList.toggle("dark", theme === "dark")
  }
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem("theme") as Theme) || "system",
  textSize: Number(localStorage.getItem("text_size")) || 14,

  setTheme: (theme) => {
    localStorage.setItem("theme", theme)
    applyTheme(theme)
    set({ theme })
  },

  setTextSize: (size) => {
    localStorage.setItem("text_size", String(size))
    set({ textSize: size })
  },

  initializeTheme: () => {
    const theme = (localStorage.getItem("theme") as Theme) || "system"
    applyTheme(theme)
    set({ theme })
  },
}))
