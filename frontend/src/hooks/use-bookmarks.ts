import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBookmark, deleteBookmark, fetchBookmarks } from "@/api/bookmarks"

export function useBookmarks(bookId?: string) {
  return useQuery({
    queryKey: ["bookmarks", bookId],
    queryFn: () => fetchBookmarks(bookId ? { book: bookId } : undefined),
  })
}

export function useCreateBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pageId: string) => createBookmark(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      queryClient.invalidateQueries({ queryKey: ["page"] })
    },
  })
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      queryClient.invalidateQueries({ queryKey: ["page"] })
    },
  })
}
