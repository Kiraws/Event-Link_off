import { Outlet } from "react-router-dom"
import Navbar from "@/components/navbar"
import { PublicFooter } from "@/components/PublicFooter"
import { useLocation } from "react-router-dom"


export default function PublicLayout() {
   const location = useLocation()
   const hideFooter = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/verify-email"

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
     {/* Global footer for all public pages */}
    {!hideFooter && <PublicFooter />}
    </div>
  )
}
