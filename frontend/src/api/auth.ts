import axios from "axios"
import type { TokenPair } from "@/types/models"

export async function login(username: string, password: string): Promise<TokenPair> {
  const response = await axios.post("/api/v1/users/token/", { username, password })
  return response.data
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const response = await axios.post("/api/v1/users/token/refresh/", { refresh })
  return response.data
}

export interface RegisterData {
  username: string
  password: string
  password_confirm: string
  code: string
}

export async function register(data: RegisterData): Promise<void> {
  await axios.post("/api/v1/users/register/", data)
}
