import { useCallback, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants"
import { fetchPagePreview } from "@/api/pages"
import type { PageListItem, PageStatus } from "@/types/models"

const STATUS_BG: Record<PageStatus, string> = {
  processing: "bg-blue-100 dark:bg-blue-400/15",
  redy: "bg-yellow-100 dark:bg-yellow-400/15",
  in_progress: "bg-orange-100 dark:bg-orange-400/15",
  formatting: "bg-purple-100 dark:bg-purple-400/15",
  check: "bg-cyan-100 dark:bg-cyan-400/15",
  done: "bg-green-100 dark:bg-green-400/15",
}

const STATUS_TEXT: Record<PageStatus, string> = {
  processing: "text-blue-700 dark:text-blue-400",
  redy: "text-yellow-700 dark:text-yellow-400",
  in_progress: "text-orange-700 dark:text-orange-400",
  formatting: "text-purple-700 dark:text-purple-400",
  check: "text-cyan-700 dark:text-cyan-400",
  done: "text-green-700 dark:text-green-400",
}

interface PageHeatmapProps {
  pages: PageListItem[]
  counts: Record<PageStatus, number>
}

export function PageHeatmap({ pages, counts }: PageHeatmapProps) {
  const navigate = useNavigate()
  const cache = useRef<Map<string, string>>(new Map())

  return (
    <div>
      <StatusBar counts={counts} />
      <div className="grid gap-1 pt-1 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(28px, 1fr))" }}>
        {pages.map((page) => (
          <PageTile
            key={page.id}
            page={page}
            cache={cache}
            onClick={() => navigate(`/pages/${page.id}/edit`)}
          />
        ))}
      </div>
    </div>
  )
}

interface PageTileProps {
  page: PageListItem
  cache: React.RefObject<Map<string, string>>
  onClick: () => void
}

function PageTile({ page, cache, onClick }: PageTileProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef(false)
  const tileRef = useRef<HTMLDivElement>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

  const colorClass = `${STATUS_BG[page.status] ?? "bg-muted"} ${STATUS_TEXT[page.status] ?? "text-muted-foreground"}`

  const updatePosition = useCallback(() => {
    if (!tileRef.current) return
    const rect = tileRef.current.getBoundingClientRect()
    const tooltipW = 448 // w-[28rem]
    const gap = 12
    const margin = 16
    const spaceRight = window.innerWidth - rect.right
    const spaceLeft = rect.left

    let left: number
    if (spaceRight >= tooltipW + gap) {
      left = rect.right + gap
    } else if (spaceLeft >= tooltipW + gap) {
      left = rect.left - tooltipW - gap
    } else {
      left = (window.innerWidth - tooltipW) / 2
    }

    // Align top of tooltip with top of tile, clamped to viewport
    const top = Math.max(margin, Math.min(rect.top, window.innerHeight * 0.2))

    setTooltipStyle({ left, top })
  }, [])

  const handleMouseEnter = useCallback(() => {
    abortRef.current = false
    updatePosition()
    timerRef.current = setTimeout(async () => {
      const cached = cache.current?.get(page.id)
      if (cached !== undefined) {
        if (!abortRef.current) setPreview(cached)
        return
      }

      if (!abortRef.current) setLoading(true)
      try {
        const data = await fetchPagePreview(page.id)
        cache.current?.set(page.id, data.text_preview)
        if (!abortRef.current) setPreview(data.text_preview)
      } catch {
        if (!abortRef.current) setPreview(null)
      } finally {
        if (!abortRef.current) setLoading(false)
      }
    }, 300)
  }, [page.id, cache, updatePosition])

  const handleMouseLeave = useCallback(() => {
    abortRef.current = true
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPreview(null)
    setLoading(false)
  }, [])

  return (
    <div ref={tileRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={`flex aspect-square w-full items-center justify-center rounded text-[10px] font-mono
          cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:scale-110
          ${colorClass}`}
        onClick={onClick}
      >
        {page.number}
      </button>
      {(loading || preview !== null) && (
        <div
          className="fixed z-50 w-[28rem] h-[70vh] overflow-hidden rounded-lg border bg-popover px-6 py-5 shadow-2xl pointer-events-none text-[8px] leading-[1.4]"
          style={tooltipStyle}
        >
          {loading ? (
            <span className="text-muted-foreground text-xs">...</span>
          ) : preview ? (
            <pre className="whitespace-pre-wrap break-words font-serif text-popover-foreground m-0 text-[inherit] leading-[inherit]"
            >{preview}</pre>
          ) : (
            <span className="text-muted-foreground italic text-xs">Нет текста</span>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBar({ counts }: { counts: Record<PageStatus, number> }) {
  return (
    <div className="sticky top-0 z-10 bg-background pb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ALL_STATUSES.map((status) => (
        <div
          key={status}
          className={`rounded-lg px-3 py-1.5 text-center ${STATUS_BG[status]} ${STATUS_TEXT[status]}`}
        >
          <div className="text-[10px] leading-tight opacity-80">{STATUS_CONFIG[status].label}</div>
          <div className="text-sm font-bold leading-tight">{counts[status]}</div>
        </div>
      ))}
    </div>
  )
}
