import { useEffect } from "react"

interface ShortcutConfig {
  key: string
  code?: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  handler: () => void
  preventDefault?: boolean
}

function normalizeKey(value: string): string {
  return value.toLowerCase()
}

function inferCodeFromKey(key: string): string | null {
  if (/^[a-z]$/i.test(key)) {
    return `Key${key.toUpperCase()}`
  }
  if (/^[0-9]$/.test(key)) {
    return `Digit${key}`
  }
  return null
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.isComposing || e.defaultPrevented) {
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const shiftMatch = shortcut.shift ? e.shiftKey : true
        const expectedCode = shortcut.code ?? inferCodeFromKey(shortcut.key)
        const keyMatch = expectedCode
          ? e.code === expectedCode
          : normalizeKey(e.key) === normalizeKey(shortcut.key)

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
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
