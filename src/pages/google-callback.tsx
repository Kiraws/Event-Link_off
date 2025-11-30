import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { authService, getRoleFromToken } from "../../api"
import { useAuth } from "@/contexts/AuthContext"
import { setAuthToken } from "../../api/config"

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL selon la documentation backend
        const token = searchParams.get("token")
        const role = searchParams.get("role")
        const error = searchParams.get("error")

        if (error) {
          toast.error("Erreur lors de l'authentification Google: " + error)
          navigate("/login", { replace: true })
          return
        }

        if (!token) {
          throw new Error("Token manquant dans l'URL de callback")
        }

        // Sauvegarder le token
        setAuthToken(token)

        // Récupérer les informations complètes de l'utilisateur depuis l'API
        const userResponse = await authService.me()
        if (userResponse.data) {
          login(userResponse.data, token)
          toast.success("Connexion avec Google réussie !")

          // Rediriger selon le rôle
          const userRole = userResponse.data.role || role || getRoleFromToken(token)
          const normalizedRole = userRole?.toUpperCase().trim()

          if (normalizedRole === 'ADMIN') {
            navigate("/dashboard", { replace: true })
          } else if (normalizedRole === 'MODERATOR' || normalizedRole === 'ORGANIZER') {
            navigate("/dashboard", { replace: true })
          } else {
            navigate("/events", { replace: true })
          }
        } else {
          throw new Error("Impossible de récupérer les informations utilisateur")
        }
      } catch (error: any) {
        console.error('Erreur lors du traitement du callback Google:', error)
        toast.error(error.message || "Erreur lors de l'authentification Google")
        navigate("/login", { replace: true })
      }
    }

    handleCallback()
  }, [searchParams, navigate, login])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Traitement de l'authentification Google...</p>
        <p className="text-sm text-muted-foreground mt-2">Veuillez patienter...</p>
      </div>
    </div>
  )
}

