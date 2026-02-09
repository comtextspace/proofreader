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
    return { label: "Обработка", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
  }
  if (book.pages_done_count === book.pages_count) {
    return { label: "Готово", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
  }
  return { label: "В работе", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" }
}
