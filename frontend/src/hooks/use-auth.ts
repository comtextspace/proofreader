import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { login as loginApi } from "@/api/auth"
import { fetchProfile } from "@/api/users"
import { useAuthStore } from "@/stores/auth-store"

export function useAuth() {
  const navigate = useNavigate()
  const { setTokens, setUser, logout: storeLogout, isAuthenticated, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(username: string, password: string) {
    setIsLoading(true)
    setError(null)
    try {
      const tokens = await loginApi(username, password)
      setTokens(tokens.access, tokens.refresh)
      const profile = await fetchProfile()
      setUser(profile)
      navigate("/books")
    } catch (err: unknown) {
      let message = "Неверные данные"
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          message = "Неверное имя пользователя или пароль"
        } else if (err.response?.data?.detail) {
          message = err.response.data.detail
        } else if (!err.response) {
          message = "Не удалось подключиться к серверу"
        }
      }
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    storeLogout()
    navigate("/login")
  }

  async function loadProfile() {
    try {
      const profile = await fetchProfile()
      setUser(profile)
    } catch {
      storeLogout()
    }
  }

  return { login, logout, loadProfile, isLoading, error, isAuthenticated, user }
}
