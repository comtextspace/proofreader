import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchPages } from "@/api/pages"
import type { PageAdjacent, PageDetail } from "@/types/models"

interface NavigationBarProps {
  page: PageDetail
  adjacent: PageAdjacent | undefined
  onSave: () => void
  onSaveAndNext: () => void
  isSaving: boolean
}

export function NavigationBar({ page, adjacent, onSave, onSaveAndNext, isSaving }: NavigationBarProps) {
  const navigate = useNavigate()
  const [goToPage, setGoToPage] = useState("")

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
    <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/books/${page.book.id}/pages`)}>
        <ArrowLeft className="h-4 w-4" />
        {page.book.name}
      </Button>

      <span className="text-sm text-muted-foreground">
        / Страница {page.number}
      </span>

      <div className="mx-2 h-5 w-px bg-border" />

      <form onSubmit={handleGoToPage} className="flex items-center gap-1">
        <Input
          value={goToPage}
          onChange={(e) => setGoToPage(e.target.value)}
          placeholder="К стр. #"
          className="h-7 w-20 text-xs"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjacent?.prev_id && navigate(`/pages/${adjacent.prev_id}/edit`)}
          disabled={!adjacent?.prev_id}
          title="Предыдущая (Alt+Left)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => adjacent?.next_id && navigate(`/pages/${adjacent.next_id}/edit`)}
          disabled={!adjacent?.next_id}
          title="Следующая (Alt+Right)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-gradient-primary shadow-primary-sm hover:shadow-primary-lg">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Сохранить
        </Button>

        {adjacent?.next_id && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onSaveAndNext}
            disabled={isSaving}
            className="bg-gradient-warning text-warning-foreground hover:shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Сохранить и далее
          </Button>
        )}
      </div>
    </div>
  )
}
