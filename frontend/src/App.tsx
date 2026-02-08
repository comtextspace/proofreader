import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "@/components/layout/app-layout"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { LoginPage } from "@/pages/login"
import { AuthorListPage } from "@/pages/author-list"
import { AuthorBooksPage } from "@/pages/author-books"
import { BookPagesPage } from "@/pages/book-pages"
import { PageEditPage } from "@/pages/page-edit"
import { SettingsPage } from "@/pages/settings"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"
import { fetchProfile } from "@/api/users"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initializeTheme = useUIStore((s) => s.initializeTheme)
  const setTextSize = useUIStore((s) => s.setTextSize)

  useEffect(() => {
    initialize()
    initializeTheme()
  }, [initialize, initializeTheme])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
        .then((user) => {
          setUser(user)
          if (user.text_size) setTextSize(user.text_size)
        })
        .catch(() => {})
    }
  }, [isAuthenticated, setUser, setTextSize])

  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInitializer>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/authors" element={<AuthorListPage />} />
              <Route path="/authors/:authorId/books" element={<AuthorBooksPage />} />
              <Route path="/books/:bookId/pages" element={<BookPagesPage />} />
              <Route path="/pages/:id/edit" element={<PageEditPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/authors" replace />} />
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
