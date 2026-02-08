import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { StatusBadge } from "@/components/pages/status-badge"
import { useBook } from "@/hooks/use-books"
import { usePages } from "@/hooks/use-pages"
import { useAuthStore } from "@/stores/auth-store"
import { downloadBookText, downloadBookPdf, downloadBookEpub } from "@/api/books"
import { ALL_STATUSES, STATUS_CONFIG, PAGE_SIZE } from "@/lib/constants"

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
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = usePages({
    book: bookId,
    status: status || undefined,
    assigned: assigned || undefined,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
    ordering: "number",
  })

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

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
    <div className="mx-auto h-full max-w-6xl space-y-6 overflow-auto p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/authors")} className="hover:text-foreground">
          Authors
        </button>
        <ChevronRight className="h-3 w-3" />
        <button
          onClick={() => book && navigate(`/authors/${book.author.id}/books`)}
          className="hover:text-foreground"
        >
          {book?.author.name ?? "..."}
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{book?.name ?? "..."}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{book?.name ?? "Loading..."}</h1>
          {book && (
            <p className="text-sm text-muted-foreground">
              {book.pages_count} pages
              {book.pages_done_count > 0 && ` / ${book.pages_done_count} done`}
              {book.pages_processing_count > 0 && ` / ${book.pages_processing_count} processing`}
              {book.total_pages_in_pdf && ` / ${book.total_pages_in_pdf} in PDF`}
            </p>
          )}
        </div>
        {user?.is_admin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownload("text")}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Text
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0) }}
            className="w-48 pl-9"
          />
        </div>

        <Select
          options={statusOptions}
          placeholder="All statuses"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setOffset(0) }}
          className="w-40"
        />

        <Button
          variant={assigned ? "default" : "outline"}
          size="sm"
          onClick={() => { setAssigned(!assigned); setOffset(0) }}
        >
          My pages
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : data?.results.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          No pages found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Page in Book</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Modified</th>
              </tr>
            </thead>
            <tbody>
              {data?.results.map((page) => (
                <tr
                  key={page.id}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                  onClick={() => navigate(`/pages/${page.id}/edit`)}
                >
                  <td className="px-4 py-3 font-mono">{page.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{page.number_in_book ?? "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(page.modified).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={!data?.next}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
