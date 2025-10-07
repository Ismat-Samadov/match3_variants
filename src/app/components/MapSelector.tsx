'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

// image imports -- TypeScript will accept these if you added the declarations above
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png?url'
import iconUrl from 'leaflet/dist/images/marker-icon.png?url'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png?url'

interface Location {
  latitude: number | null
  longitude: number | null
  name: string | null
}

interface MapSelectorProps {
  onLocationSelect: (locationName: string) => void
}

// Custom marker icon with emerald color
const createCustomIcon = (isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-full">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 27.5 16 42 16 42C16 42 32 27.5 32 16C32 7.163 24.837 0 16 0Z" fill="${isSelected ? '#0ea5e9' : '#10b981'}"/>
            <circle cx="16" cy="15" r="6" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  })
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function MapSelector({ onLocationSelect }: MapSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.3777, 49.8924])

  // Set the default Leaflet icon URLs once (client-side)
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl as string,
    iconUrl: iconUrl as string,
    shadowUrl: shadowUrl as string
  } as L.IconOptions)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/locations')
        if (!response.ok) throw new Error(`Failed to load locations`)
        const data = await response.json()
        setLocations(data)
      } catch (err) {
        setError('Unable to load locations. Please try again.')
        console.error('Failed to fetch locations', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  const handleLocationClick = (locationName: string, lat: number, lon: number) => {
    setSelectedLocation(locationName)
    setMapCenter([lat, lon])
    onLocationSelect(locationName)
  }

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading locations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center px-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-medium text-lg">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
      {/* Location List */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            Available Locations
          </h3>
          <div className="space-y-2">
            {locations.map((location, index) =>
              location.latitude && location.longitude ? (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationClick(location.name ?? '', location.latitude!, location.longitude!)}
                  onMouseEnter={() => setHoveredLocation(location.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 transform ${
                    selectedLocation === location.name
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md scale-[1.02]'
                      : hoveredLocation === location.name
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-[1.01]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{location.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Click to view on map
                      </div>
                    </div>
                    {selectedLocation === location.name && (
                      <div className="text-emerald-500 text-xl ml-2">✓</div>
                    )}
                  </div>
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '500px', width: '100%' }}
            className="z-0"
          >
            <MapController center={mapCenter} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map((location, index) =>
              location.latitude && location.longitude ? (
                <Marker
                  key={index}
                  position={[location.latitude, location.longitude]}
                  icon={createCustomIcon(selectedLocation === location.name)}
                  eventHandlers={{
                    mouseover: () => setHoveredLocation(location.name),
                    mouseout: () => setHoveredLocation(null),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="font-bold text-lg mb-3 text-gray-800">{location.name}</div>
                      <button
                        type="button"
                        onClick={() => handleLocationClick(location.name ?? '', location.latitude!, location.longitude!)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        {selectedLocation === location.name ? '✓ Selected' : 'Select This Location'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
        {selectedLocation && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <span className="text-xl">✓</span>
              <span className="font-semibold">Selected: {selectedLocation}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
