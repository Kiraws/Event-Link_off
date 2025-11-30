"use client"

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapLocationPickerProps {
  location: string
  latitude?: string
  longitude?: string
  onLocationChange: (location: string) => void
  onCoordinatesChange: (lat: string, lng: string) => void
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap()
  useEffect(() => {
    map.on('click', onClick)
    return () => {
      map.off('click', onClick)
    }
  }, [map, onClick])
  return null
}

export function MapLocationPicker({
  location,
  latitude,
  longitude,
  onLocationChange,
  onCoordinatesChange,
}: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.1375, 1.2125]) // Lomé par défaut
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)

  // Initialiser la carte avec les coordonnées existantes ou par défaut
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        const pos: [number, number] = [lat, lng]
        setMapCenter(pos)
        setMarkerPosition(pos)
      }
    }
  }, [latitude, longitude])

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=fr`
      )
      const data: NominatimResult[] = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchLocation(searchQuery)
    }
  }

  const selectLocation = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const pos: [number, number] = [lat, lng]
    
    setMarkerPosition(pos)
    setMapCenter(pos)
    setSearchQuery(result.display_name)
    setShowResults(false)
    onLocationChange(result.display_name)
    onCoordinatesChange(result.lat, result.lon)
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    const pos: [number, number] = [lat, lng]
    setMarkerPosition(pos)
    setMapCenter(pos)
    onCoordinatesChange(lat.toString(), lng.toString())
    
    // Récupérer l'adresse depuis les coordonnées (reverse geocoding)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.display_name) {
          onLocationChange(data.display_name)
          setSearchQuery(data.display_name)
        }
      })
      .catch((err) => console.error('Erreur reverse geocoding:', err))
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery || location}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onLocationChange(e.target.value)
              if (e.target.value.trim()) {
                searchLocation(e.target.value)
              } else {
                setShowResults(false)
              }
            }}
            placeholder="Rechercher un lieu..."
            className="pl-10 pr-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        {/* Résultats de recherche */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectLocation(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm font-medium">{result.display_name.split(',')[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Carte */}
      <div className="w-full h-64 rounded-lg overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} zoom={13} />
          <MapClickHandler onClick={handleMapClick} />
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
      </div>
    </div>
  )
}

