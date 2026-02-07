import apiClient from "./client"
import type { BookList, PaginatedResponse } from "@/types/models"

export async function fetchBooks(params?: { search?: string }): Promise<PaginatedResponse<BookList>> {
  const response = await apiClient.get("/book-list/", { params: { ...params, limit: 100 } })
  return response.data
}
