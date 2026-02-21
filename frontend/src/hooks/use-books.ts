import { useQuery } from "@tanstack/react-query"
import { fetchBook, fetchBookHistory, fetchBooks } from "@/api/books"
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

export function useBookHistory(bookId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["book-history", bookId, params],
    queryFn: () => fetchBookHistory(bookId, params),
    enabled: !!bookId,
  })
}
