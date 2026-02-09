import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageEditor } from "@/components/editor/page-editor"
import { usePage } from "@/hooks/use-pages"

export function PageEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: page, isLoading, error } = usePage(id!)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Не удалось загрузить страницу.</p>
      </div>
    )
  }

  return <PageEditor key={page.id} page={page} />
}
