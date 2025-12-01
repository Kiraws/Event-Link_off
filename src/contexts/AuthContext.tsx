import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService, hasAuthToken } from '../../api'
import type { User } from '../../api'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Charger l'utilisateur en arrière-plan si un token existe
  useEffect(() => {
    const loadUser = async () => {
      if (hasAuthToken()) {
        // Ne pas bloquer l'UI, vérifier en arrière-plan
        try {
          const response = await authService.me()
          if (response.data) {
            setUser(response.data)
          }
        } catch (error) {
          // Token invalide ou expiré - nettoyer en arrière-plan
          console.error('Erreur lors du chargement de l\'utilisateur:', error)
          authService.logout()
          setUser(null)
        }
      }
    }

    // Exécuter la vérification sans bloquer
    loadUser()
  }, [])

  const login = (userData: User, _token: string) => {
    setUser(userData)
    // Le token est déjà sauvegardé par authService.login()
  }

  const logout = () => {
    setUser(null)
    authService.logout()
  }

  const refreshUser = async () => {
    if (hasAuthToken()) {
      try {
        const response = await authService.me()
        if (response.data) {
          setUser(response.data)
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
        logout()
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false, // Toujours false car la vérification se fait en arrière-plan
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


