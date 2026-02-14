import { useRef, useState } from "react"
import { Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/stores/ui-store"

export function TextSizePopover() {
  const { textSize, setTextSize } = useUIStore()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false)
        }
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title={`Размер текста: ${textSize}px`}
        onClick={() => setOpen(!open)}
      >
        <Type className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-lg border bg-popover p-3 shadow-lg">
          <label className="text-xs font-medium text-muted-foreground">
            Размер текста
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={24}
              value={textSize}
              onChange={(e) => setTextSize(Number(e.target.value))}
              className="h-1.5 flex-1 appearance-none rounded-full bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
            />
            <span className="text-xs text-muted-foreground w-6 text-right">{textSize}</span>
          </div>
        </div>
      )}
    </div>
  )
}
