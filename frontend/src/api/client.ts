import axios from "axios"
import { useAuthStore } from "@/stores/auth-store"

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        useAuthStore.getState().logout()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
        const response = await axios.post("/api/v1/users/token/refresh/", {
          refresh: refreshToken,
        })
        const { access } = response.data
        useAuthStore.getState().setTokens(access, refreshToken)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
