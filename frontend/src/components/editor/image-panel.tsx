import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Contrast, Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import type { OcrData, SpellError } from "@/types/models"

interface ImagePanelProps {
  imageUrl: string | null
  ocrData?: OcrData | null
  selection?: { from: number; to: number; text?: string } | null
  spellErrors?: SpellError[]
  editorText?: string
}

export function ImagePanel({ imageUrl, ocrData, selection, spellErrors, editorText }: ImagePanelProps) {
  const [inverted, setInverted] = useState(false)
  const [imgRect, setImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const highlightedWords = useMemo(() => {
    if (!ocrData || !selection) return []
    const selText = (selection.text || "").trim()
    if (!selText) return []
    const strip = (s: string) => s.toLowerCase().replace(/^[^a-zа-яё]+|[^a-zа-яё]+$/gi, "")
    const selTokens = selText.toLowerCase().split(/\s+/).map(strip).filter((w) => w.length >= 2)
    if (selTokens.length === 0) return []

    // For single-word selection, use surrounding context to find the right OCR word
    if (selTokens.length === 1 && editorText) {
      const word = selTokens[0]

      // Extract context words around the selection from editor text
      const beforeText = editorText.slice(Math.max(0, selection.from - 80), selection.from)
      const afterText = editorText.slice(selection.to, selection.to + 80)
      const contextBefore = beforeText.toLowerCase().split(/\s+/).map(strip).filter((w) => w.length >= 2).slice(-3)
      const contextAfter = afterText.toLowerCase().split(/\s+/).map(strip).filter((w) => w.length >= 2).slice(0, 3)

      // Find all OCR word indices that match the selected word (including hyphen-split pairs)
      const candidates: { ocrWords: typeof ocrData.words[number][]; ocrIndex: number }[] = []
      for (let i = 0; i < ocrData.words.length; i++) {
        if (strip(ocrData.words[i].text) === word) {
          candidates.push({ ocrWords: [ocrData.words[i]], ocrIndex: i })
        }
        // Check for hyphen-split word pairs: "Народ-" + "ной" = "Народной"
        if (i + 1 < ocrData.words.length) {
          const w1 = ocrData.words[i].text
          if (w1.endsWith("-")) {
            const joined = strip(w1.slice(0, -1) + ocrData.words[i + 1].text)
            if (joined === word) {
              candidates.push({ ocrWords: [ocrData.words[i], ocrData.words[i + 1]], ocrIndex: i })
            }
          }
        }
      }

      if (candidates.length === 1) return candidates[0].ocrWords
      if (candidates.length > 1) {
        // Score each candidate by how many context words appear nearby in OCR
        let bestCandidate = candidates[0]
        let bestScore = -1
        for (const c of candidates) {
          let score = 0
          const lastIdx = c.ocrIndex + c.ocrWords.length - 1
          const nearbyBefore = ocrData.words.slice(Math.max(0, c.ocrIndex - 5), c.ocrIndex)
            .map((w) => strip(w.text))
          const nearbyAfter = ocrData.words.slice(lastIdx + 1, lastIdx + 6)
            .map((w) => strip(w.text))
          for (const ctx of contextBefore) {
            if (nearbyBefore.includes(ctx)) score++
          }
          for (const ctx of contextAfter) {
            if (nearbyAfter.includes(ctx)) score++
          }
          if (score > bestScore) {
            bestScore = score
            bestCandidate = c
          }
        }
        return bestCandidate.ocrWords
      }
    }

    // Multi-word selection or fallback: highlight all matching words
    const selWordSet = new Set(selTokens)
    return ocrData.words.filter((w) => {
      const cleaned = strip(w.text)
      return cleaned.length >= 2 && selWordSet.has(cleaned)
    })
  }, [ocrData, selection, editorText])

  const spellErrorWords = useMemo(() => {
    if (!ocrData || !spellErrors || spellErrors.length === 0) return []
    const strip = (s: string) => s.toLowerCase().replace(/^[^a-zа-яё]+|[^a-zа-яё]+$/gi, "")
    const errorWordTexts = new Set(spellErrors.map((e) => strip(e.word)))
    return ocrData.words.filter((w) => {
      const cleaned = strip(w.text)
      if (cleaned.length < 2) return false
      if (errorWordTexts.has(cleaned)) return true
      const parts = cleaned.split("-")
      return parts.length > 1 && parts.some((p) => p.length >= 2 && errorWordTexts.has(p))
    })
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
                      fill="oklch(0.70 0.14 15 / 0.2)"
                      stroke="oklch(0.70 0.14 15 / 0.5)"
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
