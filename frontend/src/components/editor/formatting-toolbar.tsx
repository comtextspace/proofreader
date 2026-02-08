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
import type { EditorView } from "@codemirror/view"

interface FormattingToolbarProps {
  editorView: EditorView | null
  onCorrect: () => void
  isCorrectingLLM: boolean
}

function wrapSelection(view: EditorView, before: string, after: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  view.dispatch({
    changes: { from, to, insert: `${before}${selected}${after}` },
    selection: { anchor: from + before.length, head: to + before.length },
  })
  view.focus()
}

function applyHeading(view: EditorView, action: string) {
  const { from } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  const lineText = line.text

  // Remove existing heading markers
  const stripped = lineText.replace(/^#{1,3}\s*/, "")

  let newText: string
  switch (action) {
    case "h1":
      newText = `# ${stripped}`
      break
    case "h2":
      newText = `## ${stripped}`
      break
    case "h3":
      newText = `### ${stripped}`
      break
    default:
      newText = stripped
  }

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
  })
  view.focus()
}

function insertFootnote(view: EditorView, template: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const n = "X"

  let text: string
  switch (template) {
    case "reference":
      text = `[^${n}]`
      break
    case "single":
      text = `[^${n}]{${selected}}[^${n}]`
      break
    case "start":
      text = `[^${n}]{${selected}~[^${n}]`
      break
    case "continuation":
      text = `[^${n}]~${selected}~[^${n}]`
      break
    case "end":
      text = `[^${n}]~${selected}}[^${n}]`
      break
    default:
      text = selected
  }

  view.dispatch({
    changes: { from, to, insert: text },
  })
  view.focus()
}

function correctText(view: EditorView) {
  const text = view.state.doc.toString()
  const corrected = text.replace(/(?<!\n)\n(?!($|\n))/g, " ")
  if (corrected !== text) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: corrected },
    })
  }
  view.focus()
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

const PARAGRAPH_ITEMS = [
  { label: "Заголовок 1", action: "h1" },
  { label: "Заголовок 2", action: "h2" },
  { label: "Заголовок 3", action: "h3" },
  { label: "Параграф", action: "paragraph" },
]

const FOOTNOTE_ITEMS = [
  { label: "Ссылка", action: "reference" },
  { label: "Одностраничная", action: "single" },
  { label: "Начало", action: "start" },
  { label: "Продолжение", action: "continuation" },
  { label: "Окончание", action: "end" },
]

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
