import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Pilcrow,
  Superscript,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  wrapSelection,
  applyHeading,
  insertFootnote,
  PARAGRAPH_ITEMS,
  FOOTNOTE_ITEMS,
} from "./formatting-actions"
import type { EditorView } from "@codemirror/view"

interface FloatingToolbarProps {
  editorView: EditorView
  containerRef: React.RefObject<HTMLDivElement | null>
  selection: { from: number; to: number }
}

interface DropdownProps {
  icon: React.ReactNode
  title: string
  items: { label: string; action: string }[]
  onAction: (action: string) => void
}

function FloatingDropdown({ icon, title, items, onAction }: DropdownProps) {
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
        className="h-7 w-7 text-popover-foreground hover:bg-accent"
        title={title}
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen(!open)
        }}
      >
        {icon}
      </Button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-1 min-w-[160px] -translate-x-1/2 rounded-md border bg-popover py-1 shadow-md">
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

export function FloatingToolbar({ editorView, containerRef, selection }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const fromCoords = editorView.coordsAtPos(selection.from)
    const toCoords = editorView.coordsAtPos(selection.to)
    if (!fromCoords || !toCoords) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const toolbarWidth = toolbarRef.current?.offsetWidth ?? 200

    const midX = (fromCoords.left + toCoords.right) / 2 - containerRect.left
    const topY = Math.min(fromCoords.top, toCoords.top) - containerRect.top

    // Center toolbar horizontally, clamp to container bounds
    let left = midX - toolbarWidth / 2
    left = Math.max(4, Math.min(left, containerRect.width - toolbarWidth - 4))

    setPosition({
      top: topY - 44, // toolbar height (~36px) + gap (8px)
      left,
    })
  }, [editorView, containerRef, selection])

  if (!position) return null

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 flex items-center gap-0.5 rounded-lg border bg-popover px-1 py-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-popover-foreground hover:bg-accent"
        title="Жирный"
        onMouseDown={(e) => {
          e.preventDefault()
          wrapSelection(editorView, "**", "**")
        }}
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-popover-foreground hover:bg-accent"
        title="Курсив"
        onMouseDown={(e) => {
          e.preventDefault()
          wrapSelection(editorView, "*", "*")
        }}
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-popover-foreground hover:bg-accent"
        title="Подчёркивание"
        onMouseDown={(e) => {
          e.preventDefault()
          wrapSelection(editorView, "_", "_")
        }}
      >
        <Underline className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <FloatingDropdown
        icon={<Pilcrow className="h-3.5 w-3.5" />}
        title="Параграфы"
        items={PARAGRAPH_ITEMS}
        onAction={(action) => applyHeading(editorView, action)}
      />

      <FloatingDropdown
        icon={<Superscript className="h-3.5 w-3.5" />}
        title="Сноски"
        items={FOOTNOTE_ITEMS}
        onAction={(action) => insertFootnote(editorView, action)}
      />
    </div>
  )
}
