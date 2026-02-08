import { useEffect } from "react"

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  handler: () => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const shiftMatch = shortcut.shift ? e.shiftKey : true

        if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && altMatch && shiftMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault()
          }
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}
