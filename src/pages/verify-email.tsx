import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { authService } from "../../api"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") || ""
  
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Email manquant. Veuillez réessayer l'inscription.")
      navigate("/signup")
      return
    }

    if (!otp || otp.length < 4) {
      toast.error("Veuillez entrer un code OTP valide")
      return
    }

    setLoading(true)

    try {
      const response = await authService.verifyEmail({
        email,
        otp,
      })

      if (response.status === "success") {
        toast.success("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.")
        navigate("/login")
      } else {
        toast.error(response.message || "Erreur lors de la vérification du code")
      }
    } catch (err: any) {
      toast.error(err.message || "Code OTP invalide. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email manquant")
      return
    }

    setResending(true)

    try {
      const response = await authService.resendOTP({ email })
      
      if (response.status === "success") {
        toast.success("Un nouveau code OTP a été envoyé à votre adresse email")
        // En mode dev, l'OTP peut être dans la réponse
        if (response.data?.otp) {
          toast.info(`Code OTP (dev) : ${response.data.otp}`)
        }
      } else {
        toast.error(response.message || "Erreur lors de l'envoi du code")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du code OTP")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Vérifiez votre email</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Nous avons envoyé un code de vérification à
                  </p>
                  {email && (
                    <p className="font-semibold text-sm">{email}</p>
                  )}
                </div>

                <Field>
                  <FieldLabel htmlFor="otp">Code de vérification</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                  <FieldDescription>
                    Entrez le code à 6 chiffres reçu par email
                  </FieldDescription>
                </Field>

                <Field>
                  <Button type="submit" disabled={loading || !otp} className="w-full">
                    {loading ? "Vérification..." : "Vérifier le code"}
                  </Button>
                </Field>

                <Field>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Vous n'avez pas reçu le code ?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="w-full"
                    >
                      {resending ? "Envoi..." : "Renvoyer le code"}
                    </Button>
                  </div>
                </Field>

                <Field>
                  <FieldDescription className="text-center">
                    <a href="/login" className="underline underline-offset-4">
                      Retour à la connexion
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/signup.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}





