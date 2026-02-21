import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Check, ChevronRight, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useAssignments, useCreateAssignment, useDeleteAssignment } from "@/hooks/use-assignments"
import { useBooks } from "@/hooks/use-books"

export function AssignmentsPage() {
  const navigate = useNavigate()
  const { data: assignments, isLoading } = useAssignments()
  const { data: booksData } = useBooks()
  const createMutation = useCreateAssignment()
  const deleteMutation = useDeleteAssignment()

  const [bookId, setBookId] = useState("")
  const [pages, setPages] = useState("")
  const [error, setError] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const bookOptions = (booksData?.results ?? []).map((b) => ({
    value: b.id,
    label: `${b.name} (${b.author})`,
  }))

  async function handleAdd() {
    if (!bookId || !pages.trim()) return
    setError("")
    try {
      await createMutation.mutateAsync({ book: bookId, pages: pages.trim() })
      setBookId("")
      setPages("")
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data
        const messages: string[] = []
        for (const value of Object.values(data)) {
          if (Array.isArray(value)) messages.push(value[0])
          else if (typeof value === "string") messages.push(value)
        }
        setError(messages.join(". ") || "Ошибка при создании назначения")
      } else {
        setError("Ошибка при создании назначения")
      }
    }
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id, { onSettled: () => setConfirmDeleteId(null) })
  }

  return (
    <div className="mx-auto h-full max-w-6xl space-y-6 overflow-auto p-6">
      <h1 className="text-2xl font-bold">Мои назначения</h1>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Добавить назначение</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Книга</label>
            <Select
              options={bookOptions}
              placeholder="Выберите книгу"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Страницы</label>
            <Input
              placeholder="1-5,8,10-15"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
            />
          </div>
          <Button onClick={handleAdd} disabled={!bookId || !pages.trim() || createMutation.isPending} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Добавить
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : !assignments?.length ? (
          <p className="text-sm text-muted-foreground">Назначений пока нет.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-primary text-white">
                  <th className="px-4 py-3 text-left font-semibold">Книга</th>
                  <th className="px-4 py-3 text-left font-semibold">Страницы</th>
                  <th className="w-10 px-4 py-3" />
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-b transition-all duration-200 hover:bg-primary/5"
                    onClick={() => navigate(`/books/${a.book_id}/pages?assigned=true`)}
                  >
                    <td className="px-4 py-3 font-medium">{a.book_name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{a.pages}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {confirmDeleteId === a.id ? (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          Удалить?
                          <button
                            className="rounded p-0.5 transition-colors hover:bg-destructive/10"
                            onClick={() => handleDelete(a.id)}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ) : (
                        <button
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Удалить"
                          onClick={() => setConfirmDeleteId(a.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
