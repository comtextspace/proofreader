import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { TextPanel } from "./text-panel"
import { ImagePanel } from "./image-panel"
import { MetadataPanel } from "./metadata-panel"
import { NavigationBar } from "./navigation-bar"
import { KeyboardShortcutsPanel } from "./keyboard-shortcuts-panel"
import { useLLMCorrection, usePageAdjacent, useUpdatePage } from "@/hooks/use-pages"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useUIStore } from "@/stores/ui-store"
import type { PageDetail } from "@/types/models"

interface PageEditorProps {
  page: PageDetail
}

export function PageEditor({ page }: PageEditorProps) {
  const navigate = useNavigate()
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === "dark"

  const [text, setText] = useState(page.text)
  const [status, setStatus] = useState<string>(page.status)
  const [numberInBook, setNumberInBook] = useState(page.number_in_book ?? "")

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

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="flex h-full flex-col">
      <NavigationBar
        page={page}
        adjacent={adjacent}
        onSave={handleSave}
        onSaveAndNext={handleSaveAndNext}
        isSaving={updateMutation.isPending}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        <TextPanel
          text={text}
          onChange={setText}
          onSave={handleSave}
          onCorrect={handleCorrect}
          isCorrectingLLM={llmMutation.isPending}
          isDark={isDark}
        />
        <ImagePanel imageUrl={page.image} />
      </div>

      <div className="px-4 pb-4">
        <MetadataPanel
          page={page}
          status={status}
          numberInBook={numberInBook}
          onStatusChange={setStatus}
          onNumberInBookChange={setNumberInBook}
        />
      </div>

      <KeyboardShortcutsPanel />
    </div>
  )
}
