import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Contrast, Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { findHighlightedWords } from "@/lib/ocr-mapping"
import type { OcrData, SpellError } from "@/types/models"

interface ImagePanelProps {
  imageUrl: string | null
  ocrData?: OcrData | null
  selection?: { from: number; to: number } | null
  spellErrors?: SpellError[]
}

export function ImagePanel({ imageUrl, ocrData, selection, spellErrors }: ImagePanelProps) {
  const [inverted, setInverted] = useState(false)
  const [imgRect, setImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const highlightedWords = useMemo(() => {
    if (!ocrData || !selection) return []
    return findHighlightedWords(ocrData, selection.from, selection.to)
  }, [ocrData, selection])

  const spellErrorWords = useMemo(() => {
    if (!ocrData || !spellErrors || spellErrors.length === 0) return []
    const words = new Set<number>()
    const result: typeof ocrData.words = []
    for (const error of spellErrors) {
      for (const word of findHighlightedWords(ocrData, error.from, error.to)) {
        const idx = ocrData.words.indexOf(word)
        if (!words.has(idx)) {
          words.add(idx)
          result.push(word)
        }
      }
    }
    return result
  }, [ocrData, spellErrors])

  const updateImgRect = useCallback(() => {
    if (imgRef.current && containerRef.current) {
      const imgBounds = imgRef.current.getBoundingClientRect()
      const containerBounds = containerRef.current.getBoundingClientRect()
      setImgRect({
        left: imgBounds.left - containerBounds.left,
        top: imgBounds.top - containerBounds.top,
        width: imgBounds.width,
        height: imgBounds.height,
      })
    }
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver(updateImgRect)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [updateImgRect])

  if (!imageUrl) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-muted/30">
        <p className="text-muted-foreground">Изображение недоступно</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={5}
        doubleClick={{ mode: "toggle", step: 0.7 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">Изображение</span>
              <div className="ml-auto flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Инвертировать"
                  onClick={() => setInverted(!inverted)}>
                  <Contrast className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Приблизить"
                  onClick={() => zoomIn()}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Отдалить"
                  onClick={() => zoomOut()}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="По размеру экрана"
                  onClick={() => resetTransform()}>
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div ref={containerRef} className="relative flex-1 overflow-hidden bg-muted/10">
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Page scan"
                  className="max-h-full object-contain"
                  style={inverted ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
                  onLoad={updateImgRect}
                />
              </TransformComponent>
              {(highlightedWords.length > 0 || spellErrorWords.length > 0) && ocrData && imgRect && (
                <svg
                  style={{
                    position: "absolute",
                    left: imgRect.left,
                    top: imgRect.top,
                    width: imgRect.width,
                    height: imgRect.height,
                    pointerEvents: "none",
                  }}
                  viewBox={`0 0 ${ocrData.image_width} ${ocrData.image_height}`}
                >
                  {spellErrorWords.map((word, i) => (
                    <rect
                      key={`spell-${i}`}
                      x={word.left}
                      y={word.top}
                      width={word.width}
                      height={word.height}
                      fill="rgba(239, 68, 68, 0.2)"
                      stroke="rgba(239, 68, 68, 0.5)"
                      strokeWidth={2}
                      rx={2}
                    />
                  ))}
                  {highlightedWords.map((word, i) => (
                    <rect
                      key={`sel-${i}`}
                      x={word.left}
                      y={word.top}
                      width={word.width}
                      height={word.height}
                      fill="rgba(59, 130, 246, 0.3)"
                      stroke="rgba(59, 130, 246, 0.6)"
                      strokeWidth={2}
                      rx={2}
                    />
                  ))}
                </svg>
              )}
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
