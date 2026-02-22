import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TextSizePopover } from "./text-size-popover"
import { fetchPages } from "@/api/pages"
import { useCreateBookmark, useDeleteBookmark } from "@/hooks/use-bookmarks"
import type { PageAdjacent, PageDetail } from "@/types/models"

interface UnifiedBottomBarProps {
  page: PageDetail
  adjacent: PageAdjacent | undefined
  status: string
  numberInBook: string
  onStatusChange: (value: string) => void
  onNumberInBookChange: (value: string) => void
  onSave: () => void
  onSaveAndNext: () => void
  isSaving: boolean
  isLocked?: boolean
}

export function UnifiedBottomBar({
  page,
  adjacent,
  status,
  numberInBook,
  onStatusChange,
  onNumberInBookChange,
  onSave,
  onSaveAndNext,
  isSaving,
  isLocked,
}: UnifiedBottomBarProps) {
  const navigate = useNavigate()
  const [goToPage, setGoToPage] = useState("")

  const createBookmark = useCreateBookmark()
  const deleteBookmark = useDeleteBookmark()
  const isBookmarkLoading = createBookmark.isPending || deleteBookmark.isPending

  function handleToggleBookmark() {
    if (isBookmarkLoading) return
    if (page.is_bookmarked && page.bookmark_id) {
      deleteBookmark.mutate(page.bookmark_id)
    } else {
      createBookmark.mutate(page.id)
    }
  }

  async function handleGoToPage(e: React.FormEvent) {
    e.preventDefault()
    const query = goToPage.trim()
    if (!query) return
    const data = await fetchPages({ book: page.book.id, search: query, limit: 1 })
    if (data.results.length > 0) {
      navigate(`/pages/${data.results[0].id}/edit`)
    }
    setGoToPage("")
  }

  return (
    <div className="flex items-center gap-2 border-t bg-background px-3 py-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 text-xs"
        onClick={() => navigate(`/books/${page.book.id}/pages`)}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {page.book.name}
      </Button>

      <span className="shrink-0 text-xs text-muted-foreground">
        {page.number} / {page.total_pages}
      </span>

      <div className="mx-1 h-4 w-px bg-border" />

      <Input
        value={numberInBook}
        onChange={(e) => onNumberInBookChange(e.target.value)}
        className="h-7 w-16 shrink-0 text-xs"
        placeholder="Стр."
        title="Страница в книге"
        disabled={isLocked}
      />

      <Select
        options={page.available_statuses.map((s) => ({ value: s.value, label: s.label }))}
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-7 w-36 shrink-0 text-xs"
        disabled={isLocked}
      />

      <form onSubmit={handleGoToPage} className="flex shrink-0 items-center gap-1">
        <Input
          value={goToPage}
          onChange={(e) => setGoToPage(e.target.value)}
          placeholder="К #"
          className="h-7 w-14 text-xs"
        />
      </form>

      <TextSizePopover />

      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 shrink-0 p-0 ${page.is_bookmarked ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-foreground"}`}
        onClick={handleToggleBookmark}
        disabled={isBookmarkLoading}
        title={page.is_bookmarked ? "Убрать закладку" : "Добавить закладку"}
      >
        {page.is_bookmarked ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(`/pages/${page.id}/history`)}
        title="История изменений"
      >
        <History className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
        {new Date(page.modified).toLocaleString()}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => adjacent?.prev_id && navigate(`/pages/${adjacent.prev_id}/edit`)}
          disabled={!adjacent?.prev_id}
          title="Предыдущая (Alt+Left)"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => adjacent?.next_id && navigate(`/pages/${adjacent.next_id}/edit`)}
          disabled={!adjacent?.next_id}
          title="Следующая (Alt+Right)"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <div className="mx-1 h-4 w-px bg-border" />

        {!isLocked && (
          <>
            <Button
              size="sm"
              className="h-7 text-xs bg-gradient-primary shadow-primary-sm hover:shadow-primary-lg"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Сохранить
            </Button>
            {adjacent?.next_id && (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs bg-gradient-warning text-warning-foreground hover:shadow-md"
                onClick={onSaveAndNext}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Далее
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
