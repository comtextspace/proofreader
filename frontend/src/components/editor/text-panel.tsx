import { useCallback, useEffect, useRef, useState } from "react"
import { EditorState, Prec, StateEffect, StateField } from "@codemirror/state"
import { Decoration, type DecorationSet, EditorView, keymap, lineNumbers } from "@codemirror/view"
import { defaultKeymap, history, historyKeymap, redo } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { oneDark } from "@codemirror/theme-one-dark"
import { FormattingToolbar } from "./formatting-toolbar"
import { FloatingToolbar } from "./floating-toolbar"
import { useUIStore } from "@/stores/ui-store"
import type { SpellError } from "@/types/models"

const setSpellErrorsEffect = StateEffect.define<SpellError[]>()

const spellErrorField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSpellErrorsEffect)) {
        const marks = effect.value
          .filter((e) => e.from < tr.state.doc.length && e.to <= tr.state.doc.length)
          .map((e) =>
            Decoration.mark({ class: "cm-spell-error" }).range(e.from, e.to)
          )
        return Decoration.set(marks, true)
      }
    }
    return decorations.map(tr.changes)
  },
  provide: (f) => EditorView.decorations.from(f),
})

interface TextPanelProps {
  text: string
  onChange: (text: string) => void
  onSave: () => void
  onCorrect: () => void
  isCorrectingLLM: boolean
  isDark: boolean
  readOnly?: boolean
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onSelectionChange?: (sel: { from: number; to: number; text?: string } | null) => void
  spellErrors?: SpellError[]
  onFormatApplied?: (newText: string) => void
}

export function TextPanel({ text, onChange, onSave, onCorrect, isCorrectingLLM, isDark, readOnly, onNavigatePrev, onNavigateNext, onSelectionChange, spellErrors, onFormatApplied }: TextPanelProps) {
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
  const onNavigatePrevRef = useRef(onNavigatePrev)
  onNavigatePrevRef.current = onNavigatePrev
  const onNavigateNextRef = useRef(onNavigateNext)
  onNavigateNextRef.current = onNavigateNext
  const onSelectionChangeRef = useRef(setSelection)
  onSelectionChangeRef.current = setSelection
  const onParentSelectionChangeRef = useRef(onSelectionChange)
  onParentSelectionChangeRef.current = onSelectionChange
  const selectionDebounceRef = useRef<number>(0)

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
        {
          key: "Ctrl-u",
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
        {
          key: "Mod-y",
          run: (view: EditorView) => redo(view),
        },
      ]),
      Prec.highest(keymap.of([
        {
          key: "Alt-ArrowLeft",
          run: () => {
            onNavigatePrevRef.current?.()
            return true
          },
        },
        {
          key: "Alt-ArrowRight",
          run: () => {
            onNavigateNextRef.current?.()
            return true
          },
        },
      ])),
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
          clearTimeout(selectionDebounceRef.current)
          selectionDebounceRef.current = window.setTimeout(() => {
            if (from !== to) {
              const selectedText = update.state.sliceDoc(from, to)
              onParentSelectionChangeRef.current?.({ from, to, text: selectedText })
            } else {
              onParentSelectionChangeRef.current?.(null)
            }
          }, 50)
        }
      }),
      spellErrorField,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": { height: "100%", fontSize: `${textSize}px` },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "monospace",
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        },
        ".cm-scroller:hover": {
          scrollbarColor: "rgba(167, 139, 218, 0.4) transparent",
        },
        ".cm-scroller::-webkit-scrollbar": { width: "6px" },
        ".cm-scroller::-webkit-scrollbar-track": { background: "transparent" },
        ".cm-scroller::-webkit-scrollbar-thumb": {
          backgroundColor: "transparent",
          borderRadius: "3px",
        },
        ".cm-scroller:hover::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(167, 139, 218, 0.4)",
        },
        ".cm-scroller:hover::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(167, 139, 218, 0.6)",
        },
        ".cm-content": { minHeight: "300px" },
        ".cm-spell-error": { textDecoration: "underline wavy oklch(0.70 0.14 15)", textUnderlineOffset: "3px" },
      }),
    ]

    if (isDark) {
      extensions.push(oneDark)
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true))
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
  }, [isDark, textSize, readOnly]) // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    const view = viewRef.current
    if (view && spellErrors) {
      view.dispatch({
        effects: setSpellErrorsEffect.of(spellErrors),
      })
    }
  }, [spellErrors])

  return (
    <div ref={containerRef} className="relative h-full">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border">
        <FormattingToolbar
          editorView={editorView}
          onCorrect={onCorrect}
          isCorrectingLLM={isCorrectingLLM}
          onFormatApplied={onFormatApplied}
        />
        <div ref={editorRef} className="min-h-0 flex-1 overflow-hidden" />
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
