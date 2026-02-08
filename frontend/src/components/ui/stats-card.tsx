import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtitle?: string
  className?: string
}

export function StatsCard({ icon: Icon, label, value, subtitle, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
