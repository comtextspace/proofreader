import apiClient from "./client"
import type { Author, PaginatedResponse } from "@/types/models"

export interface AuthorListParams {
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}

export async function fetchAuthors(params?: AuthorListParams): Promise<PaginatedResponse<Author>> {
  const response = await apiClient.get("/authors/", { params: { limit: 100, ...params } })
  return response.data
}

export async function fetchAuthor(id: string): Promise<Author> {
  const response = await apiClient.get(`/authors/${id}`)
  return response.data
}
