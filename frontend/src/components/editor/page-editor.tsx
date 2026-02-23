import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { TextPanel } from "./text-panel"
import { ImagePanel } from "./image-panel"
import { UnifiedBottomBar } from "./unified-bottom-bar"
import { KeyboardShortcutsPanel } from "./keyboard-shortcuts-panel"
import { useLLMCorrection, usePageAdjacent, useUpdatePage } from "@/hooks/use-pages"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useUIStore } from "@/stores/ui-store"
import { spellcheckText } from "@/api/pages"
import type { PageDetail, SpellError } from "@/types/models"

interface PageEditorProps {
  page: PageDetail
}

export function PageEditor({ page }: PageEditorProps) {
  const navigate = useNavigate()
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === "dark"
  const isLocked = page.book.is_locked

  const [text, setText] = useState(page.text)
  const [selection, setSelection] = useState<{ from: number; to: number } | null>(null)
  const [status, setStatus] = useState<string>(page.status)
  const [numberInBook, setNumberInBook] = useState(page.number_in_book ?? "")

  const [spellErrors, setSpellErrors] = useState<SpellError[]>([])
  const spellDebounceRef = useRef<number>(0)
  const spellRequestRef = useRef(0)

  const { data: adjacent } = usePageAdjacent(page.id)
  const updateMutation = useUpdatePage(page.id)
  const llmMutation = useLLMCorrection(page.id)

  const handleSave = useCallback(async () => {
    await updateMutation.mutateAsync({
      text,
      status,
      number_in_book: numberInBook || null,
    })
  }, [text, status, numberInBook, updateMutation])

  const handleSaveAndNext = useCallback(async () => {
    await handleSave()
    if (adjacent?.next_id) {
      navigate(`/pages/${adjacent.next_id}/edit`)
    }
  }, [handleSave, adjacent, navigate])

  const handleCorrect = useCallback(() => {
    llmMutation.mutate()
  }, [llmMutation])

  const shortcuts = useMemo(
    () => [
      { key: "s", ctrl: true, handler: handleSave },
      {
        key: "ArrowLeft",
        alt: true,
        handler: () => {
          if (adjacent?.prev_id) navigate(`/pages/${adjacent.prev_id}/edit`)
        },
      },
      {
        key: "ArrowRight",
        alt: true,
        handler: () => {
          if (adjacent?.next_id) navigate(`/pages/${adjacent.next_id}/edit`)
        },
      },
    ],
    [handleSave, adjacent, navigate]
  )

  const runSpellcheck = useCallback((textToCheck: string) => {
    const requestId = ++spellRequestRef.current
    spellcheckText(textToCheck).then((errors) => {
      if (spellRequestRef.current === requestId) {
        setSpellErrors(errors)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setSpellErrors([])
    setSelection(null)
    runSpellcheck(page.text)

    return () => { clearTimeout(spellDebounceRef.current) }
  }, [page.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText)
      clearTimeout(spellDebounceRef.current)
      spellDebounceRef.current = window.setTimeout(() => {
        runSpellcheck(newText)
      }, 1500)
    },
    [runSpellcheck]
  )

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        <TextPanel
          text={text}
          onChange={handleTextChange}
          onSave={handleSave}
          onCorrect={handleCorrect}
          isCorrectingLLM={llmMutation.isPending}
          isDark={isDark}
          readOnly={isLocked}
          onNavigatePrev={() => {
            if (adjacent?.prev_id) navigate(`/pages/${adjacent.prev_id}/edit`)
          }}
          onNavigateNext={() => {
            if (adjacent?.next_id) navigate(`/pages/${adjacent.next_id}/edit`)
          }}
          onSelectionChange={setSelection}
          spellErrors={spellErrors}
        />
        <ImagePanel imageUrl={page.image} ocrData={page.ocr_data} selection={selection} spellErrors={spellErrors} />
      </div>

      <UnifiedBottomBar
        page={page}
        adjacent={adjacent}
        status={status}
        numberInBook={numberInBook}
        onStatusChange={setStatus}
        onNumberInBookChange={setNumberInBook}
        onSave={handleSave}
        onSaveAndNext={handleSaveAndNext}
        isSaving={updateMutation.isPending}
        isLocked={isLocked}
      />

      <KeyboardShortcutsPanel />
    </div>
  )
}
