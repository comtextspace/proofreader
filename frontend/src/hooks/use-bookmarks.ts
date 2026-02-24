import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBookmark, deleteBookmark, fetchBookmarks, updateBookmark } from "@/api/bookmarks"

export function useBookmarks(bookId?: string) {
  return useQuery({
    queryKey: ["bookmarks", bookId],
    queryFn: () => fetchBookmarks(bookId ? { book: bookId } : undefined),
  })
}

export function useCreateBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pageId, name }: { pageId: string; name?: string }) => createBookmark(pageId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      queryClient.invalidateQueries({ queryKey: ["page"] })
    },
  })
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateBookmark(id, name),
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
