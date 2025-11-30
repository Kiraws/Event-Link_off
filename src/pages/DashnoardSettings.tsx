import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { usersService, categoriesService, getRoleFromToken, authService, type Category } from "../../api"
import { toast } from "sonner"

export default function DashboardSettings() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = React.useState<"profile" | "account" | "appearance" | "notifications" | "display">("profile")
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])

  // Form state
  const [profileForm, setProfileForm] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    sport_preference: "",
  })

  const [accountForm, setAccountForm] = React.useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  })

  // Charger les données de l'utilisateur et les catégories
  React.useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Charger les données de l'utilisateur
        const userResponse = await usersService.getById(user.uid)
        if (userResponse.data) {
          setProfileForm({
            first_name: userResponse.data.first_name || "",
            last_name: userResponse.data.last_name || "",
            email: userResponse.data.email || "",
            phone: userResponse.data.phone || "",
            sport_preference: userResponse.data.sport_preference || "",
          })
        }

        // Charger les catégories actives
        try {
          console.log('Chargement des catégories avec active: true...')
          let categoriesResponse = await categoriesService.getAll({ active: true })
          console.log('Réponse complète des catégories (active: true):', categoriesResponse)
          
          // La réponse peut être directement un tableau ou dans data
          let categoriesArray: Category[] = []
          if (Array.isArray(categoriesResponse.data)) {
            categoriesArray = categoriesResponse.data
          } else if (Array.isArray(categoriesResponse)) {
            categoriesArray = categoriesResponse
          }
          
          // Si aucune catégorie active trouvée, charger toutes les catégories
          if (categoriesArray.length === 0) {
            console.log('Aucune catégorie active trouvée, chargement de toutes les catégories...')
            categoriesResponse = await categoriesService.getAll()
            console.log('Réponse complète des catégories (toutes):', categoriesResponse)
            
            if (Array.isArray(categoriesResponse.data)) {
              categoriesArray = categoriesResponse.data
            } else if (Array.isArray(categoriesResponse)) {
              categoriesArray = categoriesResponse
            }
            
            // Filtrer pour ne garder que les actives côté client
            categoriesArray = categoriesArray.filter(cat => cat.active === true)
          }
          
          console.log('Catégories finales chargées:', categoriesArray.length, categoriesArray)
          setCategories(categoriesArray)
        } catch (categoriesError: any) {
          console.error('Erreur lors du chargement des catégories:', categoriesError)
          // Ne pas bloquer le chargement des autres données si les catégories échouent
          setCategories([])
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error)
        toast.error("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const updateProfile = (key: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateAccount = (key: keyof typeof accountForm, value: string) => {
    setAccountForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      const updateData: any = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
      }
      
      if (profileForm.phone) {
        updateData.phone = profileForm.phone
      }
      
      if (profileForm.sport_preference) {
        updateData.sport_preference = profileForm.sport_preference
      } else {
        // Si aucune préférence, on peut passer null ou undefined selon l'API
        updateData.sport_preference = null
      }
      
      await usersService.update(user.uid, updateData)
      
      toast.success("Profil mis à jour avec succès")
      await refreshUser() // Rafraîchir les données utilisateur dans le contexte
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      toast.error(error.message || "Erreur lors de la mise à jour du profil")
    } finally {
      setSaving(false)
    }
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!accountForm.oldPassword) {
      toast.error("Veuillez entrer votre ancien mot de passe")
      return
    }

    if (!accountForm.password) {
      toast.error("Veuillez entrer un nouveau mot de passe")
      return
    }

    if (accountForm.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (accountForm.password !== accountForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    try {
      setSaving(true)
      await authService.changePassword({
        oldPassword: accountForm.oldPassword,
        newPassword: accountForm.password,
      })
      
      toast.success("Mot de passe modifié avec succès")
      setAccountForm({
        oldPassword: "",
        password: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error)
      toast.error(error.message || "Erreur lors du changement de mot de passe")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          {/* CHANGED: header to match Settings page */}
          <CardTitle className="text-2xl">Paramètres</CardTitle>
          {/* Optional subtext */}
          <p className="text-muted-foreground text-sm">
            Gérez les paramètres de votre compte et vos préférences e‑mail.
          </p>
        </CardHeader>
        <CardContent>
          {/* INSERT: two-column layout with sidebar and content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 md:col-span-3">
              <nav className="flex md:flex-col gap-2">
                <Button variant={tab === "profile" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("profile")}>
                  Profil
                </Button>
                <Button variant={tab === "account" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("account")}>
                  Compte
                </Button>
                <Button variant={tab === "appearance" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("appearance")}>
                  Apparence
                </Button>
                <Button variant={tab === "notifications" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("notifications")}>
                  Notifications
                </Button>
                <Button variant={tab === "display" ? "secondary" : "ghost"} className="justify-start" onClick={() => setTab("display")}>
                  Affichage
                </Button>
              </nav>
            </aside>

            {/* Content */}
            <section className="col-span-12 md:col-span-9">
              {/* PROFILE TAB */}
              {tab === "profile" && (
                <form
                  className="flex flex-col gap-6 bg-white dark:bg-white p-6 rounded-lg border border-gray-200 dark:border-gray-200"
                  onSubmit={handleProfileSubmit}
                >
                  <FieldGroup>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold">Profil</h2>
                      <p className="text-muted-foreground text-sm">Gérez vos informations personnelles.</p>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="first_name">Prénom</FieldLabel>
                      <Input 
                        id="first_name" 
                        value={profileForm.first_name} 
                        onChange={(e) => updateProfile("first_name", e.target.value)} 
                        placeholder="Votre prénom"
                        disabled={loading || saving}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="last_name">Nom</FieldLabel>
                      <Input 
                        id="last_name" 
                        value={profileForm.last_name} 
                        onChange={(e) => updateProfile("last_name", e.target.value)} 
                        placeholder="Votre nom"
                        disabled={loading || saving}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input 
                        id="email" 
                        type="email"
                        value={profileForm.email} 
                        disabled
                        className="bg-muted"
                      />
                      <FieldDescription>L'email ne peut pas être modifié.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
                      <Input 
                        id="phone" 
                        type="tel"
                        value={profileForm.phone} 
                        onChange={(e) => updateProfile("phone", e.target.value)} 
                        placeholder="+33 6 12 34 56 78"
                        disabled={loading || saving}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="sport_preference">Discipline sportive</FieldLabel>
                      <Select 
                        value={profileForm.sport_preference || "none"} 
                        onValueChange={(v) => updateProfile("sport_preference", v === "none" ? "" : v)}
                        disabled={loading || saving}
                      >
                        <SelectTrigger id="sport_preference">
                          <SelectValue placeholder="Sélectionnez une discipline" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
                          <SelectItem value="none" className="bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100">
                            Aucune préférence
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem 
                              key={category.uid} 
                              value={category.uid}
                              className="bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:bg-gray-100 dark:focus:bg-gray-100"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading || saving}>
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={async () => {
                          if (!user) return
                          try {
                            setLoading(true)
                            const userResponse = await usersService.getById(user.uid)
                            if (userResponse.data) {
                              setProfileForm({
                                first_name: userResponse.data.first_name || "",
                                last_name: userResponse.data.last_name || "",
                                email: userResponse.data.email || "",
                                phone: userResponse.data.phone || "",
                                sport_preference: userResponse.data.sport_preference || "",
                              })
                            }
                          } catch (error) {
                            console.error('Erreur lors du rechargement:', error)
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading || saving}
                      >
                        Annuler
                      </Button>
                    </div>
                  </FieldGroup>
                </form>
              )}

              {/* ACCOUNT TAB */}
              {tab === "account" && (
                <div className="flex flex-col gap-6">
                  {/* Informations du compte */}
                  <FieldGroup>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold">Informations du compte</h2>
                      <p className="text-muted-foreground text-sm">Informations de votre compte.</p>
                    </div>

                    {user && (
                      <div className="space-y-4">
                        <Field>
                          <FieldLabel>Email</FieldLabel>
                          <Input 
                            value={user.email} 
                            disabled
                            className="bg-muted"
                          />
                          <FieldDescription>Votre adresse email de connexion.</FieldDescription>
                        </Field>

                        <Field>
                          <FieldLabel>Rôle</FieldLabel>
                          <Input 
                            value={(() => {
                              // Obtenir le rôle depuis user.role ou depuis le JWT
                              const userRole = user.role || getRoleFromToken() || 'USER'
                              return userRole === 'ADMIN' ? 'Administrateur' : 
                                     userRole === 'MODERATOR' ? 'Modérateur' :
                                     userRole === 'ORGANIZER' ? 'Organisateur' : 'Utilisateur'
                            })()} 
                            disabled
                            className="bg-muted"
                          />
                          <FieldDescription>Votre rôle dans l'application.</FieldDescription>
                        </Field>

                        {(user as any).created_at && (
                          <Field>
                            <FieldLabel>Date de création</FieldLabel>
                            <Input 
                              value={new Date((user as any).created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} 
                              disabled
                              className="bg-muted"
                            />
                          </Field>
                        )}
                      </div>
                    )}
                  </FieldGroup>

                  {/* Changement de mot de passe */}
                  <form
                    className="flex flex-col gap-6"
                    onSubmit={handleAccountSubmit}
                  >
                    <FieldGroup>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
                        <p className="text-muted-foreground text-sm">Modifiez votre mot de passe pour sécuriser votre compte.</p>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="oldPassword">Ancien mot de passe</FieldLabel>
                        <Input 
                          id="oldPassword" 
                          type="password" 
                          value={accountForm.oldPassword} 
                          onChange={(e) => updateAccount("oldPassword", e.target.value)}
                          placeholder="Entrez votre ancien mot de passe"
                          disabled={loading || saving}
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
                        <Input 
                          id="password" 
                          type="password" 
                          value={accountForm.password} 
                          onChange={(e) => updateAccount("password", e.target.value)}
                          placeholder="Entrez un nouveau mot de passe"
                          disabled={loading || saving}
                          minLength={6}
                          required
                        />
                        <FieldDescription>Minimum 6 caractères.</FieldDescription>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={accountForm.confirmPassword} 
                          onChange={(e) => updateAccount("confirmPassword", e.target.value)}
                          placeholder="Confirmez le nouveau mot de passe"
                          disabled={loading || saving}
                          minLength={6}
                        />
                      </Field>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading || saving}>
                          {saving ? "Enregistrement..." : "Changer le mot de passe"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setAccountForm({
                              oldPassword: "",
                              password: "",
                              confirmPassword: "",
                            })
                          }}
                          disabled={loading || saving}
                        >
                          Annuler
                        </Button>
                      </div>
                    </FieldGroup>
                  </form>
                </div>
              )}

              {/* PLACEHOLDER TABS */}
              {tab === "appearance" && <div className="text-muted-foreground">Appearance settings coming soon…</div>}
              {tab === "notifications" && <div className="text-muted-foreground">Notification settings coming soon…</div>}
              {tab === "display" && <div className="text-muted-foreground">Display settings coming soon…</div>}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
