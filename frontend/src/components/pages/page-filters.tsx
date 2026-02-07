import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants"
import { useBooks } from "@/hooks/use-books"

interface PageFiltersProps {
  book: string
  status: string
  assigned: boolean
  search: string
  onBookChange: (value: string) => void
  onStatusChange: (value: string) => void
  onAssignedChange: (value: boolean) => void
  onSearchChange: (value: string) => void
}

export function PageFilters({
  book,
  status,
  assigned,
  search,
  onBookChange,
  onStatusChange,
  onAssignedChange,
  onSearchChange,
}: PageFiltersProps) {
  const { data: booksData } = useBooks()

  const bookOptions = (booksData?.results ?? []).map((b) => ({
    value: b.id,
    label: `${b.name} (${b.author})`,
  }))

  const statusOptions = ALL_STATUSES.map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  }))

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-48 pl-9"
        />
      </div>

      <Select
        options={bookOptions}
        placeholder="All books"
        value={book}
        onChange={(e) => onBookChange(e.target.value)}
        className="w-52"
      />

      <Select
        options={statusOptions}
        placeholder="All statuses"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-40"
      />

      <Button
        variant={assigned ? "default" : "outline"}
        size="sm"
        onClick={() => onAssignedChange(!assigned)}
      >
        My pages
      </Button>
    </div>
  )
}
