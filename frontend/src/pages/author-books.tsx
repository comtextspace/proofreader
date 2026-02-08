import { useNavigate, useParams } from "react-router-dom"
import { BookOpen, CheckCircle2, ChevronRight, FileText } from "lucide-react"
import { useAuthor } from "@/hooks/use-authors"
import { useBooks } from "@/hooks/use-books"
import { StatsCard } from "@/components/ui/stats-card"
import { ProgressBar } from "@/components/ui/progress-bar"

function getBookStatus(book: { pages_count: number; pages_done_count: number }, pagesProcessing: boolean): { label: string; className: string } {
  if (book.pages_count === 0) {
    return { label: "Пустая", className: "bg-muted text-muted-foreground" }
  }
  if (pagesProcessing) {
    return { label: "Обработка", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
  }
  if (book.pages_done_count === book.pages_count) {
    return { label: "Готово", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
  }
  return { label: "В работе", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" }
}

export function AuthorBooksPage() {
  const { authorId } = useParams<{ authorId: string }>()
  const navigate = useNavigate()
  const { data: author, isLoading: authorLoading } = useAuthor(authorId!)
  const { data: booksData, isLoading: booksLoading } = useBooks({ author: authorId })

  const isLoading = authorLoading || booksLoading

  const totalPages = booksData?.results.reduce((acc, b) => acc + b.pages_count, 0) ?? 0
  const totalDone = booksData?.results.reduce((acc, b) => acc + b.pages_done_count, 0) ?? 0
  const overallProgress = totalPages > 0 ? Math.round((totalDone / totalPages) * 100) : 0

  return (
    <div className="mx-auto h-full max-w-6xl space-y-6 overflow-auto p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/authors")} className="hover:text-primary transition-colors">
          Авторы
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{author?.name ?? "..."}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{author?.name ?? "Загрузка..."}</h1>
        <p className="text-sm text-muted-foreground">
          {booksData ? `${booksData.count} книг` : "Загрузка..."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard icon={BookOpen} label="Книги" value={booksData?.count ?? 0} />
        <StatsCard icon={FileText} label="Страницы" value={totalPages} />
        <StatsCard icon={CheckCircle2} label="Готово" value={`${totalDone} / ${totalPages}`} subtitle={`${overallProgress}%`} />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : booksData?.results.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          Книг пока нет.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-primary text-white">
                <th className="px-4 py-3 text-left font-semibold">Книга</th>
                <th className="px-4 py-3 text-left font-semibold">Статус</th>
                <th className="px-4 py-3 text-left font-semibold">Страницы</th>
                <th className="px-4 py-3 text-left font-semibold">Готово</th>
                <th className="px-4 py-3 text-left font-semibold">Прогресс</th>
                <th className="px-4 py-3 text-left font-semibold">Всего в PDF</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {booksData?.results.map((book) => {
                const status = getBookStatus(book, false)
                return (
                  <tr
                    key={book.id}
                    className="cursor-pointer border-b transition-all duration-200 hover:bg-primary/5"
                    onClick={() => navigate(`/books/${book.id}/pages`)}
                  >
                    <td className="px-4 py-3 font-medium">{book.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{book.pages_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{book.pages_done_count}</td>
                    <td className="px-4 py-3 w-32">
                      <ProgressBar
                        value={book.pages_count > 0 ? (book.pages_done_count / book.pages_count) * 100 : 0}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{book.total_pages_in_pdf ?? "-"}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
