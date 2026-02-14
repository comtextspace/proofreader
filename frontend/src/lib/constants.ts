import type { PageStatus } from "@/types/models"

export const STATUS_CONFIG: Record<PageStatus, { label: string; color: string; bgClass: string }> = {
  processing: { label: "Обработка", color: "text-blue-400", bgClass: "bg-blue-50 text-blue-700 dark:bg-blue-400/15 dark:text-blue-400" },
  redy: { label: "Распознано", color: "text-yellow-400", bgClass: "bg-yellow-50 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-400" },
  in_progress: { label: "Вычитка", color: "text-orange-400", bgClass: "bg-orange-50 text-orange-700 dark:bg-orange-400/15 dark:text-orange-400" },
  formatting: { label: "Форматирование", color: "text-purple-400", bgClass: "bg-purple-50 text-purple-700 dark:bg-purple-400/15 dark:text-purple-400" },
  check: { label: "Проверка", color: "text-cyan-400", bgClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-400" },
  done: { label: "Готово", color: "text-green-400", bgClass: "bg-green-50 text-green-700 dark:bg-green-400/15 dark:text-green-400" },
}

export const ALL_STATUSES: PageStatus[] = ["processing", "redy", "in_progress", "formatting", "check", "done"]

export const PAGE_SIZE = 25
