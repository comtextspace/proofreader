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
    <div className="mx-auto h-full max-w-3xl space-y-8 overflow-auto p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="space-y-4 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <p className="mt-1 text-sm font-medium">{user?.username ?? "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Groups</label>
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

      <section className="space-y-4 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Assignments</h2>
        {assignmentsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assignments yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Book</th>
                  <th className="px-4 py-3 text-left font-medium">Pages</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
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
