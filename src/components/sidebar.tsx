"use client"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  // Zap,
  Users,
  Settings,
  ChevronRight,
  CalendarPlus,
  Package2,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mainMenu = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CalendarPlus, label: "Evènements", href: "/dashboard/events" },
  { icon: Package2, label: "Catégories", href: "/dashboard/events_category" },
  { icon: Users, label: "Utilisateurs", href: "/dashboard/users" },
  { icon: Mail, label: "Messages", href: "/dashboard/contact" },
 ]


interface SidebarProps {
  isOpen?: boolean
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (href: string) => location.pathname === href

  // Fonctions pour obtenir les informations de l'utilisateur
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return "Utilisateur"
  }


  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-300 overflow-hidden",
        isOpen ? "w-56" : "w-0",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border min-w-56">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary-foreground">S</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground">Shadcn Admin</p>
            <p className="text-xs text-sidebar-foreground/60">Vite + ShadcnUI</p>
          </div>
          <button className="p-1 hover:bg-sidebar-accent rounded transition-colors">
            <ChevronRight className="w-4 h-4 text-sidebar-foreground/60" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className=" flex flex-col justify-between flex-1 overflow-y-auto p-4 space-y-2 min-w-56">
        {/* General Section */}
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase mb-3 px-3">General</p>
          <ul className="space-y-2">
            {mainMenu.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50" )}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </Link>

              </li>
            ))}
          </ul>
        </div>

        {/* Settings Section */}
        <div className="mt-auto">
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase mb-3 px-3">Autres</p>
          <Link
            to="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive("/dashboard/settings")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border min-w-56">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent/10 transition-colors cursor-pointer">
          <Avatar className="w-7 h-7 rounded-lg flex-shrink-0">
            <AvatarImage src={user?.profile_picture_url} alt={getDisplayName()} />
            <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {user ? getDisplayName() : "Chargement..."}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
