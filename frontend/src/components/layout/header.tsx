import { useEffect, useRef, useState } from "react"
import { BookOpen, ChevronDown, FileText, History, LogOut, Moon, Settings, Sun } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme } = useUIStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  function toggleTheme() {
    if (theme === "dark") setTheme("light")
    else setTheme("dark")
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-primary shadow-primary-sm">
      <div className="flex h-16 items-center px-6">
        <Link to="/books" className="flex items-center gap-2 font-semibold text-white">
          <BookOpen className="h-5 w-5" />
          <span>Proofreader</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Переключить тему" className="text-white/80 hover:text-white hover:bg-white/10">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                {user.username}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 overflow-hidden rounded-lg border bg-popover shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-accent"
                    onClick={() => { navigate("/assignments"); setDropdownOpen(false) }}
                  >
                    <FileText className="h-4 w-4" />
                    Мои назначения
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-accent"
                    onClick={() => { navigate("/my-history"); setDropdownOpen(false) }}
                  >
                    <History className="h-4 w-4" />
                    Мои изменения
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-accent"
                    onClick={() => { navigate("/settings"); setDropdownOpen(false) }}
                  >
                    <Settings className="h-4 w-4" />
                    Настройки
                  </button>
                </div>
              )}
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={logout} title="Выйти" className="text-white/80 hover:text-white hover:bg-white/10">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
