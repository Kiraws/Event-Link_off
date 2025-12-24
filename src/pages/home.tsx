// src/pages/home.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import * as React from "react"
import { EventCard } from "@/components/cards/EventCard"
import { eventsService, categoriesService, contactService, type Event as ApiEvent, type Category } from "../../api"
import { toast } from "sonner"
import { useEffect, useRef } from 'react'
import { Highlighter } from '@/components/ui/highlighter'
import { Loader2 } from "lucide-react"
import { motion } from 'framer-motion'

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

  // États pour les données de l'API
  const [categories, setCategories] = React.useState<Category[]>([])
  const [events, setEvents] = React.useState<ApiEvent[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState(true)
  const [loadingEvents, setLoadingEvents] = React.useState(true)
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
}

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 }
}

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 }
}

  // Charger les catégories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        // Charger toutes les catégories
        const categoriesResponse = await categoriesService.getAll()
        
        // Log pour debug - voir la structure complète de la réponse
        console.log('Réponse API catégories complète:', categoriesResponse)
        
        // La réponse peut avoir différentes structures selon l'API
        let allCategories: Category[] = []
        
        // Essayer différentes structures de réponse
        if (Array.isArray(categoriesResponse.data)) {
          allCategories = categoriesResponse.data
        } else if (categoriesResponse.data && typeof categoriesResponse.data === 'object' && 'data' in categoriesResponse.data && Array.isArray((categoriesResponse.data as any).data)) {
          allCategories = (categoriesResponse.data as any).data
        } else if (Array.isArray(categoriesResponse)) {
          allCategories = categoriesResponse
        }
        
        console.log('Catégories extraites:', allCategories)
        
        // Filtrer les catégories actives, ou utiliser toutes si aucune n'est active
        const activeCategories = allCategories.filter((cat: Category) => cat.active === true)
        const categoriesToDisplay = activeCategories.length > 0 ? activeCategories : allCategories
        
        setCategories(categoriesToDisplay)
        
        // Log pour debug
        console.log('Catégories finales:', {
          total: allCategories.length,
          actives: activeCategories.length,
          affichées: categoriesToDisplay.length,
          catégories: categoriesToDisplay
        })
        
        if (categoriesToDisplay.length === 0) {
          console.warn('Aucune catégorie à afficher après chargement')
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories:', err)
        console.error('Détails de l\'erreur:', {
          message: err.message,
          status: err.status,
          error: err.error,
          response: err
        })
        toast.error(`Impossible de charger les catégories: ${err.message || 'Erreur inconnue'}`)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  // Charger les événements
  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true)
        const eventsResponse = await eventsService.getAll()
        // Limiter à 9 événements pour la page d'accueil
        setEvents((eventsResponse.data || []).slice(0, 9))
      } catch (err: any) {
        console.error('Erreur lors du chargement des événements:', err)
        toast.error("Impossible de charger les événements")
      } finally {
        setLoadingEvents(false)
      }
    }
    loadEvents()
  }, [])

  // Créer un map des catégories pour accès rapide
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach(cat => map.set(cat.uid, cat))
    return map
  }, [categories])

