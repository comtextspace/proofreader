import { useNavigate } from "react-router-dom"
import { StatusBadge } from "./status-badge"
import type { PageListItem } from "@/types/models"

interface PageTableProps {
  pages: PageListItem[]
  isLoading: boolean
}

export function PageTable({ pages, isLoading }: PageTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Страницы не найдены. Попробуйте изменить фильтры.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-primary text-white">
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Книга</th>
            <th className="px-4 py-3 text-left font-semibold">Стр. в книге</th>
            <th className="px-4 py-3 text-left font-semibold">Статус</th>
            <th className="px-4 py-3 text-left font-semibold">Изменено</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr
              key={page.id}
              className="border-b transition-all duration-200 hover:bg-primary/5 cursor-pointer"
              onClick={() => navigate(`/pages/${page.id}/edit`)}
            >
              <td className="px-4 py-3 font-mono">{page.number}</td>
              <td className="px-4 py-3">{page.book_name}</td>
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
  )
}
