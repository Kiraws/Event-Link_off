import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { getRoleFromToken } from "../../api"

export function UserProfileButton() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  // Obtenir le rôle (depuis user.role ou depuis le JWT)
  const userRole = user.role || getRoleFromToken() || 'USER'
  const isAdmin = userRole === 'ADMIN'
  const isUser = userRole === 'USER'

  const handleLogout = () => {
    logout()
    toast.success("Déconnexion réussie")
    navigate("/")
  }

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.email
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: "Administrateur",
      MODERATOR: "Modérateur",
      ORGANIZER: "Organisateur",
      USER: "Utilisateur",
    }
    return roles[role] || role
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" type="button">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile_picture_url} alt={getDisplayName()} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-white text-gray-900 dark:text-gray-900 z-50" align="end" sideOffset={5}>
        <DropdownMenuLabel className="font-normal text-gray-900 dark:text-gray-900">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-gray-600 dark:text-gray-600">
              {user.email}
            </p>
            <p className="text-xs leading-none text-gray-600 dark:text-gray-600 mt-1">
              {getRoleLabel(userRole)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(userRole === 'ADMIN' || userRole === 'MODERATOR' || userRole === 'ORGANIZER') && (
          <>
            <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {/* Mon profil : seulement pour USER */}
        {isUser && (
          <DropdownMenuItem onClick={() => navigate("/member")} className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100">
            <User className="mr-2 h-4 w-4" />
            <span>Mon profil</span>
          </DropdownMenuItem>
        )}
        {/* Paramètres : vers /dashboard/settings pour ADMIN, vers /member pour USER */}
        <DropdownMenuItem 
          onClick={() => navigate(isAdmin ? "/dashboard/settings" : "/member")} 
          className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

