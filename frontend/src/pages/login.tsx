import { useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"

export function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuth()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean })?.registered
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  if (isAuthenticated) {
    return <Navigate to="/pages" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login(username, password).catch(() => {})
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-body p-4 dark:bg-background">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-warning/5 blur-3xl" />

      <Card className="relative z-10 w-full max-w-md shadow-primary-lg">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-primary-sm">
            <BookOpen className="h-7 w-7 text-white animate-logo-spin" />
          </div>
          <CardTitle className="text-2xl">Proofreader</CardTitle>
          <p className="text-sm text-muted-foreground">Войдите в свой аккаунт</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {registered && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Регистрация прошла успешно. Теперь вы можете войти.
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Имя пользователя
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full bg-gradient-primary shadow-primary-sm hover:shadow-primary-lg transition-all duration-300 hover:-translate-y-0.5" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
