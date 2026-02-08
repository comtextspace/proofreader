import { useQuery } from "@tanstack/react-query"
import { fetchBook, fetchBooks } from "@/api/books"
import type { BookListParams } from "@/api/books"

export function useBooks(params?: BookListParams) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => fetchBooks(params),
  })
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => fetchBook(id),
    enabled: !!id,
  })
}
