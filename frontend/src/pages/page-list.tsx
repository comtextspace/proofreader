import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageFilters } from "@/components/pages/page-filters"
import { PageTable } from "@/components/pages/page-table"
import { usePages } from "@/hooks/use-pages"
import { PAGE_SIZE } from "@/lib/constants"

export function PageListPage() {
  const [searchParams] = useSearchParams()
  const [book, setBook] = useState("")
  const [status, setStatus] = useState("")
  const [assigned, setAssigned] = useState(searchParams.get("assigned") === "true")
  const [search, setSearch] = useState("")
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = usePages({
    book: book || undefined,
    status: status || undefined,
    assigned: assigned || undefined,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
    ordering: "book__name,number",
  })

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value)
      setOffset(0)
    }
  }

  return (
    <div className="mx-auto h-full max-w-7xl space-y-6 overflow-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Страницы</h1>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.count} стр. всего` : "Загрузка..."}
        </p>
      </div>

      <PageFilters
        book={book}
        status={status}
        assigned={assigned}
        search={search}
        onBookChange={handleFilterChange(setBook)}
        onStatusChange={handleFilterChange(setStatus)}
        onAssignedChange={(v) => { setAssigned(v); setOffset(0) }}
        onSearchChange={handleFilterChange(setSearch)}
      />

      <PageTable pages={data?.results ?? []} isLoading={isLoading} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={!data?.next}
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
