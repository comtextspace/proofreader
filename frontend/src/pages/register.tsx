import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { BookOpen, Loader2 } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { register } from "@/api/auth"
import { useAuthStore } from "@/stores/auth-store"

export function RegisterPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (isAuthenticated) {
    return <Navigate to="/pages" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    try {
      await register({ username, password, password_confirm: passwordConfirm, code })
      navigate("/login", { state: { registered: true } })
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data
        const fieldErrors: Record<string, string> = {}
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            fieldErrors[key] = value[0]
          } else if (typeof value === "string") {
            fieldErrors[key] = value
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
        } else {
          setErrors({ non_field_errors: "Ошибка регистрации" })
        }
      } else {
        setErrors({ non_field_errors: "Не удалось подключиться к серверу" })
      }
    } finally {
      setIsLoading(false)
    }
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
          <p className="text-sm text-muted-foreground">Создайте новый аккаунт</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password-confirm" className="text-sm font-medium">
                Подтверждение пароля
              </label>
              <Input
                id="password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Повторите пароль"
                required
              />
              {errors.password_confirm && (
                <p className="text-sm text-destructive">{errors.password_confirm}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Кодовое слово
              </label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите кодовое слово"
                required
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code}</p>
              )}
            </div>

            {errors.non_field_errors && (
              <p className="text-sm text-destructive">{errors.non_field_errors}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary shadow-primary-sm hover:shadow-primary-lg transition-all duration-300 hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Регистрация...
                </>
              ) : (
                "Зарегистрироваться"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
