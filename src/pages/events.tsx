// src/pages/events.tsx
import { EventWideCard } from "@/components/cards/EventWideCard"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { mockWideEvents } from "@/data/mock-events"
import * as React from "react"

export default function EventPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("search") || ""

  // Filtrage des événements
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery.trim()) return mockWideEvents

    const q = searchQuery.toLowerCase().trim()
    return mockWideEvents.filter((event) => {
      return (
        event.title.toLowerCase().includes(q) ||
        event.category?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q)
      )
    })
  }, [searchQuery])

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
      <section className="w-full px-6 py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex justify-center items-center">
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
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Filtres
            </h2>

            {/* Prix */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Prix</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> Gratuit
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> Payant
              </label>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Date</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-indigo-600 rounded" /> Aujourd’hui
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-indigo-600 rounded" /> Demain
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-indigo-600 rounded" /> Cette semaine
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-indigo-600 rounded" /> Semaine prochaine
                </label>
              </div>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Catégorie</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> Football
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> BasketBall
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> Tennis
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> Cyclisme
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-indigo-600 rounded" /> Course à pied
              </label>
            </div>
          </div>
        </aside>

        {/* Right list - 2 cards per row on md+ */}
<div className="col-span-12 md:col-span-9">
  {filteredEvents.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredEvents.map((ev) => (
        <Link
          key={ev.id}
          to={`/events/${ev.id}`}
          className="block transition-transform hover:scale-[1.01] focus-visible:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-xl"
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
          />
        </Link>
      ))}
    </div>
  ) : (
    <div className="text-center py-12 col-span-full">
      <p className="text-lg text-muted-foreground">
        Aucun événement trouvé pour{" "}
        <span className="font-semibold text-foreground">"{searchQuery}"</span>
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Essayez avec d'autres mots-clés ou supprimez les filtres.
      </p>
    </div>
  )}
</div>
      </section>
    </div>
  )
}