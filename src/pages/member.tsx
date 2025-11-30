import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { eventsService, categoriesService, usersService, type Event as ApiEvent, type Category } from "../../api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import * as React from "react"
import { Link } from "react-router-dom"
import { Star, LogOut, Calendar, MapPin, Edit2, Shield, Loader2 } from 'lucide-react'

// Composant pour gérer l'affichage de l'image avec fallback
function EventImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = React.useState(false)

  if (imageError) {
    return <Calendar className="w-8 h-8 text-primary" />
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
    />
  )
}

export default function MemberSpace() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "events" | "favorites">("profile")

  const { user, refreshUser } = useAuth()
  
  // === Profil ===
  const [profile, setProfile] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    sport_preference: "",
    profile_picture_url: "",
  })
  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [savingProfile, setSavingProfile] = React.useState(false)

  // Charger les données du profil utilisateur
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoadingProfile(false)
        return
      }

      try {
        setLoadingProfile(true)
        const response = await usersService.getById(user.uid)
        if (response.data) {
          setProfile({
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            sport_preference: response.data.sport_preference || "",
            profile_picture_url: response.data.profile_picture_url || "",
          })
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement du profil:', err)
        // Ne pas afficher de toast pour éviter les erreurs en cascade
        // toast.error("Impossible de charger votre profil")
        // Utiliser les données de l'utilisateur connecté comme fallback
        if (user) {
          setProfile({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: "",
            sport_preference: "",
            profile_picture_url: "",
          })
        }
      } finally {
        setLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [user])

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSavingProfile(true)
      await usersService.update(user.uid, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || undefined,
        sport_preference: profile.sport_preference || undefined,
        profile_picture_url: profile.profile_picture_url || undefined,
      })
      await refreshUser() // Rafraîchir les données utilisateur
      toast.success("Profil mis à jour avec succès")
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err)
      toast.error(err.message || "Erreur lors de la mise à jour du profil")
    } finally {
      setSavingProfile(false)
    }
  }
  
  // === Événements inscrits ===
  const [registeredEvents, setRegisteredEvents] = React.useState<ApiEvent[]>([])
  const [loadingEvents, setLoadingEvents] = React.useState(true)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [unregisteringId, setUnregisteringId] = React.useState<string | null>(null)

  // === Favoris ===
  const [favorites, setFavorites] = React.useState<ApiEvent[]>([])
  const [loadingFavorites, setLoadingFavorites] = React.useState(true)

  // Charger les catégories pour afficher les noms
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await categoriesService.getAll()
        setCategories(categoriesResponse.data || [])
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories:', err)
        // Ne pas bloquer le rendu si les catégories ne se chargent pas
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  // Charger les événements inscrits
  React.useEffect(() => {
    const loadRegisteredEvents = async () => {
      if (!user) {
        setLoadingEvents(false)
        setRegisteredEvents([])
        return
      }

      try {
        setLoadingEvents(true)
        const response = await eventsService.getMyFreeRegistrations()
        
        // La réponse peut être un tableau d'événements ou un tableau d'objets avec {registration, event}
        let events: ApiEvent[] = []
        
        if (Array.isArray(response.data)) {
          // Vérifier si les éléments ont une structure {registration, event}
          if (response.data.length > 0 && response.data[0] && typeof response.data[0] === 'object' && 'event' in response.data[0]) {
            // Extraire les événements de la structure {registration, event}
            events = response.data
              .map((item: any) => item.event)
              .filter((event: any) => event !== null && event !== undefined)
          } else {
            // Sinon, c'est directement un tableau d'événements
            events = response.data
          }
        }
        
        // Log pour déboguer (à retirer en production)
        if (events.length > 0) {
          console.log('Événements chargés:', events)
          console.log('Premier événement:', events[0])
        }
        
        setRegisteredEvents(events)
      } catch (err: any) {
        console.error('Erreur lors du chargement des événements inscrits:', err)
        // Ne pas afficher de toast pour éviter les erreurs en cascade
        // toast.error("Impossible de charger vos événements inscrits")
        setRegisteredEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }

    loadRegisteredEvents()
  }, [user])

  // Créer un map des catégories pour accès rapide
  const categoryMap = React.useMemo(() => {
    if (!categories || categories.length === 0) return new Map<string, Category>()
    const map = new Map<string, Category>()
    categories.forEach(cat => map.set(cat.uid, cat))
    return map
  }, [categories])

  // Protection : si pas d'utilisateur, afficher un message
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground">Veuillez vous connecter pour accéder à votre espace membre.</p>
        </div>
      </div>
    )
  }

  // Charger les favoris
  React.useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoadingFavorites(false)
        setFavorites([])
        return
      }

      try {
        setLoadingFavorites(true)
        const response = await eventsService.getMyFavorites()
        
        // La réponse peut être un tableau d'événements ou un tableau d'objets avec {favorite, event}
        let events: ApiEvent[] = []
        
        if (Array.isArray(response.data)) {
          // Vérifier si les éléments ont une structure {favorite, event}
          if (response.data.length > 0 && response.data[0] && typeof response.data[0] === 'object' && 'event' in response.data[0]) {
            // Extraire les événements de la structure {favorite, event}
            events = response.data
              .map((item: any) => item.event)
              .filter((event: any) => event !== null && event !== undefined)
          } else {
            // Sinon, c'est directement un tableau d'événements
            events = response.data
          }
        }
        
        setFavorites(events)
      } catch (err: any) {
        console.error('Erreur lors du chargement des favoris:', err)
        setFavorites([])
      } finally {
        setLoadingFavorites(false)
      }
    }

    loadFavorites()
  }, [user])

  const removeFromFavorites = async (uid: string) => {
    try {
      await eventsService.removeFromFavorites(uid)
      // Retirer l'événement de la liste
      setFavorites(prev => prev.filter(e => e.uid !== uid))
      toast.success("Événement retiré des favoris")
    } catch (err: any) {
      console.error('Erreur lors de la suppression du favori:', err)
      toast.error(err.message || "Erreur lors de la suppression du favori")
    }
  }

  const removeFromRegistered = async (uid: string) => {
    try {
      setUnregisteringId(uid)
      await eventsService.unregisterFree(uid)
      // Retirer l'événement de la liste
      setRegisteredEvents(prev => prev.filter(e => e.uid !== uid))
      toast.success("Désinscription réussie")
    } catch (err: any) {
      console.error('Erreur lors de la désinscription:', err)
      toast.error(err.message || "Erreur lors de la désinscription")
    } finally {
      setUnregisteringId(null)
    }
  }

  // Obtenir le nom de la catégorie pour un événement
  const getCategoryName = (event: ApiEvent): string | undefined => {
    if (event.category && typeof event.category === 'object' && 'name' in event.category) {
      return event.category.name
    } else if (event.category_uid && categoryMap) {
      const category = categoryMap.get(event.category_uid)
      return category?.name
    }
    return undefined
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-10 text-center">
          <div className="inline-block bg-primary/10 px-4 py-1 rounded-full mb-3 text-primary font-medium">
            Espace Personnel
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-1 leading-tight">Espace Membre</h1>
          <p className="text-lg text-muted-foreground">
            Bienvenue, <span className="text-primary font-semibold">
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : `${profile.first_name} ${profile.last_name}`.trim() || 'Utilisateur'}
            </span>
          </p>
        </div>

        {/* Carte principale avec Tabs */}
        <Card className="shadow-xl border border-border/50 rounded-2xl backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <CardHeader className="border-b p-0">
              <TabsList className="flex w-full bg-transparent px-2 pt-2">
                {["profile", "events", "favorites"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-1 py-4 text-base font-medium rounded-lg transition-all
                    data-[state=active]:bg-background data-[state=active]:shadow-sm 
                    data-[state=active]:text-primary"
                  >
                    {tab === "profile" ? "Mon Profil" : tab === "events" ? "Mes Événements" : "Favoris"}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>

            <CardContent className="p-0">
              {/* === PROFIL === */}
              <TabsContent value="profile" className="p-8 space-y-8">
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Chargement de votre profil...</span>
                  </div>
                ) : (
                  <>
                    {/* Avatar + Info Card */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8 
                      bg-muted/40 rounded-2xl border border-border/60 shadow-sm">
                      <Avatar className="h-32 w-32 ring-2 ring-primary shadow-lg rounded-xl">
                        <AvatarImage src={profile.profile_picture_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                          {`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                          <h2 className="text-2xl font-bold text-foreground">
                            {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur'}
                          </h2>
                          <Badge>Membre Actif</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{profile.email}</p>
                        {profile.sport_preference && categoryMap && categoryMap.has(profile.sport_preference) && (
                          <div className="inline-block px-3 py-1 bg-background rounded-full text-sm font-medium text-primary border border-primary/20">
                            🏃 {categoryMap.get(profile.sport_preference)?.name || 'Sport'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulaire de profil */}
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <Edit2 className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold text-foreground">Modifier mes informations</h3>
                      </div>
                      <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Prénom</label>
                            <Input
                              value={profile.first_name}
                              onChange={(e) => updateProfile("first_name", e.target.value)}
                              placeholder="Jean"
                              className="bg-background border-border focus-visible:ring-primary/40 rounded-xl"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Nom</label>
                            <Input
                              value={profile.last_name}
                              onChange={(e) => updateProfile("last_name", e.target.value)}
                              placeholder="Dupont"
                              className="bg-background border-border focus-visible:ring-primary/40 rounded-xl"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Email</label>
                            <Input
                              type="email"
                              value={profile.email}
                              disabled
                              className="bg-muted border-border rounded-xl cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Téléphone</label>
                            <Input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => updateProfile("phone", e.target.value)}
                              placeholder="+33 6 12 34 56 78"
                              className="bg-background border-border focus-visible:ring-primary/40 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-muted-foreground">Discipline sportive</label>
                          <Select 
                            value={profile.sport_preference || "none"} 
                            onValueChange={(v) => updateProfile("sport_preference", v === "none" ? "" : v)}
                          >
                            <SelectTrigger className="bg-background border-border focus-visible:ring-primary/40 rounded-xl">
                              <SelectValue placeholder="Choisissez une discipline" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
                              <SelectItem value="none">Aucune préférence</SelectItem>
                              {categories.filter(cat => cat.active).map((category) => (
                                <SelectItem key={category.uid} value={category.uid}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                          <Button 
                            type="submit" 
                            disabled={savingProfile}
                            className="font-medium flex-1 sm:flex-initial rounded-xl h-12 text-base shadow-md hover:shadow-lg transition-all"
                          >
                            {savingProfile ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Enregistrer les modifications
                              </>
                            )}
                          </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1 sm:flex-initial rounded-xl h-12 text-base shadow-md hover:shadow-lg transition-all">
                            <LogOut className="w-4 h-4 mr-2" />
                            Supprimer mon compte
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le compte ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Toutes vos données seront perdues définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction>Confirmer la suppression</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </form>
                </div>
                  </>
                )}
              </TabsContent>

              {/* === MES ÉVÉNEMENTS === */}
              <TabsContent value="events" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Événements inscrits</h3>
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Chargement de vos événements...</span>
                  </div>
                ) : registeredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {registeredEvents.map((event) => {
                      const categoryName = getCategoryName(event)
                      
                      // Formater la date de manière sécurisée
                      let formattedDate = "Date non disponible"
                      if (event.start_date) {
                        try {
                          // Nettoyer la date si nécessaire (enlever les espaces, etc.)
                          const dateStr = String(event.start_date).trim()
                          const startDate = new Date(dateStr)
                          
                          if (!isNaN(startDate.getTime())) {
                            // Utiliser toLocaleString pour inclure l'heure
                            formattedDate = startDate.toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          } else {
                            console.warn('Date invalide pour l\'événement:', event.uid, 'date:', dateStr)
                          }
                        } catch (e) {
                          console.error('Erreur de formatage de date:', e, 'date originale:', event.start_date)
                        }
                      } else {
                        console.warn('Pas de start_date pour l\'événement:', event.uid)
                      }
                      
                      // Vérifier que l'image URL est valide
                      const hasValidImage = event.image_url && 
                        typeof event.image_url === 'string' &&
                        event.image_url.trim() !== '' &&
                        (event.image_url.startsWith('http://') || 
                         event.image_url.startsWith('https://') || 
                         event.image_url.startsWith('/') ||
                         event.image_url.startsWith('data:'))
                      
                      return (
                        <div
                          key={event.uid}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 
                            border rounded-2xl bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all group"
                        >
                          <div className="flex items-start gap-4 flex-1 w-full">
                            <div className="bg-secondary border-2 border-primary rounded-lg w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                              {hasValidImage && event.image_url ? (
                                <EventImageWithFallback 
                                  src={event.image_url} 
                                  alt={event.title || 'Événement'} 
                                />
                              ) : (
                                <Calendar className="w-8 h-8 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/events/ev-${event.uid}`} 
                                className="font-semibold text-foreground hover:text-primary transition-colors block mb-2 line-clamp-2"
                              >
                                {event.title ? String(event.title).trim() : 'Événement sans titre'}
                              </Link>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{formattedDate}</span>
                                </span>
                                {event.location && String(event.location).trim() && (
                                  <>
                                    <span className="hidden sm:inline text-border">•</span>
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span className="line-clamp-1">{String(event.location).trim()}</span>
                                    </span>
                                  </>
                                )}
                                {categoryName && (
                                  <>
                                    <span className="hidden sm:inline text-border">•</span>
                                    <Badge variant="secondary">{categoryName}</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromRegistered(event.uid)}
                            disabled={unregisteringId === event.uid}
                            className="mt-3 sm:mt-0 w-full sm:w-auto rounded-xl"
                          >
                            {unregisteringId === event.uid ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                Désinscription...
                              </>
                            ) : (
                              <>
                                <LogOut className="w-4 h-4 mr-1.5" />
                                Se désinscrire
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted rounded-2xl border border-dashed">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium">Aucun événement inscrit pour le moment.</p>
                    <p className="text-sm text-muted-foreground mt-1">Explorez nos événements et inscrivez-vous !</p>
                  </div>
                )}
              </TabsContent>

              {/* === FAVORIS === */}
              <TabsContent value="favorites" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Événements favoris</h3>
                {loadingFavorites ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Chargement de vos favoris...</span>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="space-y-4">
                    {favorites.map((event) => {
                      const categoryName = getCategoryName(event)
                      
                      // Formater la date de manière sécurisée
                      let formattedDate = "Date non disponible"
                      if (event.start_date) {
                        try {
                          const dateStr = String(event.start_date).trim()
                          const startDate = new Date(dateStr)
                          
                          if (!isNaN(startDate.getTime())) {
                            formattedDate = startDate.toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        } catch (e) {
                          console.error('Erreur de formatage de date:', e)
                        }
                      }
                      
                      // Vérifier que l'image URL est valide
                      const hasValidImage = event.image_url && 
                        typeof event.image_url === 'string' &&
                        event.image_url.trim() !== '' &&
                        (event.image_url.startsWith('http://') || 
                         event.image_url.startsWith('https://') || 
                         event.image_url.startsWith('/') ||
                         event.image_url.startsWith('data:'))
                      
                      return (
                        <div
                          key={event.uid}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 
                            border rounded-2xl bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all group"
                        >
                          <div className="flex items-start gap-4 flex-1 w-full">
                            <div className="bg-secondary border-2 border-primary rounded-lg w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                              {hasValidImage && event.image_url ? (
                                <EventImageWithFallback 
                                  src={event.image_url} 
                                  alt={event.title || 'Événement'} 
                                />
                              ) : (
                                <Calendar className="w-8 h-8 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/events/ev-${event.uid}`} 
                                className="font-semibold text-foreground hover:text-primary transition-colors block mb-2 line-clamp-2"
                              >
                                {event.title ? String(event.title).trim() : 'Événement sans titre'}
                              </Link>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{formattedDate}</span>
                                </span>
                                {event.location && String(event.location).trim() && (
                                  <>
                                    <span className="hidden sm:inline text-border">•</span>
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span className="line-clamp-1">{String(event.location).trim()}</span>
                                    </span>
                                  </>
                                )}
                                {categoryName && (
                                  <>
                                    <span className="hidden sm:inline text-border">•</span>
                                    <Badge variant="secondary">{categoryName}</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromFavorites(event.uid)}
                            className="mt-3 sm:mt-0 w-full sm:w-auto text-amber-500 hover:text-amber-600"
                          >
                            <Star className="w-4 h-4 mr-1.5 fill-current" />
                            Retirer des favoris
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted rounded-2xl border border-dashed">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium">Aucun favori ajouté.</p>
                    <p className="text-sm text-muted-foreground mt-1">Parcourez les événements pour ajouter vos favoris !</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
