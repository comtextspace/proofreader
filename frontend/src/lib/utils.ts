import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBookStatus(
  book: { pages_count: number; pages_done_count: number },
  pagesProcessing: boolean
): { label: string; className: string } {
  if (book.pages_count === 0) {
    return { label: "Пустая", className: "bg-muted text-muted-foreground" }
  }
  if (pagesProcessing) {
    return { label: "Обработка", className: "bg-blue-50 text-blue-700 dark:bg-blue-400/15 dark:text-blue-400" }
  }
  if (book.pages_done_count === book.pages_count) {
    return { label: "Готово", className: "bg-green-50 text-green-700 dark:bg-green-400/15 dark:text-green-400" }
  }
  return { label: "Вычитка", className: "bg-orange-50 text-orange-700 dark:bg-orange-400/15 dark:text-orange-400" }
}
