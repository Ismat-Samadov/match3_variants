'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
const DefaultIcon = L.Icon.Default.prototype as unknown as { _getIconUrl?: string }
delete DefaultIcon._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  id: number
  latitude: number
  longitude: number
  name: string
}

interface LocationMapProps {
  onLocationSelect: (locationName: string) => void
  selectedLocation: string
}

// Custom orange marker icon for stores
const createCustomIcon = (isSelected: boolean, isNearest: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${isNearest ? '#10b981' : isSelected ? '#ea580c' : '#f97316'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// User location marker icon
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3b82f6;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function MapUpdater({ locations, selectedLocation }: { locations: Location[], selectedLocation: string }) {
  const map = useMap()

  useEffect(() => {
    if (locations.length > 0) {
      const selectedLoc = locations.find(loc => loc.name === selectedLocation)

      if (selectedLoc) {
        // Center map on selected location
        map.setView([selectedLoc.latitude, selectedLoc.longitude], 13, {
          animate: true,
        })
      } else {
        // Default to Azerbaijan center
        const bounds = L.latLngBounds(
          locations.map(loc => [loc.latitude, loc.longitude] as L.LatLngTuple)
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [map, locations, selectedLocation])

  return null
}

export default function LocationMap({ onLocationSelect, selectedLocation }: LocationMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearestLocation, setNearestLocation] = useState<Location | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation sizin brauzerinizdə dəstəklənmir')
      return
    }

    setGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userPos)

        // Find nearest location
        if (locations.length > 0) {
          let nearest = locations[0]
          let minDistance = calculateDistance(
            userPos.lat,
            userPos.lng,
            locations[0].latitude,
            locations[0].longitude
          )

          locations.forEach((loc) => {
            const distance = calculateDistance(userPos.lat, userPos.lng, loc.latitude, loc.longitude)
            if (distance < minDistance) {
              minDistance = distance
              nearest = loc
            }
          })

          setNearestLocation(nearest)
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Məkanınızı müəyyən etmək mümkün olmadı. Zəhmət olmasa brauzerdə icazə verin.')
        setGettingLocation(false)
      }
    )
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Xəritə yüklənir...</p>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Məkan məlumatları tapılmadı</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Location Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={getUserLocation}
          disabled={gettingLocation}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors shadow-md"
        >
          {gettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Axtarılır...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Mənim Məkanım
            </>
          )}
        </button>

        {nearestLocation && (
          <button
            type="button"
            onClick={() => onLocationSelect(nearestLocation.name)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Ən Yaxın Filialı Seç
          </button>
        )}
      </div>

      {nearestLocation && userLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-semibold">Ən yaxın filial: {nearestLocation.name}</p>
              <p className="text-green-700">
                Məsafə: {calculateDistance(userLocation.lat, userLocation.lng, nearestLocation.latitude, nearestLocation.longitude).toFixed(1)} km
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg relative">
        <MapContainer
          center={[40.4093, 49.8671]} // Baku coordinates
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater locations={locations} selectedLocation={selectedLocation} />

          {/* User location marker and radius */}
          {userLocation && (
            <>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={50}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
              />
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createUserIcon()}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold text-blue-600">Sizin məkanınız</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Store locations */}
          {locations.map((location) => {
            const isSelected = location.name === selectedLocation
            const isNearest = nearestLocation?.id === location.id
            const distance = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lng, location.latitude, location.longitude)
              : null

            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={createCustomIcon(isSelected, isNearest)}
                eventHandlers={{
                  click: () => {
                    onLocationSelect(location.name)
                  },
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <h3 className="font-bold text-gray-900 mb-1">{location.name}</h3>
                    {isNearest && (
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded mb-2">
                        ⭐ Ən yaxın
                      </span>
                    )}
                    {distance && (
                      <p className="text-sm text-gray-600 mb-2">Məsafə: {distance.toFixed(1)} km</p>
                    )}
                    <button
                      onClick={() => onLocationSelect(location.name)}
                      className={`mt-2 px-3 py-1 text-white text-sm font-medium rounded-md transition-colors ${
                        isNearest ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      Seç
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
