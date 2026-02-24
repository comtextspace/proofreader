import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface ColorSwatch {
  name: string
  cssVar: string
  oklch: string
  description: string
}

const themeColors: ColorSwatch[] = [
  { name: "Primary", cssVar: "var(--primary)", oklch: "oklch(0.62 0.14 290)", description: "Основной цвет" },
  { name: "Secondary", cssVar: "var(--secondary)", oklch: "oklch(0.94 0.03 290)", description: "Вторичный" },
  { name: "Accent", cssVar: "var(--accent)", oklch: "oklch(0.93 0.03 290)", description: "Акцент" },
  { name: "Muted", cssVar: "var(--muted)", oklch: "oklch(0.95 0.015 295)", description: "Приглушённый" },
  { name: "Background", cssVar: "var(--background)", oklch: "oklch(0.97 0.012 295)", description: "Фон" },
  { name: "Foreground", cssVar: "var(--foreground)", oklch: "oklch(0.18 0.02 290)", description: "Текст" },
  { name: "Card", cssVar: "var(--card)", oklch: "oklch(0.99 0.006 290)", description: "Карточка" },
  { name: "Border", cssVar: "var(--border)", oklch: "oklch(0.91 0.02 290)", description: "Граница" },
  { name: "Destructive", cssVar: "var(--destructive)", oklch: "oklch(0.70 0.14 15)", description: "Ошибка" },
  { name: "Success", cssVar: "var(--success)", oklch: "oklch(0.72 0.12 155)", description: "Успех" },
  { name: "Warning", cssVar: "var(--warning)", oklch: "oklch(0.80 0.12 80)", description: "Предупреждение" },
]

const pastelColors: ColorSwatch[] = [
  { name: "Pastel Lavender", cssVar: "var(--pastel-lavender)", oklch: "oklch(0.85 0.06 290)", description: "Светлый основной" },
  { name: "Pastel Rose", cssVar: "var(--pastel-rose)", oklch: "oklch(0.85 0.06 350)", description: "Мягкий розовый" },
  { name: "Pastel Peach", cssVar: "var(--pastel-peach)", oklch: "oklch(0.87 0.06 60)", description: "Тёплый персик" },
  { name: "Pastel Mint", cssVar: "var(--pastel-mint)", oklch: "oklch(0.87 0.06 160)", description: "Свежая мята" },
  { name: "Pastel Sky", cssVar: "var(--pastel-sky)", oklch: "oklch(0.85 0.06 230)", description: "Небесный голубой" },
  { name: "Pastel Sage", cssVar: "var(--pastel-sage)", oklch: "oklch(0.85 0.04 140)", description: "Шалфей" },
  { name: "Pastel Cream", cssVar: "var(--pastel-cream)", oklch: "oklch(0.92 0.03 80)", description: "Кремовый" },
  { name: "Pastel Lilac", cssVar: "var(--pastel-lilac)", oklch: "oklch(0.82 0.08 310)", description: "Сиреневый" },
]

