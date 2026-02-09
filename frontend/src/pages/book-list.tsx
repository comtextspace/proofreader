import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ProgressBar } from "@/components/ui/progress-bar"
import { useBooks } from "@/hooks/use-books"
import { useAuthors } from "@/hooks/use-authors"
import { getBookStatus } from "@/lib/utils"

export function BookListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [authorFilter, setAuthorFilter] = useState("")

  const { data: authorsData } = useAuthors()
  const { data: booksData, isLoading } = useBooks({
    author: authorFilter || undefined,
    search: search || undefined,
  })

  const totalPages = booksData?.results.reduce((acc, b) => acc + b.pages_count, 0) ?? 0
  const totalDone = booksData?.results.reduce((acc, b) => acc + b.pages_done_count, 0) ?? 0

  const authorOptions = (authorsData?.results ?? []).map((a) => ({
    value: a.id,
    label: a.name,
  }))

  return (
    <div className="mx-auto h-full max-w-6xl space-y-6 overflow-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Книги</h1>
        <p className="text-sm text-muted-foreground">
          {booksData ? `${booksData.count} книг` : "Загрузка..."}
          {totalPages > 0 && (
            <span className="ml-2">
              &middot; {Math.round((totalDone / totalPages) * 100)}% завершено
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск книг..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9"
          />
        </div>
        <Select
          options={authorOptions}
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          placeholder="Все авторы"
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : booksData?.results.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          Книги не найдены.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-primary text-white">
                <th className="px-4 py-3 text-left font-semibold">Книга</th>
                <th className="px-4 py-3 text-left font-semibold">Автор</th>
                <th className="px-4 py-3 text-left font-semibold">Статус</th>
                <th className="px-4 py-3 text-left font-semibold">Страницы</th>
                <th className="px-4 py-3 text-left font-semibold">Прогресс</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {booksData?.results.map((book) => {
                const status = getBookStatus(book, false)
                const progress = book.pages_count > 0 ? (book.pages_done_count / book.pages_count) * 100 : 0
                return (
                  <tr
                    key={book.id}
                    className="cursor-pointer border-b transition-all duration-200 hover:bg-primary/5"
                    onClick={() => navigate(`/books/${book.id}/pages`)}
                  >
                    <td className="px-4 py-3 font-medium">{book.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{book.author}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{book.pages_count}</td>
                    <td className="px-4 py-3 w-32">
                      <div title={`${book.pages_done_count} / ${book.pages_count} готово`}>
                        <ProgressBar value={progress} />
                      </div>
                    </td>
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
