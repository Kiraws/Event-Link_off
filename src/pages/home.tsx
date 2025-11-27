// src/pages/home.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import * as React from "react"
import { EventCard } from "@/components/cards/EventCard"
import { mockWideEvents } from "@/data/mock-events"
import { useEffect, useRef } from 'react'
import { Highlighter } from '@/components/ui/highlighter'

export default function HomePage() {
  const navigate = useNavigate()
  const [name, setName] = React.useState("");
const [email, setEmail] = React.useState("");
const [message, setMessage] = React.useState("");
const [loading, setLoading] = React.useState(false);
const [feedback, setFeedback] = React.useState("");


  // État unique : recherche
  const [query, setQuery] = React.useState("")

  // Redirection sur Entrée
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/events?search=${encodeURIComponent(query.trim())}`)
    }
  }

  // === CARROUSEL ===
  const carouselRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const positionRef = useRef(0)

  const categories = [
    { name: "Football", url: "/footbal.jpg" },
    { name: "Basketball", url: "/basket.jpg" },
    { name: "Sport de glisse Ski", url: "/ski.jpg" },
    { name: "Tennis", url: "/tennis.jpg" },
    { name: "Badminton", url: "/bad.jpg" },
    { name: "Rugby", url: "/rub.jpg" },
    { name: "Athlétisme", url: "/course.jpg" },
    { name: "HandBall", url: "/hand.jpg" },
  ]

const handleContact = async () => {
  setFeedback("");

  if (!name.trim() || !email.trim() || !message.trim()) {
    setFeedback("❌ Veuillez remplir tous les champs.");
    return;
  }

  if (!email.includes("@")) {
    setFeedback("❌ Email invalide.");
    return;
  }

  setLoading(true);

  // Simulation API
  setTimeout(() => {
    setLoading(false);
    setFeedback("✅ Message envoyé avec succès !");
    setName("");
    setEmail("");
    setMessage("");
  }, 1500);
};

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const itemWidth = 200
    const totalWidth = categories.length * itemWidth
    const speed = 1
    let isPaused = false

    const clone = carousel.innerHTML
    carousel.innerHTML += clone

    const animate = () => {
      if (!isPaused) {
        positionRef.current -= speed
        carousel.style.transform = `translateX(${positionRef.current}px)`
        if (Math.abs(positionRef.current) >= totalWidth) {
          positionRef.current += totalWidth
          carousel.style.transition = 'none'
          carousel.style.transform = `translateX(${positionRef.current}px)`
          requestAnimationFrame(() => {
            carousel.style.transition = 'transform 0.3s ease-out'
          })
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    const parent = carousel.parentElement
    const handleMouseEnter = () => { isPaused = true }
    const handleMouseLeave = () => { isPaused = false }
    parent?.addEventListener('mouseenter', handleMouseEnter)
    parent?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      parent?.removeEventListener('mouseenter', handleMouseEnter)
      parent?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative w-full h-[360px] sm:h-[420px]">
        <img src="/bann.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-10 sm:pt-14">
          <h1 className="text-white text-3xl sm:text-4xl font-bold leading-snug max-w-3xl">
            A ne pas manquer !<br />
            Explore les {" "}
            <Highlighter action="underline" color="#D4AF37">
              évènements sportifs
            </Highlighter>{" "}
            qui font vibrer Lomé
          </h1>
          {/* Barre de recherche simple */}
          <div className="mt-8 max-w-xl">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Rechercher des évènements, catégories, lieux..."
              className="rounded-full bg-white/95 backdrop-blur px-5 py-6 text-base shadow-lg"
            />
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-8 py-6">
       <h2 className="font-bold  text-2xl sm:text-3xl lg:text-3xl">
        Explorer les catégories
       </h2>
      </section>
      {/* Catégories */}
      <section className="mx-auto w-full py-8 overflow-hidden blur-edges">
  <div className="relative group overflow-hidden">
    <div
      ref={carouselRef}
      className="flex gap-10"
      style={{ willChange: 'transform', transition: 'transform 0.3s ease-out' }}
    >
      {categories.map((c, i) => (
        <div key={`${c.name}-${i}`} className="flex flex-col items-center gap-3 flex-shrink-0" style={{ width: '160px' }}>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-sm text-slate-600 text-center whitespace-nowrap">{c.name}</span>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Événements à venir */}
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-8 py-6">
       <h2 className="font-bold mb-6 text-2xl sm:text-3xl lg:text-3xl">
    Évènements à venir
  </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWideEvents.slice(0, 9).map((e) => (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="block rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow"
            >
              <EventCard
                title={e.title}
                description={e.description}
                imageUrl={e.imageUrl}
                category={e.category}
                start={e.start}
                end={e.end}
                isFavorite={e.isFavorite}
              />
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/events">
            <Button variant="outline" size="lg">
              Voir tous les évènements
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#D4AF37] py-20">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">

          <div>
            <h3 className="text-3xl font-bold text-white">Contactez-nous</h3>
            <p className="text-white/90 mt-2">
              Une question ? Une suggestion ? Écrivez-nous directement.
            </p>
          </div>

          <div className="space-y-4 text-left">

            <Input
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />

            <Input
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />

            <textarea
              placeholder="Votre message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 rounded-lg p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />

            <div className="flex justify-center pt-3">
              <Button
                onClick={handleContact}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </div>

            {feedback && (
              <p className="mt-3 text-center text-white font-medium animate-pulse">
                {feedback}
              </p>
            )}
          </div>
        </div>
      </section>


      
    </div>
  )
}