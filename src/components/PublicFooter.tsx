"use client"

import { Facebook, Linkedin, Twitter } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="Event Link"
              className="w-8 h-8 rounded-md bg-slate-800 object-cover"
            />
            <div>
              <p className="font-semibold">Event Link</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            Prêt à vivre des émotions fortes ?<br />
            Inscris-toi, participe, partage la passion.
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <p className="font-semibold">Liens rapides</p>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:underline" href="/">Accueil</a></li>
            <li><a className="hover:underline" href="/events">Évènements</a></li>
            <li><a className="hover:underline" href="/about">À propos</a></li>
            <li><a className="hover:underline" href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <p className="font-semibold">Contact</p>
          <div className="text-sm space-y-1">
            <p>Lomé, Togo</p>
            <p>(+228) 22 71 48 21</p>
            <p><a href="mailto:contact@eventlinktg.com" className="hover:underline">contact@eventlinktg.com</a></p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" aria-label="Facebook" className="p-2 rounded-md bg-slate-800 hover:bg-slate-700">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-md bg-slate-800 hover:bg-slate-700">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Twitter" className="p-2 rounded-md bg-slate-800 hover:bg-slate-700">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 Event Link. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Mentions légales</a>
            <a href="#" className="hover:underline">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  )
}