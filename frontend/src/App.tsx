import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "@/components/layout/app-layout"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { LoginPage } from "@/pages/login"
import { PageListPage } from "@/pages/page-list"
import { PageEditPage } from "@/pages/page-edit"
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

  useEffect(() => {
    initialize()
    initializeTheme()
  }, [initialize, initializeTheme])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().then(setUser).catch(() => {})
    }
  }, [isAuthenticated, setUser])

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
              <Route path="/pages" element={<PageListPage />} />
              <Route path="/pages/:id/edit" element={<PageEditPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/pages" replace />} />
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
