import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, CheckCircle2, ChevronRight, FileText, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StatsCard } from "@/components/ui/stats-card"
import { useAuthors } from "@/hooks/use-authors"
import { useBooks } from "@/hooks/use-books"

export function AuthorListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const { data, isLoading } = useAuthors({ search: search || undefined })
  const { data: booksData } = useBooks()

  const totalBooks = booksData?.count ?? 0
  const totalPages = booksData?.results.reduce((acc, b) => acc + b.pages_count, 0) ?? 0
  const totalDone = booksData?.results.reduce((acc, b) => acc + b.pages_done_count, 0) ?? 0

  return (
    <div className="mx-auto h-full max-w-6xl space-y-6 overflow-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Авторы</h1>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.count} авт.` : "Загрузка..."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard icon={Users} label="Авторы" value={data?.count ?? 0} />
        <StatsCard icon={BookOpen} label="Книги" value={totalBooks} />
        <StatsCard icon={FileText} label="Страницы" value={totalPages} />
        <StatsCard
          icon={CheckCircle2}
          label="Готово"
          value={totalDone}
          subtitle={totalPages > 0 ? `${Math.round((totalDone / totalPages) * 100)}%` : ""}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск авторов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : data?.results.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          Авторы не найдены.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-primary text-white">
                <th className="px-4 py-3 text-left font-semibold">Имя</th>
                <th className="px-4 py-3 text-left font-semibold">Книги</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.results.map((author) => (
                <tr
                  key={author.id}
                  className="cursor-pointer border-b transition-all duration-200 hover:bg-primary/5"
                  onClick={() => navigate(`/authors/${author.id}/books`)}
                >
                  <td className="px-4 py-3 font-medium">{author.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{author.books_count}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
