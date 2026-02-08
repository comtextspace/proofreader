import { Outlet, useLocation } from "react-router-dom"
import { Header } from "./header"

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-body dark:bg-background">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div key={location.pathname} className="h-full animate-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
