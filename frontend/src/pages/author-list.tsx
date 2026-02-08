import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuthors } from "@/hooks/use-authors"

export function AuthorListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const { data, isLoading } = useAuthors({ search: search || undefined })

  return (
    <div className="mx-auto h-full max-w-4xl space-y-6 overflow-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Authors</h1>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.count} authors` : "Loading..."}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search authors..."
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
          No authors found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Books</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.results.map((author) => (
                <tr
                  key={author.id}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/50"
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
