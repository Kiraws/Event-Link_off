import { Outlet } from "react-router-dom"
import Sidebar from "@/components/sidebar"
import { TopNav } from "@/components/TopNav"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
