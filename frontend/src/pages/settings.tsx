import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth-store"

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)

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
    </div>
  )
}
