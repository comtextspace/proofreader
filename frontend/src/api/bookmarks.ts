import apiClient from "./client"
import type { Bookmark, PaginatedResponse } from "@/types/models"

export interface BookmarkListParams {
  book?: string
}

export async function fetchBookmarks(params?: BookmarkListParams): Promise<PaginatedResponse<Bookmark>> {
  const response = await apiClient.get("/bookmarks/", { params: { limit: 100, ...params } })
  return response.data
}

export async function createBookmark(pageId: string, name?: string): Promise<Bookmark> {
  const response = await apiClient.post("/bookmarks/", { page: pageId, ...(name ? { name } : {}) })
  return response.data
}

export async function updateBookmark(id: string, name: string): Promise<Bookmark> {
  const response = await apiClient.patch(`/bookmarks/${id}`, { name })
  return response.data
}

export async function deleteBookmark(id: string): Promise<void> {
  await apiClient.delete(`/bookmarks/${id}`)
}
