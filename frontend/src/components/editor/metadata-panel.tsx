import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useUIStore } from "@/stores/ui-store"
import type { PageDetail } from "@/types/models"

interface MetadataPanelProps {
  page: PageDetail
  status: string
  numberInBook: string
  onStatusChange: (value: string) => void
  onNumberInBookChange: (value: string) => void
}

export function MetadataPanel({
  page,
  status,
  numberInBook,
  onStatusChange,
  onNumberInBookChange,
}: MetadataPanelProps) {
  const { textSize, setTextSize } = useUIStore()

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Книга</label>
        <p className="mt-1">
          <Link
            to={`/books/${page.book.id}/pages`}
            className="text-sm font-medium hover:underline"
          >
            {page.book.name}
          </Link>
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Страница</label>
        <p className="mt-1 text-sm">
          {page.number} / {page.total_pages}
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Стр. в книге</label>
        <Input
          value={numberInBook}
          onChange={(e) => onNumberInBookChange(e.target.value)}
          className="mt-1 h-8 text-sm"
          placeholder="-"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Статус</label>
        <Select
          options={page.available_statuses.map((s) => ({ value: s.value, label: s.label }))}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="mt-1 h-8 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Размер текста</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={24}
            value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
            className="h-2 flex-1"
          />
          <span className="text-xs text-muted-foreground w-6">{textSize}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Изменено</label>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(page.modified).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
