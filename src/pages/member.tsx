import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { mockWideEvents } from "@/data/mock-events"
import * as React from "react"
import { Link } from "react-router-dom"
import { Star, LogOut, Calendar, MapPin, Ticket, Edit2, Shield } from 'lucide-react'

export default function MemberSpace() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "events" | "favorites">("profile")

  // === Profil ===
  const [profile, setProfile] = React.useState({
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    sport: "football",
    photo: "",
  })

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  // === Événements inscrits ===
  const [registeredEvents] = React.useState(mockWideEvents.slice(0, 3).map(e => ({ ...e, registered: true })))

  // === Favoris ===
  const [favorites, setFavorites] = React.useState(mockWideEvents.slice(3, 6).map(e => ({ ...e, isFavorite: true })))

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
  }

  const removeFromRegistered = (id: string) => {
    console.log("Désinscription de l'événement", id)
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
            Bienvenue, <span className="text-primary font-semibold">{profile.name}</span>
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
                {/* Avatar + Info Card */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8 
                  bg-muted/40 rounded-2xl border border-border/60 shadow-sm">
                  <Avatar className="h-32 w-32 ring-2 ring-primary shadow-lg rounded-xl">
                    <AvatarImage src={profile.photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                      {profile.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                      <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                      <Badge>Membre Actif</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{profile.email}</p>
                    <div className="inline-block px-3 py-1 bg-background rounded-full text-sm font-medium text-primary border border-primary/20">
                      🏃 {profile.sport.charAt(0).toUpperCase() + profile.sport.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Formulaire de profil */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Edit2 className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Modifier mes informations</h3>
                  </div>
                  <form className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Nom complet</label>
                        <Input
                          value={profile.name}
                          onChange={(e) => updateProfile("name", e.target.value)}
                          placeholder="Jean Dupont"
                          className="bg-background border-border focus-visible:ring-primary/40 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">Email</label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => updateProfile("email", e.target.value)}
                          placeholder="jean@example.com"
                          className="bg-background border-border focus-visible:ring-primary/40 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-muted-foreground">Discipline sportive</label>
                      <Select value={profile.sport} onValueChange={(v) => updateProfile("sport", v)}>
                        <SelectTrigger className="bg-background border-border focus-visible:ring-primary/40 rounded-xl">
                          <SelectValue placeholder="Choisissez une discipline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="football">⚽ Football</SelectItem>
                          <SelectItem value="basketball">🏀 Basketball</SelectItem>
                          <SelectItem value="tennis">🎾 Tennis</SelectItem>
                          <SelectItem value="natation">🏊 Natation</SelectItem>
                          <SelectItem value="course">🏃 Course à pied</SelectItem>
                          <SelectItem value="cyclisme">🚴 Cyclisme</SelectItem>
                          <SelectItem value="autre">✨ Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button type="submit" className="font-medium flex-1 sm:flex-initial rounded-xl h-12 text-base shadow-md hover:shadow-lg transition-all">
                        <Shield className="w-4 h-4 mr-2" />
                        Enregistrer les modifications
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
              </TabsContent>

              {/* === MES ÉVÉNEMENTS === */}
              <TabsContent value="events" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Événements inscrits</h3>
                {registeredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {registeredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 
                          border rounded-2xl bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex items-start gap-4 flex-1 w-full">
                          <div className="bg-secondary border-2 border-primary rounded-lg w-16 h-16 flex-shrink-0 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/events/${event.id}`} className="font-semibold text-foreground hover:text-primary transition-colors block mb-2">
                              {event.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary" />
                                {new Date(event.start).toLocaleDateString('fr-FR')}
                              </span>
                              {event.location && (
                                <>
                                  <span className="hidden sm:inline text-border">•</span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {event.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromRegistered(event.id)}
                          className="mt-3 sm:mt-0 w-full sm:w-auto rounded-xl"
                        >
                          <LogOut className="w-4 h-4 mr-1.5" />
                          Se désinscrire
                        </Button>
                      </div>
                    ))}
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
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {favorites.map((event) => (
                      <div
                        key={event.id}
                        className="border rounded-2xl p-6 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <Link to={`/events/${event.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 flex-1">
                            {event.title}
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(event.id)}
                            className={`flex-shrink-0 transition-colors ${event.isFavorite ? "text-amber-500" : "text-muted-foreground hover:text-amber-400"}`}
                          >
                            <Star className={`w-5 h-5 ${event.isFavorite ? "fill-current" : ""}`} />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            {new Date(event.start).toLocaleDateString('fr-FR')}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {event.category}
                            </Badge>
                          </div>

                          {event.priceLabel && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Ticket className="w-4 h-4 text-emerald-600" />
                              <span className="font-semibold text-emerald-600">{event.priceLabel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
