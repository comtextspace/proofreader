import { Keyboard } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const shortcuts = [
  { keys: "Ctrl + S", action: "Save page" },
  { keys: "Alt + Left", action: "Previous page" },
  { keys: "Alt + Right", action: "Next page" },
  { keys: "Ctrl + B", action: "Bold" },
  { keys: "Ctrl + I", action: "Italic" },
  { keys: "Ctrl + U", action: "Underline" },
  { keys: "Ctrl + Z", action: "Undo" },
  { keys: "Ctrl + Y", action: "Redo" },
]

export function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-64 rounded-lg border bg-card p-4 shadow-xl">
          <h3 className="mb-3 text-sm font-semibold">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.action}</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
