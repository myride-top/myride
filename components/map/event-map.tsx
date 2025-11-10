'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/context/auth-context'
import { EventWithAttendeeCount } from '@/lib/database/events-client'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { Profile } from '@/lib/types/database'
import { CreateEventDialog } from './create-event-dialog'
import { PremiumRequiredDialog } from './premium-required-dialog'
import { Plus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
)


import { EventPopup } from './event-popup'

interface EventMapProps {
  events: EventWithAttendeeCount[]
  onEventsChange: (events: EventWithAttendeeCount[]) => void
}

export function EventMap({ events, onEventsChange }: EventMapProps) {
  const { user } = useAuth()
  const { theme, resolvedTheme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPremiumRequiredDialogOpen, setIsPremiumRequiredDialogOpen] =
    useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([50.0755, 14.4378]) // Prague default
  const [eventIcon, setEventIcon] = useState<any>(null)

  // Determine if dark mode is active
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'

  // Initialize Leaflet and create icon only on client
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initLeaflet = async () => {
      // Import Leaflet CSS
      await import('leaflet/dist/leaflet.css')
      
      const L = (await import('leaflet')).default

      // Fix default marker icon issue (only once)
      if (L.Icon.Default.prototype._getIconUrl !== undefined) {
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      }

      // Create custom event marker icon
      const icon = L.divIcon({
        className: 'custom-event-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 18px;
              line-height: 1;
            ">🚗</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      setEventIcon(icon)
    }

    initLeaflet()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await getProfileByUserIdClient(user.id)
          setProfile(userProfile)
        } catch {}
      }
    }
    loadProfile()
  }, [user])

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setMapCenter([position.coords.latitude, position.coords.longitude])
        },
        () => {
          // Use default if geolocation fails
        }
      )
    }
  }, [])

  const handleEventCreated = (newEvent: EventWithAttendeeCount) => {
    onEventsChange([...events, newEvent])
    setIsCreateDialogOpen(false)
    toast.success('Event created successfully!')
  }

  const handleEventUpdated = (updatedEvent: EventWithAttendeeCount) => {
    onEventsChange(
      events.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
    )
  }

  const handleEventDeleted = (eventId: string) => {
    onEventsChange(events.filter(e => e.id !== eventId))
  }

  const handleCreateEventClick = () => {
    if (profile?.is_premium) {
      setIsCreateDialogOpen(true)
    } else {
      setIsPremiumRequiredDialogOpen(true)
    }
  }

  return (
    <div className='relative w-full h-full'>
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          key={isDarkMode ? 'dark' : 'light'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
          subdomains='abcd'
          maxZoom={20}
        />
        {events.map(event => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={eventIcon || undefined}
          >
            <Popup
              maxWidth={320}
              className='event-popup'
            >
              <EventPopup
                event={event}
                onAttendanceChange={() => {
                  // Reload events
                  window.location.reload()
                }}
                onEventUpdated={handleEventUpdated}
                onEventDeleted={handleEventDeleted}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {user && (
        <div className='absolute top-4 right-4 z-[1000]'>
          <Button
            onClick={handleCreateEventClick}
            className='shadow-lg cursor-pointer'
            variant={profile?.is_premium ? 'default' : 'outline'}
          >
            {profile?.is_premium ? (
              <>
                <Plus className='w-4 h-4 mr-2' />
                Create Event
              </>
            ) : (
              <>
                <Lock className='w-4 h-4 mr-2' />
                Create Event
              </>
            )}
          </Button>
        </div>
      )}

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
        initialCenter={mapCenter}
      />

      <PremiumRequiredDialog
        open={isPremiumRequiredDialogOpen}
        onOpenChange={setIsPremiumRequiredDialogOpen}
      />
    </div>
  )
}

