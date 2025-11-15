export type MockEvent = {
  organizer: string
  id: string
  title: string
  category: string
  imageUrl?: string
  start: string
  end?: string
  location?: string
  priceLabel?: string
  priceColorClass?: string
  isFavorite?: boolean
  description?: string
}

export const mockWideEvents: MockEvent[] = [
  {
   organizer: "Event Link",
    id: "ev-1",
    title: "Tournoi de Football des Jeunes",
    category: "Football",
    start: "2025-11-29T13:00:00",
    end: "2025-11-29T17:00:00",
    location: "Stade de Kégué, Lomé",
    priceLabel: "2 000 FCFA",
    priceColorClass: "text-emerald-600",
    isFavorite: false,
    description: "Tournoi de football amateur réunissant des clubs de jeunes de Lomé et ses environs.",
  },
  {
   organizer: "Event Link",
    id: "ev-2",
    title: "Meetup Running – 10 km Lomé Plage",
    category: "Course à pied",
    start: "2025-12-02T06:30:00",
   // Single-day event: remove end to indicate only start time/date
    location: "Plage de Lomé (Baguida)",
    priceLabel: "GRATUIT",
    priceColorClass: "text-green-600",
    isFavorite: true,
    description: "Course matinale sur la plage de Lomé pour améliorer endurance et cardio. Ouvert à tous.",
  },
  {
   organizer: "Event Link",
    id: "ev-3",
    title: "Session Fitness & Cardio en plein air",
    category: "Fitness",
    start: "2025-12-05T17:00:00",
    end: "2025-12-05T18:30:00",
    location: "Terrain municipal de Kodjoviakopé, Lomé",
    priceLabel: "1 500 FCFA",
    priceColorClass: "text-emerald-600",
    isFavorite: false,
    description: "Coaching sportif intensif pour brûler des calories et renforcer le corps.",
  },
  {
   organizer: "Event Link",
    id: "ev-4",
    title: "Tournoi de Basket 3x3 – Lomé Arena",
    category: "Basketball",
    start: "2025-12-10T14:00:00",

   // Multi-day event: runs over two days
   end: "2025-12-12T18:00:00",
    location: "Terrain de basket de Gbossimé, Lomé",
    priceLabel: "3 000 FCFA",
    priceColorClass: "text-emerald-600",
    isFavorite: false,
   description: "Compétition 3x3 sur 2 jours ouverte aux équipes amateures. Ambiance urbaine garantie.",
  },
  {
   organizer: "Event Link",
    id: "ev-5",
    title: "Yoga Sunset – Séance au bord de la mer",
    category: "Bien-être & Yoga",
    start: "2025-12-12T18:00:00",

    location: "Plage de Kodjoviakopé, Lomé",
    priceLabel: "GRATUIT",
    priceColorClass: "text-green-600",
    isFavorite: false,
    description: "Séance de yoga relaxante au coucher du soleil. Parfait pour se détendre après la semaine.",
  },
  {
   organizer: "Event Link",
    id: "ev-6",
    title: "Marathon de Lomé – 21 km",
    category: "Course à pied",
    start: "2025-12-15T06:00:00",
    end: "2025-12-16T12:00:00",
    location: "Boulevard du Mono, Lomé",
    priceLabel: "5 000 FCFA",
    priceColorClass: "text-blue-600",
    isFavorite: true,
    description: "Édition officielle du semi-marathon de Lomé. Parcours en ville et sur la côte.",
  },
  {
   organizer: "Event Link",
    id: "ev-7",
    title: "Championnat de Boxe Amateur",
    category: "Boxe",
    start: "2025-12-18T15:00:00",
   // Multi-day event: se poursuit le lendemain
   end: "2025-12-19T19:00:00",
    location: "Maison des Jeunes d'Amadahomé, Lomé",
    priceLabel: "2 500 FCFA",
    priceColorClass: "text-red-600",
    isFavorite: false,
   description: "Matchs de boxe amateur sur 2 jours opposant des clubs de Lomé et d’Aného.",
  },
  {
   organizer: "Event Link",
    id: "ev-8",
    title: "Street Workout Challenge",
    category: "Fitness",
    start: "2025-12-20T09:00:00",
    end: "2025-12-25T12:00:00",
    location: "Terrain AGOÈ Assiyéyé, Lomé",
    priceLabel: "GRATUIT",
    priceColorClass: "text-green-600",
    isFavorite: false,
    description: "Compétition de force, endurance et figures freestyle. Ouvert aux débutants comme aux pros.",
  },
  {
   organizer: "Event Link",
    id: "ev-9",
    title: "Tournoi de Volleyball sur la plage",
    category: "Volleyball",
    start: "2025-12-22T13:00:00",
   // Multi-day event: se termine le jour suivant
   end: "2025-12-23T17:00:00",
    location: "Plage de Baguida, Lomé",
    priceLabel: "1 000 FCFA",
    priceColorClass: "text-yellow-600",
    isFavorite: false,
   description: "Équipes mixtes sur 2 jours, ambiance fun et estivale sur le sable.",
  },
  {
   organizer: "Event Link",
    id: "ev-10",
    title: "Initiation Taekwondo – Séance découverte",
    category: "Arts martiaux",
    start: "2025-12-27T10:00:00",
    end: "2025-12-28T12:00:00",
    location: "Dojo Tokoin Cassablanca, Lomé",
    priceLabel: "GRATUIT",
    priceColorClass: "text-green-600",
    isFavorite: true,
    description: "Séance d'introduction ouverte aux débutants, enfants et adultes.",
  }
]
