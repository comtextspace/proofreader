import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG } from "@/lib/constants"
import type { PageStatus } from "@/types/models"

interface StatusBadgeProps {
  status: PageStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={config.bgClass}>
      {config.label}
    </Badge>
  )
}
