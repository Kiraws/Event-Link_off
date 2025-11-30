import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { getRoleFromToken } from "../../api"
import { Loader2 } from "lucide-react"

/**
 * Composant de protection de route pour les routes admin
 * Vérifie que l'utilisateur est authentifié et a le rôle ADMIN
 */
export function AdminRoute() {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Afficher un loader pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Vérifier le rôle de l'utilisateur
  const userRole = user.role || getRoleFromToken() || 'USER'
  const normalizedRole = userRole.toUpperCase().trim()

  // Si l'utilisateur n'est pas ADMIN, rediriger vers une page d'accès refusé
  if (normalizedRole !== 'ADMIN') {
    return <Navigate to="/access-denied" replace />
  }

  // Si tout est OK, afficher les routes enfants
  return <Outlet />
}




