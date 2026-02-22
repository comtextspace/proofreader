import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { HistoryTable } from "@/components/history/history-table"
import { Pagination } from "@/components/ui/pagination"
import { useUserHistory } from "@/hooks/use-user-history"
import type { PageHistory, UserHistory } from "@/types/models"

const LIMIT = 50

export function UserHistoryPage() {
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = useUserHistory({ limit: LIMIT, offset })

  const extraColumns = [
    { key: "book_name", label: "Книга" },
    { key: "page_number", label: "Страница" },
  ]

  function renderExtraCell(record: PageHistory, columnKey: string) {
    const r = record as UserHistory
    if (columnKey === "book_name") {
      return (
        <button
          className="text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/books/${r.book_id}/pages`)
          }}
        >
          {r.book_name}
        </button>
      )
    }
    if (columnKey === "page_number") {
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
      <h1 className="mb-6 text-lg font-semibold">Мои изменения</h1>

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
