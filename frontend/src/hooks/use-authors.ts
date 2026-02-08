import { useQuery } from "@tanstack/react-query"
import { fetchAuthor, fetchAuthors } from "@/api/authors"
import type { AuthorListParams } from "@/api/authors"

export function useAuthors(params?: AuthorListParams) {
  return useQuery({
    queryKey: ["authors", params],
    queryFn: () => fetchAuthors(params),
  })
}

export function useAuthor(id: string) {
  return useQuery({
    queryKey: ["authors", id],
    queryFn: () => fetchAuthor(id),
    enabled: !!id,
  })
}
