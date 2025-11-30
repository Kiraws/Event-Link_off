import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authService } from "../../api"

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Séparer le nom complet en prénom et nom
      const nameParts = formData.first_name.trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || formData.last_name || ""

      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName || firstName, // Utiliser le prénom comme nom si vide
        phone: formData.phone || undefined,
      })

      // L'inscription a réussi (si on arrive ici, c'est que l'API a retourné une réponse valide)
      // On redirige toujours vers la page de vérification email après une inscription réussie
      toast.success("Inscription réussie ! Un code de vérification a été envoyé à votre email.")
      
      // Afficher l'OTP en mode dev s'il est présent dans la réponse
      if (response.data?.otp) {
        toast.info(`Code OTP (dev) : ${response.data.otp}`, { duration: 10000 })
      }
      
      // Rediriger vers la page de vérification email avec l'email en paramètre
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err: any) {
      // Si l'erreur est de type ApiResponse, vérifier le message
      const errorMessage = err.message || err.error || "Erreur lors de l'inscription. Veuillez réessayer."
      
      // Si l'inscription a peut-être réussi mais qu'il y a eu une erreur (ex: email déjà utilisé)
      // On vérifie le message d'erreur pour voir si on doit quand même rediriger
      if (errorMessage.includes("vérif") || errorMessage.includes("vérification") || errorMessage.includes("OTP")) {
        toast.warning("Veuillez vérifier votre email pour le code de vérification.")
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
      console.error('Erreur lors de l\'inscription Google:', error)
      toast.error(error.message || "Erreur lors de l'inscription Google")
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-1 items-center text-center ">
          <h1 className="text-2xl font-bold">Créer votre compte</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Remplissez le formulaire ci-dessous pour créer votre compte
          </p>
        </div>
        
        <Field>
          <FieldLabel htmlFor="first_name">Prénom</FieldLabel>
          <Input 
            id="first_name" 
            type="text" 
            placeholder="Jean" 
            required 
            value={formData.first_name}
            onChange={handleChange}
            disabled={loading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="last_name">Nom de famille</FieldLabel>
          <Input 
            id="last_name" 
            type="text" 
            placeholder="Dupont" 
            required 
            value={formData.last_name}
            onChange={handleChange}
            disabled={loading}
          />
        </Field>
     
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@exemple.com" 
            required 
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Téléphone (optionnel)</FieldLabel>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="+33 6 12 34 56 78" 
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </Field>
      
        <Field>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <Input 
            id="password" 
            type="password" 
            required 
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            minLength={6}
          />
          <FieldDescription>Minimum 6 caractères.</FieldDescription>
        </Field>
        
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Inscription..." : "Créer un compte"}
          </Button>
        </Field>
        
        <FieldSeparator>Ou </FieldSeparator>
        
        <Field className="grid gap-4 sm:grid-cols-1">
          <Button 
            variant="outline" 
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continuer avec Google
          </Button>
        </Field>
        
        <Field>
          <FieldDescription className="px-6 text-center">
            Vous avez déjà un compte ? <a href="/login" className="underline underline-offset-4">Se connecter</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
