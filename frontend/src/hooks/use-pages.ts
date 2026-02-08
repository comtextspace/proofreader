import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchAdjacent,
  fetchPage,
  fetchPageHistory,
  fetchPages,
  triggerLLMCorrection,
  updatePage,
} from "@/api/pages"
import type { PageListParams } from "@/api/pages"

export function usePages(params: PageListParams) {
  return useQuery({
    queryKey: ["pages", params],
    queryFn: () => fetchPages(params),
  })
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ["page", id],
    queryFn: () => fetchPage(id),
    enabled: !!id,
  })
}

export function usePageAdjacent(id: string) {
  return useQuery({
    queryKey: ["page-adjacent", id],
    queryFn: () => fetchAdjacent(id),
    enabled: !!id,
  })
}

export function usePageHistory(id: string) {
  return useQuery({
    queryKey: ["page-history", id],
    queryFn: () => fetchPageHistory(id),
    enabled: !!id,
  })
}

export function useUpdatePage(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { text?: string; status?: string; number_in_book?: string | null }) =>
      updatePage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", id] })
      queryClient.invalidateQueries({ queryKey: ["pages"] })
    },
  })
}

export function useLLMCorrection(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => triggerLLMCorrection(id),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["page", id] })
      }, 3000)
    },
  })
}
