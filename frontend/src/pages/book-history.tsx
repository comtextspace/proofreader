import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HistoryTable } from "@/components/history/history-table"
import { Pagination } from "@/components/ui/pagination"
import { useBook, useBookHistory } from "@/hooks/use-books"
import type { PageHistory, BookPageHistory } from "@/types/models"

const LIMIT = 50

export function BookHistoryPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)

  const { data: book } = useBook(bookId!)
  const { data, isLoading } = useBookHistory(bookId!, { limit: LIMIT, offset })

  const extraColumns = [{ key: "page_number", label: "Страница" }]

  function renderExtraCell(record: PageHistory, columnKey: string) {
    if (columnKey === "page_number") {
      const r = record as BookPageHistory
      return (
        <button
          className="text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/pages/${r.page_id}/edit`)
          }}
        >
          {r.page_number}
        </button>
      )
    }
    return null
  }

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/books/${bookId}/pages`)}>
          <ArrowLeft className="h-4 w-4" />
          {book?.name || "Книга"}
        </Button>
        <h1 className="text-lg font-semibold">История изменений</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <HistoryTable
            records={data?.results || []}
            extraColumns={extraColumns}
            renderExtraCell={renderExtraCell}
          />
          {data && (
            <Pagination offset={offset} limit={LIMIT} total={data.count} onPageChange={setOffset} />
          )}
        </>
      )}
      </div>
    </div>
  )
}
