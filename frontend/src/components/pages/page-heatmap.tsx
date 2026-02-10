import { useNavigate } from "react-router-dom"
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants"
import type { PageListItem, PageStatus } from "@/types/models"

const STATUS_BG: Record<PageStatus, string> = {
  processing: "bg-blue-200 dark:bg-blue-800",
  redy: "bg-yellow-200 dark:bg-yellow-800",
  in_progress: "bg-orange-200 dark:bg-orange-800",
  formatting: "bg-purple-200 dark:bg-purple-800",
  check: "bg-cyan-200 dark:bg-cyan-800",
  done: "bg-green-200 dark:bg-green-800",
}

const STATUS_TEXT: Record<PageStatus, string> = {
  processing: "text-blue-900 dark:text-blue-100",
  redy: "text-yellow-900 dark:text-yellow-100",
  in_progress: "text-orange-900 dark:text-orange-100",
  formatting: "text-purple-900 dark:text-purple-100",
  check: "text-cyan-900 dark:text-cyan-100",
  done: "text-green-900 dark:text-green-100",
}

interface PageHeatmapProps {
  pages: PageListItem[]
}

export function PageHeatmap({ pages }: PageHeatmapProps) {
  const navigate = useNavigate()

  return (
    <div>
      <HeatmapLegend />
      <div className="flex flex-wrap gap-1">
        {pages.map((page) => {
          const colorClass = `${STATUS_BG[page.status] ?? "bg-muted"} ${STATUS_TEXT[page.status] ?? "text-muted-foreground"}`
          return (
            <button
              key={page.id}
              className={`flex h-7 w-7 items-center justify-center rounded text-[10px] font-mono
                cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:scale-110
                ${colorClass}`}
              title={`Стр. ${page.number} — ${STATUS_CONFIG[page.status]?.label ?? page.status}`}
              onClick={() => navigate(`/pages/${page.id}/edit`)}
            >
              {page.number}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function HeatmapLegend() {
  return (
    <div className="sticky top-0 z-10 bg-background pb-4 flex flex-wrap items-center gap-3 text-xs">
      {ALL_STATUSES.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <div className={`h-3 w-3 rounded ${STATUS_BG[status] ?? "bg-muted"}`} />
          <span className="text-muted-foreground">{STATUS_CONFIG[status].label}</span>
        </div>
      ))}
    </div>
  )
}
