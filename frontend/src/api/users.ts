import apiClient from "./client"
import type { Assignment, User } from "@/types/models"

export async function fetchProfile(): Promise<User> {
  const response = await apiClient.get("/users/me/")
  return response.data
}

export async function updateProfile(data: { text_size?: number }): Promise<User> {
  const response = await apiClient.patch("/users/me/", data)
  return response.data
}

export async function fetchAssignments(): Promise<Assignment[]> {
  const response = await apiClient.get("/users/me/assignments/")
  return response.data.results ?? response.data
}

export async function createAssignment(data: { book: string; pages: string }): Promise<Assignment> {
  const response = await apiClient.post("/users/me/assignments/", data)
  return response.data
}

export async function deleteAssignment(id: number): Promise<void> {
  await apiClient.delete(`/users/me/assignments/${id}`)
}