const handleContact = async (e?: React.FormEvent) => {
  if (e) {
    e.preventDefault();
  }

  setFeedback("");

  if (!name.trim() || !email.trim() || !message.trim()) {
    setFeedback("❌ Veuillez remplir tous les champs.");
    toast.error("Veuillez remplir tous les champs.");
    return;
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    setFeedback("❌ Email invalide.");
    toast.error("Format d'email invalide.");
    return;
  }

  setLoading(true);

  try {
    const response = await contactService.sendMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    if (response.status === 'success' || response.data) {
      setFeedback("✅ Message envoyé avec succès !");
      toast.success(response.message || "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.");
      setName("");
      setEmail("");
      setMessage("");
    } else {
      throw new Error(response.message || "Erreur lors de l'envoi du message");
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du message:', error);
    const errorMessage = error.message || "Erreur lors de l'envoi du message. Veuillez réessayer.";
    setFeedback(`❌ ${errorMessage}`);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || categories.length === 0) return

    const itemWidth = 200
    const totalWidth = categories.length * itemWidth
    const speed = 1
    let isPaused = false

    const animate = () => {
      if (!isPaused && carousel) {
        positionRef.current -= speed
        carousel.style.transform = `translateX(${positionRef.current}px)`
        if (Math.abs(positionRef.current) >= totalWidth) {
          positionRef.current += totalWidth
          carousel.style.transition = 'none'
          carousel.style.transform = `translateX(${positionRef.current}px)`
          requestAnimationFrame(() => {
            if (carousel) {
              carousel.style.transition = 'transform 0.3s ease-out'
            }
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
  }, [categories])

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative w-full h-[360px] sm:h-[420px]">
        <img src="/bann.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />


        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          variants={fadeUp}
          className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-10 sm:pt-14"
          >
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
              className="rounded-full bg-white/95 backdrop-blur px-5 py-6 text-base shadow-lg 
                transition-all duration-300 
                hover:shadow-xl hover:scale-[1.02]
                focus:scale-[1.02]"
            />

          </div>
        </motion.div>
      </section>

      
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-8 py-6">
       <h2 className="font-bold  text-2xl sm:text-3xl lg:text-3xl">
        Explorer les catégories
       </h2>
      </section>
      {/* Catégories */}
      <section className="mx-auto w-full py-8 overflow-hidden blur-edges">
        {loadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            <span className="ml-2 text-muted-foreground">Chargement des catégories...</span>
          </div>
        ) : categories.length > 0 ? (
          <div className="relative group overflow-hidden">
            <div
              ref={carouselRef}
              className="flex gap-10"
              style={{ willChange: 'transform', transition: 'transform 0.3s ease-out' }}
            >
              {/* Première série */}
              {categories.map((c, i) => {
                const imageUrl = c.slug || '/placeholder-category.jpg'
                return (
                  <div 
                    key={`${c.uid}-${i}`} 
                    className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
                    style={{ width: '160px' }}
                    onClick={() => navigate(`/events?category=${c.uid}`)}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg hover:border-[#D4AF37] transition-colors">
                      <img src={imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-slate-600 text-center whitespace-nowrap font-medium">{c.name}</span>
                  </div>
                )
              })}
              {/* Doublon pour l'animation infinie */}
              {categories.map((c, i) => {
                const imageUrl = c.slug || '/placeholder-category.jpg'
                return (
                  <div 
                    key={`${c.uid}-clone-${i}`} 
                    className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
                    style={{ width: '160px' }}
                    onClick={() => navigate(`/events?category=${c.uid}`)}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg hover:border-[#D4AF37] transition-colors">
                      <img src={imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-slate-600 text-center whitespace-nowrap font-medium">{c.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune catégorie disponible</p>
          </div>
        )}
      </section>


      {/* Événements à venir */}
      <section className="max-w-6xl mx-auto w-full px-6 sm:px-8 py-6">
       <h2 className="font-bold mb-6 text-2xl sm:text-3xl lg:text-3xl">
    Évènements à venir
  </h2>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-12 col-span-full">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            <span className="ml-2 text-muted-foreground">Chargement des événements...</span>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              // Obtenir le nom de la catégorie
              let categoryName: string | undefined
              if (event.category && typeof event.category === 'object' && 'name' in event.category) {
                categoryName = event.category.name
              } else if (event.category_uid) {
                const category = categoryMap.get(event.category_uid)
                categoryName = category?.name
              }

              return (
                <Link
                  key={event.uid}
                  to={`/events/ev-${event.uid}`}
                  className="block rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <EventCard
                    title={event.title}
                    description={event.description}
                    imageUrl={event.image_url}
                    category={categoryName}
                    start={event.start_date}
                    end={event.is_multi_day ? event.end_date : undefined}
                    isFavorite={false}
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">Aucun événement disponible pour le moment</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link to="/events">
            <Button variant="outline" size="lg">
              Voir tous les évènements
            </Button>
          </Link>
        </div>
      </section>

      {/* À propos */}
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            variants={fadeUp}
            id="about"
            className="bg-gradient-to-br from-slate-50 to-slate-100 py-16 sm:py-20"
          >

        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="font-bold text-3xl text-gray-700 sm:text-4xl lg:text-5xl mb-4">
              À propos d'<span className="text-[#D4AF37]">EVENT LINK</span>
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-700 leading-relaxed text-lg">
                <span className="font-bold text-[#D4AF37] text-xl">EVENT LINK</span> est une plateforme togolaise née de la passion du sport et animée par une mission claire : offrir à la jeunesse un espace où chaque talent, chaque match et chaque émotion sportive peut enfin briller.
              </p>
              
              <p className="text-slate-700 leading-relaxed text-lg">
                Déterminé à transformer l'univers du basketball au Togo, EVENT LINK collabore avec des promoteurs engagés pour rendre visibles leurs événements, faciliter la vente des tickets d'entrée et offrir une couverture médiatique dynamique que nous diffusons sur nos réseaux sociaux afin de toucher un public toujours plus large.
              </p>
              
              <p className="text-slate-700 leading-relaxed text-lg">
                Plus qu'un simple site, <span className="font-semibold text-[#D4AF37]">EVENT LINK est un mouvement</span> qui célèbre l'énergie, l'ambition et le potentiel des jeunes sportifs togolais, tout en construisant un pont entre leurs rêves et les opportunités qui peuvent changer leur vie.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-slate-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900">Jeunesse</h3>
                <p className="text-sm text-slate-600">Un espace dédié aux talents sportifs togolais</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900">Événements</h3>
                <p className="text-sm text-slate-600">Vente de tickets et promotion d'événements sportifs</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900">Impact</h3>
                <p className="text-sm text-slate-600">Connecter les rêves aux opportunités</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Newsletter */}
      <section id="contact" className="bg-[#D4AF37] py-20">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">

          <div>
            <h3 className="text-3xl font-bold text-white">Contactez-nous</h3>
            <p className="text-white/90 mt-2">
              Une question ? Une suggestion ? Écrivez-nous directement.
            </p>
          </div>

          <form onSubmit={handleContact} className="space-y-4 text-left">
            <Input
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />

            <Input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            />

            <textarea
              placeholder="Votre message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
              className="w-full h-32 rounded-lg p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 resize-none"
            />

            <div className="flex justify-center pt-3">
              <Button
                type="submit"
                disabled={loading}
                className="transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {loading ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </div>

            {feedback && (
              <p className="mt-3 text-center text-white font-medium animate-pulse">
                {feedback}
              </p>
            )}
          </form>
        </div>
      </section>


      
    </div>
  )
}
