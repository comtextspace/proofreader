import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Loader2 as LoaderIcon,
  ScanEye,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { PageHeatmap } from "@/components/pages/page-heatmap"
import { StatsCard } from "@/components/ui/stats-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { useBook } from "@/hooks/use-books"
import { usePages } from "@/hooks/use-pages"
import { useAuthStore } from "@/stores/auth-store"
import { downloadBookText, downloadBookPdf, downloadBookEpub } from "@/api/books"
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants"

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function BookPagesPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: book } = useBook(bookId!)

  const [status, setStatus] = useState("")
  const [assigned, setAssigned] = useState(searchParams.get("assigned") === "true")
  const [search, setSearch] = useState("")

  const { data, isLoading } = usePages({
    book: bookId,
    status: status || undefined,
    assigned: assigned || undefined,
    search: search || undefined,
    limit: 9999,
    ordering: "number",
  })

  const statusOptions = ALL_STATUSES.map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  }))

  async function handleDownload(format: "text" | "pdf" | "epub") {
    if (!book) return
    const name = book.export_name || book.name
    if (format === "text") {
      const blob = await downloadBookText(bookId!)
      triggerDownload(blob, `${name}.md`)
    } else if (format === "pdf") {
      const blob = await downloadBookPdf(bookId!)
      triggerDownload(blob, `${name}.pdf`)
    } else {
      const blob = await downloadBookEpub(bookId!)
      triggerDownload(blob, `${name}.epub`)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-6xl shrink-0 space-y-6 px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate("/books")} className="hover:text-primary transition-colors">
            Книги
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{book?.name ?? "..."}</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{book?.name ?? "Загрузка..."}</h1>
          {user?.is_admin && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload("text")}>
                <Download className="mr-1 h-3.5 w-3.5" />
                Текст
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("pdf")}>
                <Download className="mr-1 h-3.5 w-3.5" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("epub")}>
                <Download className="mr-1 h-3.5 w-3.5" />
                EPUB
              </Button>
            </div>
          )}
        </div>

        {book && (
          <>
            <ProgressBar
              value={book.pages_count > 0 ? (book.pages_done_count / book.pages_count) * 100 : 0}
              label="Общий прогресс"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatsCard icon={FileText} label="Всего страниц" value={book.pages_count} />
              <StatsCard icon={CheckCircle2} label="Готово" value={book.pages_done_count} />
              <StatsCard icon={Clock} label="В работе" value={book.pages_in_work_count} />
              <StatsCard icon={ScanEye} label="Распознано" value={book.pages_recognized_count} />
              <StatsCard icon={LoaderIcon} label="В обработке" value={book.pages_processing_count} />
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск страниц..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-9"
            />
          </div>

          <Select
            options={statusOptions}
            placeholder="Все статусы"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-40"
          />

          <Button
            variant={assigned ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigned(!assigned)}
          >
            Мои страницы
          </Button>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6 overflow-auto px-6 py-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data?.results.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Страницы не найдены.
          </div>
        ) : (
          <PageHeatmap pages={data?.results ?? []} />
        )}
      </div>
    </div>
  )
}
