"use client"

import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { mockWideEvents} from "@/data/mock-events"
import { Star, CalendarDays, Clock, MapPin, Ticket, ChevronLeft, ChevronRight } from "lucide-react"
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
  const event = mockWideEvents.find((e) => e.id === id)

  const [fav, setFav] = React.useState<boolean>(!!event?.isFavorite)
  React.useEffect(() => {
    setFav(!!event?.isFavorite)
  }, [id, event?.isFavorite])

   // Move hooks BEFORE any early returns to satisfy hooks rules
   const carouselRef = React.useRef<HTMLDivElement>(null)
   const scrollBy = (dir: "prev" | "next") => {
     const el = carouselRef.current
     if (!el) return
     const amount = Math.round(el.clientWidth * 0.9)
     el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" })
   }

  if (!event) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Évènement introuvable</h1>
        <p className="text-muted-foreground mt-2">
          L’évènement demandé n’existe pas. Retournez à la liste.
        </p>
        <Link to="/events" className="inline-block mt-4">
          <Button variant="outline">Retour aux évènements</Button>
        </Link>
      </div>
    )
  }

  const start = new Date(event.start)
  const end = event.end ? new Date(event.end) : undefined
  const dateLabel = fmtLongDate(start)
  const timeLabel = end ? `${fmtTime12(start)} - ${fmtTime12(end)}` : fmtTime12(start)
  const isFree = !event.priceLabel || event.priceLabel.trim().toUpperCase() === "FREE"

  return (
    <div className="flex flex-col">
      {/* Banner */}

     {/* Add padding/margins around the banner and round corners */}
     <div className="w-full px-6 md:px-8 pt-4 mb-4">
       <div className="relative h-80 md:h-96 bg-gray-200 rounded-xl overflow-hidden max-w-5xl mx-auto">
         {event.imageUrl ? (
           <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
         ) : (
           <div className="absolute inset-0 w-full h-full bg-red-200" />
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
           onClick={() => setFav((v) => !v)}
           className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-sm border hover:bg-gray-50"
         >
           <Star className={fav ? "w-5 h-5 fill-black text-black" : "w-5 h-5 text-gray-700"} />
         </button>
       </div>

       {/* Actions under the title */}
       <div className="flex items-center gap-2">
         {!isFree && (
           <Button className="whitespace-nowrap bg-yellow-400 text-black hover:bg-yellow-500">
            Payer Tickets
           </Button>
         )} 
          <Button variant="secondary" className="whitespace-nowrap">S’inscrire</Button>
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
            {(() => {
              const color = isFree ? "text-green-600" : (event.priceColorClass ?? "text-emerald-600")
              const label = isFree ? "GRATUIT" : event.priceLabel
              return (
                <div className="flex items-center gap-2 text-sm">
                  <Ticket className={cn("w-4 h-4", color)} />
                  <span className={`font-medium ${color}`}>{label}</span>
                </div>
              )
            })()}
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
            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(event.location ?? "New Delhi, India")}&output=embed`}
              className="w-full h-64"
              loading="lazy"
            />
          </div>
        </div>

        {/* Organizer */}
        <div className="space-y-2 mt-6">
          <p className="text-sm font-semibold">Organisé par</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div>
              <p className="text-sm font-medium">{event.organizer ?? "Organisateur inconnu"}</p>
              <p className="text-xs text-muted-foreground">Évènement public</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mt-6">
          <p className="text-sm font-semibold">Description de l’évènement</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description ??
              "Aucune description fournie pour cet évènement. Revenez plus tard pour plus d’informations."}
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
            {mockWideEvents
              .filter((e) => e.id !== event.id)
              .slice(0, 10)
              .map((e) => (
               <Link to={`/events/${e.id}/#`} key={e.id} className="snap-start shrink-0 w-[300px]">
                 {/* Fixed-size wrapper to enforce uniform card dimensions */}
                 <div className="h-[340px] overflow-hidden rounded-xl">
                   <EventCard
                     title={e.title}
                     description={e.description}
                     imageUrl={e.imageUrl}
                     category={e.category}
                     start={e.start}
                     end={e.end}
                     isFavorite={e.isFavorite}
                   />
                 </div>
               </Link>
              ))}
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