import apiClient from "./client"
import type {
  PageAdjacent,
  PageDetail,
  PageHistory,
  PageListItem,
  PaginatedResponse,
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

export async function fetchPageHistory(id: string): Promise<PageHistory[]> {
  const response = await apiClient.get(`/pages/${id}/history`)
  return response.data
}

export async function triggerLLMCorrection(id: string): Promise<{ detail: string }> {
  const response = await apiClient.post(`/pages/${id}/correct`)
  return response.data
}
