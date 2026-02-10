import type { PageStatus } from "@/types/models"

export const STATUS_CONFIG: Record<PageStatus, { label: string; color: string; bgClass: string }> = {
  processing: { label: "Обработка", color: "text-blue-600", bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  redy: { label: "Распознано", color: "text-yellow-600", bgClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  in_progress: { label: "В работе", color: "text-orange-600", bgClass: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  formatting: { label: "Форматирование", color: "text-purple-600", bgClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  check: { label: "Проверка", color: "text-cyan-600", bgClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
  done: { label: "Готово", color: "text-green-600", bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
}

export const ALL_STATUSES: PageStatus[] = ["processing", "redy", "in_progress", "formatting", "check", "done"]

export const PAGE_SIZE = 25