const gradients = [
  { name: "Primary", className: "bg-gradient-primary", css: "linear-gradient(135deg, #a78bda 0%, #8b6bbf 100%)" },
  { name: "Destructive", className: "bg-gradient-destructive", css: "linear-gradient(135deg, #f0918a 0%, #e07070 100%)" },
  { name: "Success", className: "bg-gradient-success", css: "linear-gradient(135deg, #7dd3a8 0%, #5bbf8e 100%)" },
  { name: "Warning", className: "bg-gradient-warning", css: "linear-gradient(135deg, #f5c77e 0%, #e8b460 100%)" },
  { name: "Body", className: "bg-gradient-body", css: "linear-gradient(135deg, #f5f0fa 0%, #efe8f5 100%)" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
      title="Копировать"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function ColorSwatchCard({ color }: { color: ColorSwatch }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card p-3">
      <div
        className="h-16 w-full rounded-md border border-border/30"
        style={{ backgroundColor: color.cssVar }}
      />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{color.name}</span>
          <CopyButton text={color.oklch} />
        </div>
        <span className="text-xs text-muted-foreground">{color.description}</span>
        <code className="text-[10px] text-muted-foreground/70 font-mono">{color.oklch}</code>
      </div>
    </div>
  )
}

export function DebugPage() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Debug: Цветовая палитра</h1>
        <p className="text-sm text-muted-foreground">Визуализация цветовой системы проекта</p>
      </div>

      {/* Theme colors */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Цвета темы</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {themeColors.map((color) => (
            <ColorSwatchCard key={color.name} color={color} />
          ))}
        </div>
      </section>

      {/* Pastel palette */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Пастельная палитра</h2>
        <p className="text-sm text-muted-foreground">
          Пастельные цвета на основе лавандового оттенка. Одинаковая светлота (~0.85) и низкая насыщенность для мягкого восприятия.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {pastelColors.map((color) => (
            <ColorSwatchCard key={color.name} color={color} />
          ))}
        </div>
      </section>

      {/* Pastel combinations row */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Комбинации пастельных цветов</h2>
        <div className="flex gap-1 rounded-lg overflow-hidden h-12">
          {pastelColors.map((color) => (
            <div
              key={color.name}
              className="flex-1 transition-all hover:flex-[2]"
              style={{ backgroundColor: color.cssVar }}
              title={color.name}
            />
          ))}
        </div>
        <div className="flex gap-1 rounded-lg overflow-hidden h-12">
          {[...pastelColors].reverse().map((color) => (
            <div
              key={color.name}
              className="flex-1 transition-all hover:flex-[2]"
              style={{ backgroundColor: color.cssVar }}
              title={color.name}
            />
          ))}
        </div>
      </section>

      {/* Gradients */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Градиенты</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gradients.map((gradient) => (
            <div key={gradient.name} className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card p-3">
              <div className={`h-12 w-full rounded-md ${gradient.className}`} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{gradient.name}</span>
                <CopyButton text={gradient.className} />
              </div>
              <code className="text-[10px] text-muted-foreground/70 font-mono">{gradient.css}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Sample UI elements */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Примеры использования</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Badges */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <h3 className="text-sm font-medium mb-3">Бейджи</h3>
            <div className="flex flex-wrap gap-2">
              {pastelColors.map((color) => (
                <span
                  key={color.name}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: color.cssVar, color: "var(--foreground)" }}
                >
                  {color.description}
                </span>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <h3 className="text-sm font-medium mb-3">Карточки</h3>
            <div className="grid grid-cols-2 gap-2">
              {pastelColors.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  className="rounded-md p-3 text-xs font-medium"
                  style={{ backgroundColor: color.cssVar, color: "var(--foreground)" }}
                >
                  {color.name}
                </div>
              ))}
            </div>
          </div>

          {/* Text on backgrounds */}
          <div className="rounded-lg border border-border/50 bg-card p-4 sm:col-span-2">
            <h3 className="text-sm font-medium mb-3">Текст на пастельном фоне</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pastelColors.map((color) => (
                <div
                  key={color.name}
                  className="rounded-md p-3"
                  style={{ backgroundColor: color.cssVar }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{color.description}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Пример текста</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tailwind class reference */}
      <section className="flex flex-col gap-3 pb-6">
        <h2 className="text-lg font-semibold">Tailwind классы</h2>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 font-mono text-xs">
            {pastelColors.map((color) => {
              const tailwindName = color.name.toLowerCase().replace(" ", "-")
              return (
                <div key={color.name} className="flex items-center gap-2 py-1">
                  <div
                    className="h-4 w-4 rounded-sm border border-border/30 shrink-0"
                    style={{ backgroundColor: color.cssVar }}
                  />
                  <span className="text-muted-foreground">bg-{tailwindName}</span>
                  <CopyButton text={`bg-${tailwindName}`} />
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
    </div>
  )
}
