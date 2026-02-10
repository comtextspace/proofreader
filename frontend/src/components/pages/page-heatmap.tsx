import { useNavigate } from "react-router-dom"
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants"
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

  return (
    <div>
      <StatusBar counts={counts} />
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
