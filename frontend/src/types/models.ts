export interface User {
  id: number
  username: string
  is_admin: boolean
  text_size: number
  groups: string[]
}

export interface Author {
  id: string
  name: string
  books_count: number
}

export interface Book {
  id: string
  name: string
  author: string
}

export interface BookList extends Book {
  author_id: string
  pages_count: number
  pages_done_count: number
  total_pages_in_pdf: number | null
}

export interface BookDetail {
  id: string
  name: string
  author: { id: string; name: string }
  pages_count: number
  pages_done_count: number
  pages_processing_count: number
  pages_recognized_count: number
  pages_in_work_count: number
  total_pages_in_pdf: number | null
  export_name: string
}

export interface PageListItem {
  id: string
  number: number
  number_in_book: string | null
  book: string
  book_name: string
  status: PageStatus
  status_display: string
  modified: string
}

export interface PageDetail {
  id: string
  book: Book
  number: number
  number_in_book: string | null
  image: string | null
  text: string
  status: PageStatus
  status_display: string
  available_statuses: StatusOption[]
  total_pages: number
  modified: string
  created: string
}

export interface StatusOption {
  value: string
  label: string
}

export interface PageAdjacent {
  prev_id: string | null
  next_id: string | null
}

export interface PageHistory {
  history_id: number
  history_date: string
  history_user: string | null
  text: string
  status: string
}

export interface Assignment {
  id: number
  book_id: string
  book_name: string
  pages: string
}

export type PageStatus =
  | "processing"
  | "redy"
  | "in_progress"
  | "formatting"
  | "check"
  | "done"

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface TokenPair {
  access: string
  refresh: string
}
