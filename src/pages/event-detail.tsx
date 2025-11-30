"use client"

import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { eventsService, categoriesService, type Event as ApiEvent, type Category } from "../../api"
import { toast } from "sonner"
import { Star, CalendarDays, Clock, MapPin, Ticket, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from "lucide-react"
import { EventCard } from "@/components/cards/EventCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function fmtLongDate(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d)
}
function fmtTime12(d: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = React.useState<ApiEvent | null>(null)
  const [otherEvents, setOtherEvents] = React.useState<ApiEvent[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [fav, setFav] = React.useState<boolean>(false)
  const [checkingFavorite, setCheckingFavorite] = React.useState<boolean>(false)
  const [togglingFavorite, setTogglingFavorite] = React.useState<boolean>(false)
  const [isRegistered, setIsRegistered] = React.useState<boolean>(false)
  const [checkingRegistration, setCheckingRegistration] = React.useState<boolean>(false)
  const [registering, setRegistering] = React.useState<boolean>(false)

  // Charger l'événement
  React.useEffect(() => {
    const loadEvent = async () => {
      if (!id) return
      
      // Retirer le préfixe "ev-" si présent dans l'ID
      const eventId = id.startsWith('ev-') ? id.substring(3) : id
      
      try {
        setLoading(true)
        setError(null)
        const response = await eventsService.getById(eventId)
        if (response.data) {
          setEvent(response.data)
        } else {
          setError("Événement introuvable")
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'événement:', err)
        setError(err.message || "Erreur lors du chargement de l'événement")
        toast.error("Impossible de charger l'événement")
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  // Vérifier si l'événement est en favoris
  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!event) return
      
      try {
        setCheckingFavorite(true)
        const response = await eventsService.checkFavorite(event.uid)
        setFav(response.data?.is_favorite || false)
      } catch (err: any) {
        console.error('Erreur lors de la vérification du favori:', err)
        // Si erreur (ex: non connecté), on assume que l'événement n'est pas en favoris
        setFav(false)
      } finally {
        setCheckingFavorite(false)
      }
    }

    if (!loading && event) {
      checkFavoriteStatus()
    }
  }, [loading, event])

  // Vérifier si l'utilisateur est inscrit à l'événement
  React.useEffect(() => {
    const checkRegistration = async () => {
      if (!event || !event.is_free) return
      
      try {
        setCheckingRegistration(true)
        const response = await eventsService.checkFreeRegistration(event.uid)
        setIsRegistered(response.data?.is_registered || false)
      } catch (err: any) {
        console.error('Erreur lors de la vérification de l\'inscription:', err)
        // Si erreur (ex: non connecté), on assume que l'utilisateur n'est pas inscrit
        setIsRegistered(false)
      } finally {
        setCheckingRegistration(false)
      }
    }

    if (!loading && event) {
      checkRegistration()
    }
  }, [loading, event])

  // Gérer le toggle des favoris
  const handleToggleFavorite = async () => {
    if (!event || togglingFavorite) return

    try {
      setTogglingFavorite(true)
      if (fav) {
        // Retirer des favoris
        await eventsService.removeFromFavorites(event.uid)
        setFav(false)
        toast.success("Événement retiré des favoris")
      } else {
        // Ajouter aux favoris
        await eventsService.addToFavorites(event.uid)
        setFav(true)
        toast.success("Événement ajouté aux favoris")
      }
    } catch (err: any) {
      console.error('Erreur lors de la gestion du favori:', err)
      toast.error(err.message || "Erreur lors de la gestion du favori")
    } finally {
      setTogglingFavorite(false)
    }
  }

  // Charger les autres événements et catégories
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les catégories
        const categoriesResponse = await categoriesService.getAll()
        setCategories(categoriesResponse.data || [])

        // Charger d'autres événements (exclure l'événement actuel)
        const eventId = id && id.startsWith('ev-') ? id.substring(3) : id
        const eventsResponse = await eventsService.getAll()
        const allEvents = eventsResponse.data || []
        const filtered = allEvents.filter(e => e.uid !== eventId).slice(0, 10)
        setOtherEvents(filtered)
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err)
      }
    }

    if (!loading && event) {
      loadData()
    }
  }, [loading, event, id])

  // Move hooks BEFORE any early returns to satisfy hooks rules
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const scrollBy = (dir: "prev" | "next") => {
    const el = carouselRef.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.9)
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" })
  }

  // Créer un map des catégories pour accès rapide
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach(cat => map.set(cat.uid, cat))
    return map
  }, [categories])

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="text-muted-foreground">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Évènement introuvable</h1>
        <p className="text-muted-foreground mt-2">
          {error || "L'évènement demandé n'existe pas. Retournez à la liste."}
        </p>
        <Link to="/events" className="inline-block mt-4">
          <Button variant="outline">Retour aux évènements</Button>
        </Link>
      </div>
    )
  }

  const start = new Date(event.start_date)
  const end = new Date(event.end_date)
  const dateLabel = fmtLongDate(start)
  const timeLabel = end ? `${fmtTime12(start)} - ${fmtTime12(end)}` : fmtTime12(start)
  const isFree = event.is_free

  // Obtenir le nom de la catégorie
  let categoryName: string | undefined
  if (event.category && typeof event.category === 'object' && 'name' in event.category) {
    categoryName = event.category.name
  } else if (event.category_uid) {
    const category = categoryMap.get(event.category_uid)
    categoryName = category?.name
  }

  return (
    <div className="flex flex-col">
      {/* Bouton retour à la liste en haut */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-8 pt-4 mb-2">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>
      </div>

      {/* Banner */}

     {/* Add padding/margins around the banner and round corners */}
     <div className="w-full px-6 md:px-8 mb-4">
       <div className="relative h-80 md:h-96 bg-gray-200 rounded-xl overflow-hidden max-w-5xl mx-auto">
         {event.image_url ? (
           <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
         ) : (
           <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
             <span className="text-gray-500 text-lg">Aucune image</span>
           </div>
         )}
       </div>
     </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto w-full px-6 py-6 space-y-4">
       
       {/* Title row + favorite icon (aligned like screenshot) */}
       <div className="flex items-center justify-between gap-4">
         <h1 className="text-2xl sm:text-3xl font-bold">{event.title}</h1>
         <button
           type="button"
           aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
           onClick={handleToggleFavorite}
           disabled={togglingFavorite || checkingFavorite}
           className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-sm border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {togglingFavorite || checkingFavorite ? (
             <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
           ) : (
             <Star className={fav ? "w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" : "w-5 h-5 text-gray-700"} />
           )}
         </button>
       </div>

       {/* Catégorie */}
       {categoryName && (
         <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium w-fit">
           {categoryName}
         </div>
       )}

       {/* Actions under the title */}
       <div className="flex items-center gap-2">
         {!isFree && (
           <Button className="whitespace-nowrap bg-yellow-400 text-black hover:bg-yellow-500">
            Payer Tickets
           </Button>
         )} 
          <Button 
            variant={isRegistered ? "outline" : "secondary"}
            className="whitespace-nowrap"
            disabled={registering || checkingRegistration || event.status === 'cancelled'}
            onClick={async () => {
              if (isFree) {
                try {
                  setRegistering(true)
                  if (isRegistered) {
                    // Se désinscrire
                    await eventsService.unregisterFree(event.uid)
                    setIsRegistered(false)
                    toast.success("Désinscription réussie")
                  } else {
                    // Vérifier les conditions avant l'inscription
                    const now = new Date()
                    const endDate = new Date(event.end_date)
                    
                    // Vérifier si l'événement est passé
                    if (endDate < now) {
                      toast.error("Cet événement est déjà terminé")
                      setRegistering(false)
                      return
                    }
                    
                    // Vérifier si l'événement n'a pas encore commencé (optionnel, mais peut être utile)
                    // if (startDate > now) {
                    //   toast.info("Cet événement n'a pas encore commencé")
                    // }
                    
                    // Vérifier si l'événement est annulé
                    if (event.status === 'cancelled' || event.status === 'CANCELLED') {
                      toast.error("Cet événement a été annulé")
                      setRegistering(false)
                      return
                    }
                    
                    // Vérifier si l'événement est en brouillon
                    if (event.status === 'draft' || event.status === 'DRAFT') {
                      toast.error("Cet événement n'est pas encore publié")
                      setRegistering(false)
                      return
                    }
                    
                    // Vérifier si l'utilisateur est déjà inscrit (double vérification)
                    if (isRegistered) {
                      toast.info("Vous êtes déjà inscrit à cet événement")
                      setRegistering(false)
                      return
                    }
                    
                    // S'inscrire
                    const response = await eventsService.registerFree(event.uid)
                    setIsRegistered(true)
                    toast.success(response.message || "Inscription réussie")
                  }
                } catch (err: any) {
                  // Afficher le message d'erreur de l'API de manière plus claire
                  let errorMessage = isRegistered ? "Erreur lors de la désinscription" : "Erreur lors de l'inscription"
                  
                  // Essayer différentes structures de réponse d'erreur
                  // L'erreur peut être dans err.message, err.error, ou err.error.message
                  if (err.message) {
                    errorMessage = err.message
                  } else if (err.error) {
                    // err.error peut être un string ou un objet
                    if (typeof err.error === 'string') {
                      errorMessage = err.error
                    } else if (err.error.message) {
                      errorMessage = err.error.message
                    } else if (err.error.error) {
                      errorMessage = err.error.error
                    }
                  } else if (typeof err === 'string') {
                    errorMessage = err
                  } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message
                  } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error
                  } else if (err.data?.message) {
                    errorMessage = err.data.message
                  } else if (err.data?.error) {
                    errorMessage = err.data.error
                  }
                  
                  // Log complet pour déboguer
                  console.error('Erreur inscription/désinscription:', {
                    error: err,
                    message: err.message,
                    errorField: err.error,
                    errorMessage: typeof err.error === 'object' ? err.error.message : err.error,
                    data: err.data,
                    response: err.response
                  })
                  
                  toast.error(errorMessage)
                } finally {
                  setRegistering(false)
                }
              } else {
                // Rediriger vers la page de paiement si payant
                navigate(`/events/ev-${event.uid}/payment`)
              }
            }}
          >
            {registering ? (
              "Traitement..."
            ) : event.status === 'cancelled' ? (
              "Événement annulé"
            ) : isFree ? (
              isRegistered ? "Se désinscrire" : "S'inscrire"
            ) : (
              "Payer et s'inscrire"
            )}
          </Button>
       </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Date et Heure</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4" />
              <span>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{timeLabel}</span>
            </div>
          </div>

          {/* Ticket info */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Informations sur les billets</p>
            <div className="flex items-center gap-2 text-sm">
              <Ticket className={cn("w-4 h-4", isFree ? "text-green-600" : "text-emerald-600")} />
              <span className={`font-medium ${isFree ? "text-green-600" : "text-emerald-600"}`}>
                {isFree ? "GRATUIT" : "Payant"}
              </span>
            </div>
            {event.max_capacity && (
              <div className="text-sm text-muted-foreground">
                Capacité maximale: {event.max_capacity} places
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2 mt-4">
          <p className="text-sm font-semibold">Location</p>
          <div className="flex items-start gap-2 text-sm">
           
           <MapPin className="w-4 h-4 shrink-0" />
            <span>{event.location ?? "Lieu non spécifié"}</span>
          </div>
          <div className="rounded-lg overflow-hidden border">
            {event.latitude && event.longitude ? (
              <iframe
                title="map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude - 0.01},${event.latitude - 0.01},${event.longitude + 0.01},${event.latitude + 0.01}&layer=mapnik&marker=${event.latitude},${event.longitude}`}
                className="w-full h-64"
                loading="lazy"
              />
            ) : (
              <iframe
                title="map"
                src={`https://www.openstreetmap.org/export/embed.html?q=${encodeURIComponent(event.location ?? "Lomé, Togo")}`}
                className="w-full h-64"
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Organizer */}
        <div className="space-y-2 mt-6">
          <p className="text-sm font-semibold">Organisé par</p>
            <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div>
              <p className="text-sm font-medium">{event.organizer || "Organisateur inconnu"}</p>
              <p className="text-xs text-muted-foreground">Évènement public</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mt-6">
          <p className="text-sm font-semibold">Description de l’évènement</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {event.description ||
              "Aucune description fournie pour cet évènement. Revenez plus tard pour plus d'informations."}
          </p>
        </div>

        {/* Other events (carousel) */}
        <div className="space-y-3 mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">D'autres évènement que vous pourriez aimer</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => scrollBy("prev")} aria-label="Previous">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scrollBy("next")} aria-label="Next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 h-full"
            style={{ scrollbarWidth: "none" }}
          >
            {otherEvents.map((e) => {
              // Obtenir le nom de la catégorie
              let evCategoryName: string | undefined
              if (e.category && typeof e.category === 'object' && 'name' in e.category) {
                evCategoryName = e.category.name
              } else if (e.category_uid) {
                const evCategory = categoryMap.get(e.category_uid)
                evCategoryName = evCategory?.name
              }

              return (
                <Link to={`/events/${e.uid}`} key={e.uid} className="snap-start shrink-0 w-[300px]">
                  {/* Fixed-size wrapper to enforce uniform card dimensions */}
                  <div className="h-[340px] overflow-hidden rounded-xl">
                    <EventCard
                      title={e.title}
                      description={e.description}
                      imageUrl={e.image_url}
                      category={evCategoryName}
                      start={e.start_date}
                      end={e.is_multi_day ? e.end_date : undefined}
                      isFavorite={false}
                      onToggleFavorite={async (next) => {
                        try {
                          if (next) {
                            await eventsService.addToFavorites(e.uid)
                            toast.success("Événement ajouté aux favoris")
                          } else {
                            await eventsService.removeFromFavorites(e.uid)
                            toast.success("Événement retiré des favoris")
                          }
                        } catch (err: any) {
                          console.error('Erreur lors de la gestion du favori:', err)
                          toast.error(err.message || "Erreur lors de la gestion du favori")
                        }
                      }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link to="/events">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}