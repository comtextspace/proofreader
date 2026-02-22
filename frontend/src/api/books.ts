import apiClient from "./client"
import type { BookDetail, BookList, BookPageHistory, PaginatedResponse } from "@/types/models"

export interface BookListParams {
  search?: string
  author?: string
  ordering?: string
  limit?: number
  offset?: number
}

export async function fetchBooks(params?: BookListParams): Promise<PaginatedResponse<BookList>> {
  const response = await apiClient.get("/book-list/", { params: { limit: 100, ...params } })
  return response.data
}

export async function fetchBook(id: string): Promise<BookDetail> {
  const response = await apiClient.get(`/book-list/${id}`)
  return response.data
}

export async function downloadBookText(id: string): Promise<Blob> {
  const response = await apiClient.get(`/book-list/${id}/download-text`, { responseType: "blob" })
  return response.data
}

export async function downloadBookPdf(id: string): Promise<Blob> {
  const response = await apiClient.get(`/book-list/${id}/download-pdf`, { responseType: "blob" })
  return response.data
}

export async function downloadBookEpub(id: string): Promise<Blob> {
  const response = await apiClient.get(`/book-list/${id}/download-epub`, { responseType: "blob" })
  return response.data
}

export async function fetchBookHistory(
  id: string,
  params?: { limit?: number; offset?: number }
): Promise<PaginatedResponse<BookPageHistory>> {
  const response = await apiClient.get(`/book-list/${id}/history`, { params: { limit: 50, ...params } })
  return response.data
}
