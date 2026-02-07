import { useQuery } from "@tanstack/react-query"
import { fetchBooks } from "@/api/books"

export function useBooks(search?: string) {
  return useQuery({
    queryKey: ["books", search],
    queryFn: () => fetchBooks({ search }),
  })
}
