import apiClient from "./client"
import type {
  PageAdjacent,
  PageDetail,
  PageHistory,
  PageListItem,
  PaginatedResponse,
  SpellError,
} from "@/types/models"

export interface PageListParams {
  book?: string
  status?: string
  assigned?: boolean
  ordering?: string
  search?: string
  limit?: number
  offset?: number
}

export async function fetchPages(params: PageListParams): Promise<PaginatedResponse<PageListItem>> {
  const response = await apiClient.get("/pages/", { params })
  return response.data
}

export async function fetchPage(id: string): Promise<PageDetail> {
  const response = await apiClient.get(`/pages/${id}`)
  return response.data
}

export async function updatePage(
  id: string,
  data: { text?: string; status?: string; number_in_book?: string | null }
): Promise<PageDetail> {
  const response = await apiClient.patch(`/pages/${id}`, data)
  return response.data
}

export async function fetchAdjacent(id: string): Promise<PageAdjacent> {
  const response = await apiClient.get(`/pages/${id}/adjacent`)
  return response.data
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export async function fetchPageHistory(
  id: string,
  params?: PaginationParams
): Promise<PaginatedResponse<PageHistory>> {
  const response = await apiClient.get(`/pages/${id}/history`, { params: { limit: 50, ...params } })
  return response.data
}

export async function fetchPagePreview(id: string): Promise<{ text_preview: string }> {
  const response = await apiClient.get(`/pages/${id}/preview`)
  return response.data
}

export async function triggerLLMCorrection(id: string): Promise<{ detail: string }> {
  const response = await apiClient.post(`/pages/${id}/correct`)
  return response.data
}

export async function spellcheckText(text: string): Promise<SpellError[]> {
  const response = await apiClient.post("/pages/spellcheck", { text })
  return response.data
}
