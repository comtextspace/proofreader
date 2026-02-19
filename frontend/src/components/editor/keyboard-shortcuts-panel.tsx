import { Keyboard } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
const mod = isMac ? "⌘" : "Ctrl"

function getShortcuts() {
  return [
    { keys: `${mod} + S`, action: "Сохранить" },
    { keys: "Alt + Left", action: "Предыдущая страница" },
    { keys: "Alt + Right", action: "Следующая страница" },
    { keys: `${mod} + B`, action: "Жирный" },
    { keys: `${mod} + I`, action: "Курсив" },
    { keys: `${isMac ? "Ctrl" : mod} + U`, action: "Подчёркивание" },
    { keys: `${mod} + Z`, action: "Отменить" },
    { keys: isMac ? `${mod} + Shift + Z` : "Ctrl + Y", action: "Повторить" },
  ]
}

export function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const shortcuts = useMemo(() => getShortcuts(), [])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-14 right-4 z-50 h-10 w-10 rounded-full bg-gradient-primary text-white shadow-primary-sm hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-300 border-0"
        onClick={() => setIsOpen(!isOpen)}
        title="Клавиатурные сокращения"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-26 right-4 z-50 w-72 rounded-lg border bg-card p-4 shadow-xl">
          <h3 className="mb-3 text-sm font-semibold">Клавиатурные сокращения</h3>
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.action}</span>
                <kbd className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
