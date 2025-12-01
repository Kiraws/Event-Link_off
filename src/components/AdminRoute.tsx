import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { getRoleFromToken, hasAuthToken } from "../../api"
import { useEffect } from "react"

/**
 * Composant de protection de route pour les routes admin
 * Vérifie que l'utilisateur est authentifié et a le rôle ADMIN
 * La vérification se fait en arrière-plan sans bloquer l'UI
 */
export function AdminRoute() {
  const { user } = useAuth()
  const location = useLocation()

  // Vérification basée sur le token JWT pour un rendu optimiste (sans bloquer l'UI)
  const tokenRole = getRoleFromToken()
  const normalizedTokenRole = tokenRole?.toUpperCase().trim() || 'USER'
  const hasToken = hasAuthToken()

  // Vérification en arrière-plan - si l'utilisateur est chargé et n'est pas ADMIN, rediriger
  useEffect(() => {
    if (user) {
      const userRole = user.role || tokenRole || 'USER'
      const normalizedRole = userRole.toUpperCase().trim()
      
      if (normalizedRole !== 'ADMIN') {
        // Redirection silencieuse si l'utilisateur vérifié n'est pas ADMIN
        window.location.href = '/access-denied'
      }
    }
  }, [user, tokenRole])

  // Si pas de token, rediriger vers login
  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si le token JWT indique ADMIN, autoriser l'accès immédiatement
  // La vérification complète se fait en arrière-plan
  if (normalizedTokenRole === 'ADMIN') {
    // Une fois l'utilisateur chargé, vérifier le rôle depuis l'API
    if (user) {
      const userRole = user.role || tokenRole || 'USER'
      const normalizedRole = userRole.toUpperCase().trim()
      
      if (normalizedRole !== 'ADMIN') {
        return <Navigate to="/access-denied" replace />
      }
    }
    
    // Afficher le contenu immédiatement - la vérification continue en arrière-plan
    return <Outlet />
  }

  // Si le token ne contient pas le rôle ADMIN, rediriger
  return <Navigate to="/access-denied" replace />
}




