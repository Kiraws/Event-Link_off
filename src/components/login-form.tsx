import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { authService, getRoleFromToken } from "../../api"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "reset">("email")
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("")
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState("")
  const [forgotPasswordConfirmPassword, setForgotPasswordConfirmPassword] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.login({
        email,
        password,
      })

      if (response.data?.token && response.data?.user) {
        // Le token est automatiquement sauvegardé par le service
        // Mettre à jour le contexte d'authentification
        login(response.data.user, response.data.token)
        
        toast.success("Connexion réussie !")
        
        // Extraire le rôle depuis le JWT (comme indiqué dans la documentation)
        // Le rôle peut ne pas être dans response.data.user, mais il est dans le JWT
        const userRole = response.data.user.role || getRoleFromToken(response.data.token)
        const normalizedRole = userRole?.toUpperCase().trim()
        
        console.log('Rôle depuis user:', response.data.user.role)
        console.log('Rôle depuis JWT:', getRoleFromToken(response.data.token))
        console.log('Rôle final utilisé:', normalizedRole)
        
        // Utiliser replace: true pour éviter les problèmes de navigation
        if (normalizedRole === 'ADMIN') {
          console.log('Redirection vers /dashboard (ADMIN)')
          navigate("/dashboard", { replace: true })
        } else if (normalizedRole === 'MODERATOR' || normalizedRole === 'ORGANIZER') {
          console.log('Redirection vers /dashboard (MODERATOR/ORGANIZER)')
          navigate("/dashboard", { replace: true })
        } else {
          // USER ou rôle non reconnu -> rediriger vers /events
          console.log('Redirection vers /events (USER ou rôle non reconnu)')
          navigate("/events", { replace: true })
        }
      } else {
        console.error('Réponse invalide:', response)
        toast.error("Une erreur est survenue lors de la connexion")
      }
    } catch (err: any) {
      // Vérifier si l'erreur indique que l'email n'est pas vérifié
      const errorMessage = (err.message || err.error || '').toLowerCase()
      const errorCode = (err.code || err.status || '').toLowerCase()
      
      // Vérifier plusieurs variantes du message d'erreur
      const isEmailNotVerified = 
        (errorMessage.includes('email') && 
         (errorMessage.includes('not verified') || 
          errorMessage.includes('non vérifié') ||
          errorMessage.includes('non verifié') ||
          errorMessage.includes('vérifier') ||
          errorMessage.includes('verify') ||
          errorMessage.includes('otp') ||
          errorMessage.includes('code de vérification'))) ||
        errorCode.includes('email_not_verified') ||
        errorCode === '403' // Code HTTP 403 peut indiquer email non vérifié
      
      if (isEmailNotVerified) {
        // Rediriger vers la page de vérification email
        toast.error("Votre email n'a pas été vérifié. Veuillez entrer le code OTP.")
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(err.message || err.error || "Erreur lors de la connexion. Vérifiez vos identifiants.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (loading) return

    try {
      setLoading(true)
      
      // Le backend gère Google OAuth
      // Rediriger vers l'endpoint backend qui gère la redirection Google OAuth
      // Le backend utilisera FRONTEND_URL pour rediriger vers /auth/google/callback
      const { API_CONFIG } = await import('../../api/config')
      const redirectUrl = `${API_CONFIG.baseUrl}/api/auth/google/redirect`
      
      // Rediriger vers le backend qui gère Google OAuth
      window.location.href = redirectUrl
    } catch (error: any) {
      console.error('Erreur lors de l\'authentification Google:', error)
      toast.error(error.message || "Erreur lors de l'authentification Google")
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Connectez-vous à votre compte</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Saisissez votre adresse e-mail ci-dessous pour vous connecter à votre compte
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Mot de passe oublié?
            </button>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </Field>
        <FieldSeparator>Ou continuez avec</FieldSeparator>
        <Field>
          <Button 
            variant="outline" 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Se connecter avec Google
          </Button>
          <FieldDescription className="text-center">
            Vous n'avez pas de compte ?{" "}
            <a href="/signup" className="underline underline-offset-4">
              S'inscrire
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>

      {/* Dialog Mot de passe oublié */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mot de passe oublié</DialogTitle>
            <DialogDescription>
              {forgotPasswordStep === "email" 
                ? "Entrez votre adresse email pour recevoir un code de réinitialisation"
                : "Entrez le code reçu par email et votre nouveau mot de passe"}
            </DialogDescription>
          </DialogHeader>

          {forgotPasswordStep === "email" ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                
                // Nettoyer l'email : trim, minuscules, supprimer espaces et caractères invisibles
                let cleanedEmail = forgotPasswordEmail.trim().toLowerCase()
                cleanedEmail = cleanedEmail.replace(/\s+/g, '') // Supprimer tous les espaces
                cleanedEmail = cleanedEmail.replace(/[\u200B-\u200D\uFEFF]/g, '') // Supprimer caractères invisibles
                
                // Mettre à jour l'état avec l'email nettoyé immédiatement
                if (cleanedEmail !== forgotPasswordEmail) {
                  setForgotPasswordEmail(cleanedEmail)
                }
                
                if (!cleanedEmail) {
                  toast.error("Veuillez entrer votre adresse email")
                  return
                }

                // Validation stricte du format email (RFC 5322 simplifié)
                // Autorise: lettres, chiffres, . _ % + - avant @, puis domaine valide
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                
                if (!emailRegex.test(cleanedEmail)) {
                  toast.error("Format d'email invalide. Veuillez vérifier votre adresse email.")
                  return
                }

                // Validation supplémentaire : longueur raisonnable
                if (cleanedEmail.length > 254) {
                  toast.error("L'adresse email est trop longue")
                  return
                }

                try {
                  setForgotPasswordLoading(true)
                  
                  // Préparer l'objet de requête avec email nettoyé
                  const requestBody = {
                    email: cleanedEmail
                  }
                  
                  console.log('Requête forgotPassword:', JSON.stringify(requestBody))
                  
                  const response = await authService.forgotPassword(requestBody)

                  if (response.data?.emailSent) {
                    toast.success("Un code de réinitialisation a été envoyé à votre email")
                    setForgotPasswordStep("reset")
                  } else {
                    toast.error("Erreur lors de l'envoi du code")
                  }
                } catch (error: any) {
                  console.error('Erreur complète lors de la demande de réinitialisation:', error)
                  console.error('Email qui a causé l\'erreur:', cleanedEmail)
                  
                  // Vérifier différents types d'erreurs
                  const errorMessage = error.message || error.error || ''
                  const errorString = errorMessage.toString().toLowerCase()
                  
                  // Gérer spécifiquement l'erreur de format email
                  if (errorString.includes("format") || errorString.includes("must match format")) {
                    toast.error("Format d'email invalide. Veuillez vérifier votre adresse email.")
                    // Réinitialiser le champ pour permettre une nouvelle saisie
                    setForgotPasswordEmail('')
                  } else if (errorString.includes("not found") || errorString.includes("trouvé")) {
                    toast.error("Aucun compte n'est associé à cet email.")
                  } else {
                    toast.error(errorMessage || "Erreur lors de la demande de réinitialisation")
                  }
                } finally {
                  setForgotPasswordLoading(false)
                }
              }}
              className="space-y-4"
            >
              <Field>
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => {
                    // Enlever les espaces automatiquement
                    const value = e.target.value.replace(/\s/g, '')
                    setForgotPasswordEmail(value)
                  }}
                  placeholder="votre@email.com"
                  required
                  disabled={forgotPasswordLoading}
                  autoComplete="email"
                />
              </Field>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotPasswordOpen(false)
                    setForgotPasswordStep("email")
                    setForgotPasswordEmail("")
                  }}
                  disabled={forgotPasswordLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Envoi..." : "Envoyer le code"}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!forgotPasswordOtp) {
                  toast.error("Veuillez entrer le code OTP")
                  return
                }
                if (!forgotPasswordNewPassword) {
                  toast.error("Veuillez entrer un nouveau mot de passe")
                  return
                }
                if (forgotPasswordNewPassword.length < 6) {
                  toast.error("Le mot de passe doit contenir au moins 6 caractères")
                  return
                }
                if (forgotPasswordNewPassword !== forgotPasswordConfirmPassword) {
                  toast.error("Les mots de passe ne correspondent pas")
                  return
                }

                try {
                  setForgotPasswordLoading(true)
                  await authService.resetPassword({
                    email: forgotPasswordEmail,
                    otp: forgotPasswordOtp,
                    newPassword: forgotPasswordNewPassword,
                  })

                  toast.success("Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.")
                  setForgotPasswordOpen(false)
                  setForgotPasswordStep("email")
                  setForgotPasswordEmail("")
                  setForgotPasswordOtp("")
                  setForgotPasswordNewPassword("")
                  setForgotPasswordConfirmPassword("")
                } catch (error: any) {
                  console.error('Erreur lors de la réinitialisation:', error)
                  toast.error(error.message || "Erreur lors de la réinitialisation du mot de passe")
                } finally {
                  setForgotPasswordLoading(false)
                }
              }}
              className="space-y-4"
            >
              <Field>
                <FieldLabel htmlFor="forgot-otp">Code OTP</FieldLabel>
                <Input
                  id="forgot-otp"
                  type="text"
                  value={forgotPasswordOtp}
                  onChange={(e) => setForgotPasswordOtp(e.target.value)}
                  placeholder="Entrez le code reçu par email"
                  required
                  disabled={forgotPasswordLoading}
                />
                <FieldDescription>Le code est valide pendant 15 minutes</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="forgot-new-password">Nouveau mot de passe</FieldLabel>
                <Input
                  id="forgot-new-password"
                  type="password"
                  value={forgotPasswordNewPassword}
                  onChange={(e) => setForgotPasswordNewPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                  minLength={6}
                  disabled={forgotPasswordLoading}
                />
                <FieldDescription>Minimum 6 caractères</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="forgot-confirm-password">Confirmer le mot de passe</FieldLabel>
                <Input
                  id="forgot-confirm-password"
                  type="password"
                  value={forgotPasswordConfirmPassword}
                  onChange={(e) => setForgotPasswordConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                  minLength={6}
                  disabled={forgotPasswordLoading}
                />
              </Field>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotPasswordStep("email")
                    setForgotPasswordOtp("")
                    setForgotPasswordNewPassword("")
                    setForgotPasswordConfirmPassword("")
                  }}
                  disabled={forgotPasswordLoading}
                >
                  Retour
                </Button>
                <Button type="submit" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Réinitialisation..." : "Réinitialiser"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}
