// src/pages/events.tsx
import { EventWideCard } from "@/components/cards/EventWideCard"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import * as React from "react"
import { eventsService, categoriesService, type Event as ApiEvent, type Category } from "../../api"
import { toast } from "sonner"

// Type pour les événements formatés pour EventWideCard
type FormattedEvent = {
  id: string
  title: string
  imageUrl?: string
  category?: string
  start: string
  end?: string
  location?: string
  priceLabel?: string
  priceColorClass?: string
  isFavorite?: boolean
}

export default function EventPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const categoryParam = searchParams.get("category") || ""
  
  const [events, setEvents] = React.useState<ApiEvent[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // États pour les filtres
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set())
  const [selectedPrice, setSelectedPrice] = React.useState<Set<"free" | "paid">>(new Set())
  const [selectedDate, setSelectedDate] = React.useState<Set<string>>(new Set())

  // Charger les catégories une seule fois au montage
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await categoriesService.getAll()
        const allCategories = categoriesResponse.data || []
        // Filtrer les catégories actives
        const activeCategories = allCategories.filter((cat: Category) => cat.active === true)
        setCategories(activeCategories.length > 0 ? activeCategories : allCategories)
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories:', err)
        toast.error("Erreur lors du chargement des catégories")
      }
    }
    loadCategories()
  }, [])

  // Pré-sélectionner les catégories depuis l'URL
  React.useEffect(() => {
    const categoriesFromUrl = new Set<string>()
    if (categoryParam) {
      categoriesFromUrl.add(categoryParam)
    }
    // Vérifier s'il y a d'autres catégories dans l'URL
    const additionalCategories = searchParams.get("categories")
    if (additionalCategories) {
      additionalCategories.split(",").forEach(cat => {
        if (cat.trim()) {
          categoriesFromUrl.add(cat.trim())
        }
      })
    }
    if (categoriesFromUrl.size > 0) {
      setSelectedCategories(categoriesFromUrl)
    }
  }, [categoryParam, searchParams])

  // Charger les événements
  const loadEvents = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger tous les événements (le filtrage se fait côté client)
      const eventsResponse = await eventsService.getAll({
        search: searchQuery || undefined,
      })
      setEvents(eventsResponse.data || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err)
      setError(err.message || "Erreur lors du chargement des événements")
      toast.error("Impossible de charger les événements")
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  // Charger les événements au montage et quand la recherche change
  React.useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Créer un map des catégories pour accès rapide
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach(cat => map.set(cat.uid, cat))
    return map
  }, [categories])

  // État pour suivre les favoris
  const [favoritesMap, setFavoritesMap] = React.useState<Map<string, boolean>>(new Map())

  // Vérifier les favoris pour tous les événements
  React.useEffect(() => {
    const checkFavorites = async () => {
      if (events.length === 0) return

      const newFavoritesMap = new Map<string, boolean>()
      const checking = new Set<string>()

      // Vérifier chaque événement
      for (const event of events) {
        checking.add(event.uid)
        try {
          const response = await eventsService.checkFavorite(event.uid)
          newFavoritesMap.set(event.uid, response.data?.is_favorite || false)
        } catch (err) {
          // Si erreur (ex: non connecté), considérer comme non favori
          newFavoritesMap.set(event.uid, false)
        } finally {
          checking.delete(event.uid)
        }
      }

      setFavoritesMap(newFavoritesMap)
    }

    checkFavorites()
  }, [events])

  // Gérer le toggle des favoris
  const handleToggleFavorite = React.useCallback(async (eventId: string, currentValue: boolean) => {
    const eventUid = eventId.startsWith('ev-') ? eventId.substring(3) : eventId
    
    try {
      if (currentValue) {
        // Retirer des favoris
        await eventsService.removeFromFavorites(eventUid)
        setFavoritesMap(prev => {
          const newMap = new Map(prev)
          newMap.set(eventUid, false)
          return newMap
        })
        toast.success("Événement retiré des favoris")
      } else {
        // Ajouter aux favoris
        await eventsService.addToFavorites(eventUid)
        setFavoritesMap(prev => {
          const newMap = new Map(prev)
          newMap.set(eventUid, true)
          return newMap
        })
        toast.success("Événement ajouté aux favoris")
      }
    } catch (err: any) {
      console.error('Erreur lors de la gestion du favori:', err)
      toast.error(err.message || "Erreur lors de la gestion du favori")
    }
  }, [])

  // Formater les événements pour EventWideCard
  const formattedEvents: FormattedEvent[] = React.useMemo(() => {
    return events.map((event) => {
      // Utiliser event.category si disponible, sinon chercher dans categoryMap
      let categoryName: string | undefined
      if (event.category && typeof event.category === 'object' && 'name' in event.category) {
        categoryName = event.category.name
      } else if (event.category_uid) {
        const category = categoryMap.get(event.category_uid)
        categoryName = category?.name
      }
      
      return {
        id: event.uid,
        title: event.title,
        imageUrl: event.image_url,
        category: categoryName,
        start: event.start_date,
        end: event.is_multi_day ? event.end_date : undefined,
        location: event.location,
        priceLabel: event.is_free ? "GRATUIT" : "Payant",
        priceColorClass: event.is_free ? "text-green-600" : "text-emerald-600",
        isFavorite: favoritesMap.get(event.uid) || false,
      }
    })
  }, [events, categoryMap, favoritesMap])

  // Filtrage des événements côté client (catégorie, prix et date)
  const filteredEvents = React.useMemo(() => {
    let filtered = formattedEvents

    // Filtre par catégorie
    if (selectedCategories.size > 0) {
      // Créer un map des événements par ID pour accès rapide
      const eventsMap = new Map(events.map(e => [e.uid, e]))
      
      filtered = filtered.filter((event) => {
        // Trouver l'événement brut correspondant
        const eventData = eventsMap.get(event.id)
        if (!eventData) return false

        // Vérifier si l'événement appartient à une des catégories sélectionnées
        const eventCategoryUid = eventData.category_uid
        if (!eventCategoryUid) return false

        return selectedCategories.has(eventCategoryUid)
      })
    }

    // Filtre par prix
    if (selectedPrice.size > 0) {
      filtered = filtered.filter((event) => {
        if (selectedPrice.has("free") && selectedPrice.has("paid")) {
          return true // Tous les événements
        }
        if (selectedPrice.has("free")) {
          return event.priceLabel === "GRATUIT"
        }
        if (selectedPrice.has("paid")) {
          return event.priceLabel !== "GRATUIT"
        }
        return true
      })
    }

    // Filtre par date
    if (selectedDate.size > 0) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay()) // Dimanche de cette semaine
      const nextWeekStart = new Date(weekStart)
      nextWeekStart.setDate(weekStart.getDate() + 7)

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start)
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

        // Vérifier si au moins un des filtres de date correspond
        let matches = false
        if (selectedDate.has("today")) {
          if (eventDateOnly.getTime() === today.getTime()) matches = true
        }
        if (selectedDate.has("tomorrow")) {
          if (eventDateOnly.getTime() === tomorrow.getTime()) matches = true
        }
        if (selectedDate.has("thisWeek")) {
          if (eventDate >= weekStart && eventDate < nextWeekStart) matches = true
        }
        if (selectedDate.has("nextWeek")) {
          if (eventDate >= nextWeekStart && eventDate < new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) matches = true
        }
        return matches
      })
    }

    return filtered
  }, [formattedEvents, selectedCategories, selectedPrice, selectedDate, events])

  // Gestion de la saisie
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim()) {
      setSearchParams({ search: value })
    } else {
      setSearchParams({})
    }
  }

  // Effacer avec Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchParams({})
    }
  }

  return (
    <div className="flex min-h-svh flex-col gap-0">
      {/* Hero header */}
      <section className="w-full px-6 py-28 bg-[#D4AF37] text-white flex justify-center items-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Explore le monde du sport.<br />
            Découvrez ta prochaine montée d’adrénaline !
          </h1>

          {/* Barre de recherche */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus-visible:ring-2 focus-visible:ring-yellow-400"
              placeholder="Rechercher des évènements, des catégories, des lieux…"
            />
          </div>
        </div>
      </section>

      {/* Main content: filters + list */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 grid grid-cols-12 gap-4 lg:gap-6">
        {/* Left filters */}
        <aside className="col-span-12 md:col-span-3">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Filtres
              </h2>
              {(selectedCategories.size > 0 || selectedPrice.size > 0 || selectedDate.size > 0) && (
                <button
                  onClick={() => {
                    setSelectedCategories(new Set())
                    setSelectedPrice(new Set())
                    setSelectedDate(new Set())
                    setSearchParams({})
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Prix */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Prix</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-indigo-600 rounded" 
                  checked={selectedPrice.has("free")}
                  onChange={(e) => {
                    const newSet = new Set(selectedPrice)
                    if (e.target.checked) {
                      newSet.add("free")
                    } else {
                      newSet.delete("free")
                    }
                    setSelectedPrice(newSet)
                  }}
                /> 
                Gratuit
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-indigo-600 rounded" 
                  checked={selectedPrice.has("paid")}
                  onChange={(e) => {
                    const newSet = new Set(selectedPrice)
                    if (e.target.checked) {
                      newSet.add("paid")
                    } else {
                      newSet.delete("paid")
                    }
                    setSelectedPrice(newSet)
                  }}
                /> 
                Payant
              </label>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Date</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-600 rounded" 
                    checked={selectedDate.has("today")}
                    onChange={(e) => {
                      const newSet = new Set(selectedDate)
                      if (e.target.checked) {
                        newSet.add("today")
                      } else {
                        newSet.delete("today")
                      }
                      setSelectedDate(newSet)
                    }}
                  /> 
                  Aujourd'hui
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-600 rounded" 
                    checked={selectedDate.has("tomorrow")}
                    onChange={(e) => {
                      const newSet = new Set(selectedDate)
                      if (e.target.checked) {
                        newSet.add("tomorrow")
                      } else {
                        newSet.delete("tomorrow")
                      }
                      setSelectedDate(newSet)
                    }}
                  /> 
                  Demain
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-600 rounded" 
                    checked={selectedDate.has("thisWeek")}
                    onChange={(e) => {
                      const newSet = new Set(selectedDate)
                      if (e.target.checked) {
                        newSet.add("thisWeek")
                      } else {
                        newSet.delete("thisWeek")
                      }
                      setSelectedDate(newSet)
                    }}
                  /> 
                  Cette semaine
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-600 rounded" 
                    checked={selectedDate.has("nextWeek")}
                    onChange={(e) => {
                      const newSet = new Set(selectedDate)
                      if (e.target.checked) {
                        newSet.add("nextWeek")
                      } else {
                        newSet.delete("nextWeek")
                      }
                      setSelectedDate(newSet)
                    }}
                  /> 
                  Semaine prochaine
                </label>
              </div>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Catégorie</p>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <label key={category.uid} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="accent-indigo-600 rounded" 
                      checked={selectedCategories.has(category.uid)}
                      onChange={(e) => {
                        const newSet = new Set(selectedCategories)
                        if (e.target.checked) {
                          // Ajouter la catégorie (sélection cumulative)
                          newSet.add(category.uid)
                        } else {
                          // Retirer la catégorie
                          newSet.delete(category.uid)
                        }
                        setSelectedCategories(newSet)
                        
                        // Mettre à jour l'URL avec toutes les catégories sélectionnées
                        setSearchParams(prev => {
                          const newParams = new URLSearchParams(prev)
                          if (newSet.size > 0) {
                            // Si plusieurs catégories, on peut les passer comme paramètre séparé par virgule
                            // ou ne garder que la première pour la compatibilité
                            const firstCategory = Array.from(newSet)[0]
                            newParams.set("category", firstCategory)
                            // Si plusieurs catégories, on peut ajouter un paramètre supplémentaire
                            if (newSet.size > 1) {
                              const otherCategories = Array.from(newSet).slice(1).join(",")
                              newParams.set("categories", otherCategories)
                            } else {
                              newParams.delete("categories")
                            }
                          } else {
                            newParams.delete("category")
                            newParams.delete("categories")
                          }
                          return newParams
                        })
                      }}
                    /> 
                    {category.name}
                  </label>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Chargement des catégories...</p>
              )}
            </div>
          </div>
        </aside>

        {/* Right list - 2 cards per row on md+ */}
        <div className="col-span-12 md:col-span-9">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
              <span className="ml-2 text-muted-foreground">Chargement des événements...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-destructive">{error}</p>
              <button
                onClick={loadEvents}
                className="mt-4 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A027] transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="block transition-transform hover:scale-[1.01] focus-visible:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-xl"
                >
                  <Link
                    to={`/events/ev-${ev.id}`}
                    className="block"
                  >
                    <EventWideCard
                      title={ev.title}
                      imageUrl={ev.imageUrl}
                      category={ev.category}
                      start={ev.start}
                      end={ev.end}
                      location={ev.location}
                      priceLabel={ev.priceLabel}
                      priceColorClass={ev.priceColorClass}
                      isFavorite={ev.isFavorite}
                      onToggleFavorite={(next) => handleToggleFavorite(ev.id, !next)}
                    />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 col-span-full">
              <p className="text-lg text-muted-foreground">
                {searchQuery ? (
                  <>
                    Aucun événement trouvé pour{" "}
                    <span className="font-semibold text-foreground">"{searchQuery}"</span>
                  </>
                ) : (
                  "Aucun événement disponible pour le moment"
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery
                  ? "Essayez avec d'autres mots-clés ou supprimez les filtres."
                  : "Revenez plus tard pour découvrir de nouveaux événements."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}