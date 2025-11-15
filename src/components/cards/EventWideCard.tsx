"use client"

import * as React from "react"
import { Star, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"

type EventWideCardProps = {
  title: string
  imageUrl?: string
  category?: string
  start: Date | string
  end?: Date | string
  location?: string
  priceLabel?: string
  priceColorClass?: string
  isFavorite?: boolean
  onToggleFavorite?: (next: boolean) => void
  className?: string
}

function toDate(d: Date | string | undefined): Date | undefined {
  if (!d) return undefined
  return typeof d === "string" ? new Date(d) : d
}

function formatMonthDay(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)
}

export function EventWideCard({
  title,
  imageUrl,
  category,
  start,
  end,
  location,
  priceLabel,
  priceColorClass = "text-emerald-600",
  isFavorite,
  onToggleFavorite,
  className,
}: EventWideCardProps) {
  const startDate = toDate(start)!
  const endDate = toDate(end)

  const [fav, setFav] = React.useState<boolean>(!!isFavorite)
  React.useEffect(() => {
    if (typeof isFavorite === "boolean") setFav(isFavorite)
  }, [isFavorite])

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !fav
    setFav(next)
    onToggleFavorite?.(next)
  }

  const monthDay = formatMonthDay(startDate)
  const timeRange = endDate
    ? `${startDate.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", hour12: true })} - ${endDate.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", hour12: true })}`
    : startDate.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", hour12: true })

  const isFree = !priceLabel || ["FREE", "GRATUIT"].includes(priceLabel.trim().toUpperCase())
  const ticketColor = isFree ? "text-green-600" : priceColorClass
  const ticketLabel = isFree ? "Gratuit" : priceLabel

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-white shadow-xs transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 overflow-hidden",
        "flex flex-col sm:flex-row h-full min-h-40", // Compact height
        className
      )}
    >
      {/* Image */}
      <div className="relative w-full sm:w-36 h-28 sm:h-auto flex-shrink-0 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}

        {/* Category */}
        {category && (
          <span className="absolute left-1.5 bottom-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-amber-900 shadow-sm">
            {category}
          </span>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={handleToggleFav}
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={cn(
            "absolute top-1.5 right-1.5 grid place-items-center rounded-full p-1",
            "bg-white/90 backdrop-blur-sm shadow-sm border border-white/30",
            "transition-transform hover:scale-110",
            fav && "text-amber-500"
          )}
        >
          <Star className={cn("h-3.5 w-3.5", fav ? "fill-current" : "text-gray-600")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center p-3 sm:p-4 space-y-1">
        {/* Title */}
        <h3 className="line-clamp-1 font-bold text-gray-900 text-base leading-tight">
          {title}
        </h3>

        {/* Date + Location */}
        <p className="text-xs text-gray-600 flex items-center gap-1.5">
          <span className="font-medium">{monthDay}</span>
          {location && (
            <>
              <span className="text-gray-400">•</span>
              <span className="truncate max-w-[140px]">{location}</span>
            </>
          )}
        </p>

        {/* Time */}
        <p className="text-xs font-medium text-gray-700">{timeRange}</p>

        {/* Price */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <Ticket className={cn("h-3.5 w-3.5", ticketColor)} />
          <span className={cn("text-xs font-bold", ticketColor)}>{ticketLabel}</span>
        </div>
      </div>
    </div>
  )
}