import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG } from "@/lib/constants"
import { computeWordDiff } from "@/lib/diff"
import type { PageHistory } from "@/types/models"
import type { PageStatus } from "@/types/models"

interface HistoryColumn {
  key: string
  label: string
}

interface HistoryTableProps {
  records: PageHistory[]
  extraColumns?: HistoryColumn[]
  renderExtraCell?: (record: PageHistory, columnKey: string) => React.ReactNode
}

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const segments = useMemo(() => computeWordDiff(oldText, newText), [oldText, newText])

  return (
    <div className="max-h-64 overflow-auto rounded border bg-muted/30 p-3 text-sm leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.added) {
          return (
            <span key={i} className="bg-green-100 text-green-800 dark:bg-green-400/20 dark:text-green-300">
              {seg.value}
            </span>
          )
        }
        if (seg.removed) {
          return (
            <span key={i} className="bg-red-100 text-red-800 line-through dark:bg-red-400/20 dark:text-red-300">
              {seg.value}
            </span>
          )
        }
        return <span key={i}>{seg.value}</span>
      })}
    </div>
  )
}

export function HistoryTable({ records, extraColumns, renderExtraCell }: HistoryTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (records.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">Нет записей</p>
  }

  function toggleRow(historyId: number) {
    setExpandedId(expandedId === historyId ? null : historyId)
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-8 px-3 py-2" />
            <th className="px-3 py-2 text-left font-medium">Дата</th>
            <th className="px-3 py-2 text-left font-medium">Пользователь</th>
            {extraColumns?.map((col) => (
              <th key={col.key} className="px-3 py-2 text-left font-medium">
                {col.label}
              </th>
            ))}
            <th className="px-3 py-2 text-left font-medium">Статус</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const isExpanded = expandedId === record.history_id
            const prevRecord = index < records.length - 1 ? records[index + 1] : null
            const statusConfig = STATUS_CONFIG[record.status as PageStatus]

            return (
              <>
                <tr
                  key={record.history_id}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/30"
                  onClick={() => toggleRow(record.history_id)}
                >
                  <td className="px-3 py-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(record.history_date).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{record.history_user || "—"}</td>
                  {extraColumns?.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      {renderExtraCell?.(record, col.key)}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    {statusConfig ? (
                      <Badge className={statusConfig.bgClass}>{statusConfig.label}</Badge>
                    ) : (
                      record.status
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${record.history_id}-diff`} className="border-b">
                    <td colSpan={3 + (extraColumns?.length || 0)} className="px-3 py-3">
                      {prevRecord ? (
                        <DiffView oldText={prevRecord.text} newText={record.text} />
                      ) : (
                        <div className="max-h-64 overflow-auto rounded border bg-muted/30 p-3 text-sm leading-relaxed">
                          <span className="bg-green-100 text-green-800 dark:bg-green-400/20 dark:text-green-300">
                            {record.text}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
