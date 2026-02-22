import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HistoryTable } from "@/components/history/history-table"
import { Pagination } from "@/components/ui/pagination"
import { usePage, usePageHistory } from "@/hooks/use-pages"

const LIMIT = 50

export function PageHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)

  const { data: page } = usePage(id!)
  const { data, isLoading } = usePageHistory(id!, { limit: LIMIT, offset })

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/pages/${id}/edit`)}>
          <ArrowLeft className="h-4 w-4" />
          {page ? `${page.book.name} — стр. ${page.number}` : "Страница"}
        </Button>
        <h1 className="text-lg font-semibold">История изменений</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <HistoryTable records={data?.results || []} />
          {data && (
            <Pagination offset={offset} limit={LIMIT} total={data.count} onPageChange={setOffset} />
          )}
        </>
      )}
      </div>
    </div>
  )
}
