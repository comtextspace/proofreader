import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth-store"
import { fetchAssignments } from "@/api/users"
import type { Assignment } from "@/types/models"

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
      .then(setAssignments)
      .finally(() => setAssignmentsLoading(false))
  }, [])

  return (
    <div className="mx-auto h-full max-w-6xl space-y-8 overflow-auto p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {user?.username?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.username ?? "..."}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.groups.length ? user.groups.join(", ") : "Нет групп"}
          </p>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 transition-shadow duration-300 hover:shadow-md">
        <h2 className="text-lg font-semibold">Профиль</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Имя пользователя</label>
            <p className="mt-1 text-sm font-medium">{user?.username ?? "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Группы</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {user?.groups.length ? (
                user.groups.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5 transition-shadow duration-300 hover:shadow-md">
        <h2 className="text-lg font-semibold">Назначения</h2>
        {assignmentsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Назначений пока нет.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-primary text-white">
                  <th className="px-4 py-3 text-left font-semibold">Книга</th>
                  <th className="px-4 py-3 text-left font-semibold">Страницы</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-b transition-all duration-200 hover:bg-primary/5"
                    onClick={() => navigate(`/books/${a.book_id}/pages?assigned=true`)}
                  >
                    <td className="px-4 py-3 font-medium">{a.book_name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a.pages}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
