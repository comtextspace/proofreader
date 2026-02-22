import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bookmark, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookmarks, useDeleteBookmark } from "@/hooks/use-bookmarks"
import type { Bookmark as BookmarkType } from "@/types/models"

interface BookmarksSidebarProps {
  bookId?: string
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [breakpoint])
  return isMobile
}

export function BookmarksSidebar({ bookId }: BookmarksSidebarProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(isMobile)
  const { data } = useBookmarks(bookId)
  const deleteMutation = useDeleteBookmark()

  const bookmarks = data?.results ?? []

  const grouped = bookmarks.reduce<Record<string, { bookName: string; items: BookmarkType[] }>>((acc, bm) => {
    if (!acc[bm.book_id]) {
      acc[bm.book_id] = { bookName: bm.book_name, items: [] }
    }
    acc[bm.book_id].items.push(bm)
    return acc
  }, {})

  if (collapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center border-l bg-background py-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setCollapsed(false)}
          title="Показать закладки"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="mt-2 flex flex-col items-center gap-1">
          <Bookmark className="h-4 w-4 text-amber-500" />
          {bookmarks.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{bookmarks.length}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-64 shrink-0 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Bookmark className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Закладки</span>
          {bookmarks.length > 0 && (
            <span className="text-xs text-muted-foreground">({bookmarks.length})</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setCollapsed(true)}
          title="Свернуть"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {bookmarks.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
            Нет закладок
          </div>
        ) : bookId ? (
          <div className="py-1">
            {bookmarks.map((bm) => (
              <BookmarkItem
                key={bm.id}
                bookmark={bm}
                onNavigate={() => navigate(`/pages/${bm.page}/edit`)}
                onDelete={() => deleteMutation.mutate(bm.id)}
                showBook={false}
              />
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([id, group]) => (
            <div key={id} className="border-b last:border-b-0">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {group.bookName}
              </div>
              {group.items.map((bm) => (
                <BookmarkItem
                  key={bm.id}
                  bookmark={bm}
                  onNavigate={() => navigate(`/pages/${bm.page}/edit`)}
                  onDelete={() => deleteMutation.mutate(bm.id)}
                  showBook={false}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function BookmarkItem({
  bookmark,
  onNavigate,
  onDelete,
  showBook,
}: {
  bookmark: BookmarkType
  onNavigate: () => void
  onDelete: () => void
  showBook: boolean
}) {
  return (
    <div className="group flex items-center gap-1 px-3 py-1 hover:bg-muted/50">
      <button
        className="flex-1 text-left text-xs hover:text-primary"
        onClick={onNavigate}
      >
        <span>Стр. {bookmark.page_number}</span>
        {showBook && (
          <span className="ml-1 text-muted-foreground">({bookmark.book_name})</span>
        )}
      </button>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 shrink-0 p-0 opacity-0 group-hover:opacity-100"
        onClick={onDelete}
        title="Удалить закладку"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
