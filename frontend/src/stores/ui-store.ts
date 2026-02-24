import { create } from "zustand"

type Theme = "light" | "dark" | "system"

interface UIState {
  theme: Theme
  textSize: number
  spellcheckEnabled: boolean
  imageHighlightEnabled: boolean
  setTheme: (theme: Theme) => void
  setTextSize: (size: number) => void
  toggleSpellcheck: () => void
  toggleImageHighlight: () => void
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
  spellcheckEnabled: localStorage.getItem("spellcheck_enabled") !== "false",
  imageHighlightEnabled: localStorage.getItem("image_highlight_enabled") !== "false",

  setTheme: (theme) => {
    localStorage.setItem("theme", theme)
    applyTheme(theme)
    set({ theme })
  },

  setTextSize: (size) => {
    localStorage.setItem("text_size", String(size))
    set({ textSize: size })
  },

  toggleSpellcheck: () => {
    set((state) => {
      const next = !state.spellcheckEnabled
      localStorage.setItem("spellcheck_enabled", String(next))
      return { spellcheckEnabled: next }
    })
  },

  toggleImageHighlight: () => {
    set((state) => {
      const next = !state.imageHighlightEnabled
      localStorage.setItem("image_highlight_enabled", String(next))
      return { imageHighlightEnabled: next }
    })
  },

  initializeTheme: () => {
    const theme = (localStorage.getItem("theme") as Theme) || "system"
    applyTheme(theme)
    set({ theme })
  },
}))
