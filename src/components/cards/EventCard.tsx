"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type EventCardProps = {
  title: string
  description?: string
  category?: string
  imageUrl?: string
  start: Date | string
  end?: Date | string
  isFavorite?: boolean
  onToggleFavorite?: (next: boolean) => void
  className?: string
  onClick?: () => void
}

function toDate(d: Date | string | undefined): Date | undefined {
  if (!d) return undefined
  return typeof d === "string" ? new Date(d) : d
}

function formatMonthAbbr(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(date).toUpperCase()
}

function formatDay(date: Date) {
  return String(date.getDate()).padStart(2, "0")
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")
}

export function EventCard({
  title,
  description,
  category,
  imageUrl,
  start,
  end,
  isFavorite,
  onToggleFavorite,
  className,
  onClick,
}: EventCardProps) {
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

  const isMultiDay = endDate && (
    startDate.getFullYear() !== endDate.getFullYear() ||
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getDate() !== endDate.getDate()
  )

  const timeLabel = endDate
    ? isMultiDay
      ? `${formatTime(startDate)} → ${formatTime(endDate)}`
      : `${formatTime(startDate)} - ${formatTime(endDate)}`
    : formatTime(startDate)

  return (
    <div
      className={cn(
        "group relative h-80 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        "flex flex-col cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100">
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
          <span className="absolute left-3 bottom-3 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white shadow-md">
            {category}
          </span>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={handleToggleFav}
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={cn(
            "absolute top-3 right-3 grid place-items-center rounded-full p-1.5",
            "bg-white/90 backdrop-blur-sm shadow-md border border-white/30",
            "transition-all hover:scale-110",
            fav && "text-amber-500"
          )}
        >
          <Star className={cn("h-4 w-4", fav ? "fill-current" : "text-gray-600")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 p-4">
        <div className="grid grid-cols-[64px_1fr] gap-3 flex-1">
          {/* Date Block */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-indigo-100 rounded-lg py-2">
            <span className="text-indigo-600 font-bold text-sm leading-none">{formatMonthAbbr(startDate)}</span>
            <span className="text-gray-900 font-extrabold text-2xl leading-tight">{formatDay(startDate)}</span>
            {endDate && isMultiDay && (
              <span className="text-xs text-gray-600 mt-0.5">→ {formatDay(endDate)}</span>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-2 text-base leading-tight">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2 leading-snug">
                  {description}
                </p>
              )}
            </div>

            <div className="mt-2 space-y-0.5">
              <p className="text-sm font-semibold text-indigo-700">{timeLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}