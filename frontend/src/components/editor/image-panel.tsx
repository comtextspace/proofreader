import { useState } from "react"
import { Contrast, Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"

interface ImagePanelProps {
  imageUrl: string | null
}

export function ImagePanel({ imageUrl }: ImagePanelProps) {
  const [inverted, setInverted] = useState(false)

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
            <div className="flex-1 overflow-hidden bg-muted/10">
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}
              >
                <img
                  src={imageUrl}
                  alt="Page scan"
                  className="max-h-full object-contain"
                  style={inverted ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
                />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
