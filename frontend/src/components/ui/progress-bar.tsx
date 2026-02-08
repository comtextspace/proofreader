import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  className?: string
  label?: string
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-primary transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
