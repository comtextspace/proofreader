import { useRef, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Pilcrow,
  Superscript,
  Wand2,
  Undo2,
  Redo2,
} from "lucide-react"
import { undo, redo } from "@codemirror/commands"
import { Button } from "@/components/ui/button"
import {
  wrapSelection,
  applyHeading,
  insertFootnote,
  correctText,
  PARAGRAPH_ITEMS,
  FOOTNOTE_ITEMS,
} from "./formatting-actions"
import type { EditorView } from "@codemirror/view"

interface FormattingToolbarProps {
  editorView: EditorView | null
  onCorrect: () => void
  isCorrectingLLM: boolean
}

interface DropdownProps {
  icon: React.ReactNode
  title: string
  items: { label: string; action: string }[]
  onAction: (action: string) => void
}

function ToolbarDropdown({ icon, title, items, onAction }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false)
        }
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title={title}
        onClick={() => setOpen(!open)}
      >
        {icon}
      </Button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border bg-popover py-1 shadow-md">
          {items.map((item) => (
            <button
              key={item.action}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(e) => {
                e.preventDefault()
                onAction(item.action)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FormattingToolbar({ editorView }: FormattingToolbarProps) {
  if (!editorView) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Жирный (Ctrl+B)"
        onClick={() => wrapSelection(editorView, "**", "**")}>
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Курсив (Ctrl+I)"
        onClick={() => wrapSelection(editorView, "*", "*")}>
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Подчёркивание (Ctrl+U)"
        onClick={() => wrapSelection(editorView, "_", "_")}>
        <Underline className="h-3.5 w-3.5" />
      </Button>

      <ToolbarDropdown
        icon={<Pilcrow className="h-3.5 w-3.5" />}
        title="Параграфы"
        items={PARAGRAPH_ITEMS}
        onAction={(action) => applyHeading(editorView, action)}
      />

      <ToolbarDropdown
        icon={<Superscript className="h-3.5 w-3.5" />}
        title="Сноски"
        items={FOOTNOTE_ITEMS}
        onAction={(action) => insertFootnote(editorView, action)}
      />

      <Button variant="ghost" size="icon" className="h-7 w-7" title="Улучшить форматирование"
        onClick={() => correctText(editorView)}>
        <Wand2 className="h-3.5 w-3.5" />
      </Button>

      <div className="ml-auto flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Отменить (Ctrl+Z)"
          onClick={() => undo(editorView)}>
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Повторить (Ctrl+Y)"
          onClick={() => redo(editorView)}>
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
