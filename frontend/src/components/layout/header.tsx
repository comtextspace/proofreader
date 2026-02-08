import { BookOpen, LogOut, Moon, Settings, Sun } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme } = useUIStore()

  function toggleTheme() {
    if (theme === "dark") setTheme("light")
    else setTheme("dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-primary shadow-primary-sm">
      <div className="flex h-16 items-center px-6">
        <Link to="/authors" className="flex items-center gap-2 font-semibold text-white">
          <BookOpen className="h-5 w-5" />
          <span>Корректор</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Переключить тему" className="text-white/80 hover:text-white hover:bg-white/10">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link to="/settings">
            <Button variant="ghost" size="icon" title="Настройки" className="text-white/80 hover:text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {user && (
            <span className="text-sm text-white/70">{user.username}</span>
          )}

          <Button variant="ghost" size="icon" onClick={logout} title="Выйти" className="text-white/80 hover:text-white hover:bg-white/10">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
