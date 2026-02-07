import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageEditor } from "@/components/editor/page-editor"
import { usePage } from "@/hooks/use-pages"

export function PageEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: page, isLoading, error } = usePage(id!)

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-destructive">Failed to load page.</p>
      </div>
    )
  }

  return <PageEditor key={page.id} page={page} />
}
