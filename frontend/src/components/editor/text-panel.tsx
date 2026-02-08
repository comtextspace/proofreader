import { useCallback, useEffect, useRef, useState } from "react"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap, lineNumbers } from "@codemirror/view"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { oneDark } from "@codemirror/theme-one-dark"
import { FormattingToolbar } from "./formatting-toolbar"
import { FloatingToolbar } from "./floating-toolbar"
import { useUIStore } from "@/stores/ui-store"

interface TextPanelProps {
  text: string
  onChange: (text: string) => void
  onSave: () => void
  onCorrect: () => void
  isCorrectingLLM: boolean
  isDark: boolean
}

export function TextPanel({ text, onChange, onSave, onCorrect, isCorrectingLLM, isDark }: TextPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [editorView, setEditorView] = useState<EditorView | null>(null)
  const [selection, setSelection] = useState<{ from: number; to: number } | null>(null)
  const textSize = useUIStore((s) => s.textSize)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const onSelectionChangeRef = useRef(setSelection)
  onSelectionChangeRef.current = setSelection

  const createEditor = useCallback(() => {
    if (!editorRef.current) return

    if (viewRef.current) {
      viewRef.current.destroy()
    }

    const extensions = [
      lineNumbers(),
      history(),
      markdown(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        {
          key: "Mod-s",
          run: () => {
            onSaveRef.current()
            return true
          },
        },
        {
          key: "Mod-b",
          run: (view: EditorView) => {
            const { from, to } = view.state.selection.main
            const selected = view.state.sliceDoc(from, to)
            view.dispatch({
              changes: { from, to, insert: `**${selected}**` },
              selection: { anchor: from + 2, head: to + 2 },
            })
            return true
          },
        },
        {
          key: "Mod-i",
          run: (view: EditorView) => {
            const { from, to } = view.state.selection.main
            const selected = view.state.sliceDoc(from, to)
            view.dispatch({
              changes: { from, to, insert: `*${selected}*` },
              selection: { anchor: from + 1, head: to + 1 },
            })
            return true
          },
        },
        {
          key: "Mod-u",
          run: (view: EditorView) => {
            const { from, to } = view.state.selection.main
            const selected = view.state.sliceDoc(from, to)
            view.dispatch({
              changes: { from, to, insert: `_${selected}_` },
              selection: { anchor: from + 1, head: to + 1 },
            })
            return true
          },
        },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString())
        }
        if (update.selectionSet || update.docChanged) {
          const { from, to } = update.state.selection.main
          if (from !== to) {
            onSelectionChangeRef.current({ from, to })
          } else {
            onSelectionChangeRef.current(null)
          }
        }
      }),
      EditorView.lineWrapping,
      EditorView.theme({
        "&": { height: "100%", fontSize: `${textSize}px` },
        ".cm-scroller": { overflow: "auto", fontFamily: "monospace" },
        ".cm-content": { minHeight: "300px" },
      }),
    ]

    if (isDark) {
      extensions.push(oneDark)
    }

    const state = EditorState.create({
      doc: text,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view
    setEditorView(view)
  }, [isDark, textSize]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    createEditor()
    return () => {
      viewRef.current?.destroy()
    }
  }, [createEditor])

  useEffect(() => {
    const view = viewRef.current
    if (view && text !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
      })
    }
  }, [text])

  return (
    <div ref={containerRef} className="relative h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border">
        <FormattingToolbar
          editorView={editorView}
          onCorrect={onCorrect}
          isCorrectingLLM={isCorrectingLLM}
        />
        <div ref={editorRef} className="flex-1 overflow-auto" />
      </div>
      {editorView && selection && (
        <FloatingToolbar
          editorView={editorView}
          containerRef={containerRef}
          selection={selection}
        />
      )}
    </div>
  )
}
