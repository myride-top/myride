'use client'

import { useEffect, useState } from 'react'
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
import type { DivIcon } from 'leaflet'

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
})
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
})

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
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    50.0755, 14.4378,
  ]) // Prague default
  const [eventIcons, setEventIcons] = useState<Map<string, DivIcon>>(new Map())
  const [defaultEventIcons, setDefaultEventIcons] = useState<
    Map<string, DivIcon>
  >(new Map())
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  )
  const [userLocationIcon, setUserLocationIcon] = useState<DivIcon | null>(null)

  // Determine if dark mode is active
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'

  // Initialize Leaflet and create icon only on client
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initLeaflet = async () => {
      // Import Leaflet CSS
      // @ts-expect-error - CSS files don't have type declarations
      await import('leaflet/dist/leaflet.css')

      const L = (await import('leaflet')).default

      // Fix default marker icon issue (only once)
      const iconPrototype = L.Icon.Default.prototype as {
        _getIconUrl?: () => string
      }
      if (iconPrototype._getIconUrl !== undefined) {
        delete iconPrototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      }

      // Create default icons for each event type
      const icons = new Map<string, DivIcon>()

      // Meetup icon - purple gradient with car emoji
      icons.set(
        'meetup',
        L.divIcon({
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
      )

      // Race icon - red gradient with flag emoji
      icons.set(
        'race',
        L.divIcon({
          className: 'custom-event-marker',
          html: `
          <div style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
            ">🏁</div>
          </div>
        `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      )

      // Show icon - gold gradient with trophy emoji
      icons.set(
        'show',
        L.divIcon({
          className: 'custom-event-marker',
          html: `
          <div style="
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
            ">🏆</div>
          </div>
        `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      )

      // Cruise icon - blue gradient with map emoji
      icons.set(
        'cruise',
        L.divIcon({
          className: 'custom-event-marker',
          html: `
          <div style="
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
            ">🗺️</div>
          </div>
        `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      )

      // Track Day icon - green gradient with checkered flag emoji
      icons.set(
        'track_day',
        L.divIcon({
          className: 'custom-event-marker',
          html: `
          <div style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            ">🏎️</div>
          </div>
        `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      )

      // Other icon - gray gradient with calendar emoji
      icons.set(
        'other',
        L.divIcon({
          className: 'custom-event-marker',
          html: `
          <div style="
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
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
            ">📅</div>
          </div>
        `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      )

      setDefaultEventIcons(icons)
    }

    initLeaflet()
  }, [])

  // Create user location marker icon with avatar
  useEffect(() => {
    if (typeof window === 'undefined' || !profile) return

    const createUserIcon = async () => {
      const L = (await import('leaflet')).default

      // Get initials for fallback
      const getInitials = () => {
        if (profile.full_name) {
          const names = profile.full_name.trim().split(' ')
          if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
          }
          return names[0][0].toUpperCase()
        }
        return profile.username.charAt(0).toUpperCase()
      }

      const avatarUrl = profile.avatar_url
      const initials = getInitials()

      // Create user location marker icon with avatar
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            overflow: hidden;
            background: ${avatarUrl ? 'transparent' : '#10b981'};
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="Your location" style="width: 100%; height: 100%; object-fit: cover;" />`
                : `<div style="color: white; font-weight: bold; font-size: 16px;">${initials}</div>`
            }
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      setUserLocationIcon(userIcon)
    }

    createUserIcon()
  }, [profile])

  // Create custom icons for events with images
  useEffect(() => {
    if (typeof window === 'undefined' || defaultEventIcons.size === 0) return

    const createEventIcons = async () => {
      const L = (await import('leaflet')).default
      const newIcons = new Map<string, DivIcon>()

      events.forEach(event => {
        if (event.event_image_url) {
          const icon = L.divIcon({
            className: 'custom-event-marker',
            html: `
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                overflow: hidden;
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <img src="${event.event_image_url}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
          newIcons.set(event.id, icon)
        }
      })

      setEventIcons(newIcons)
    }

    createEventIcons()
  }, [events, defaultEventIcons])

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
          const location: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ]
          setUserLocation(location)
          setMapCenter(location)
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
        {/* User location marker */}
        {userLocation && userLocationIcon && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}
        {/* Event markers */}
        {events.map(event => {
          // Use custom icon if event has an image, otherwise use default icon based on event type
          const iconToUse = event.event_image_url
            ? eventIcons.get(event.id) ||
              defaultEventIcons.get(event.event_type) ||
              defaultEventIcons.get('meetup')
            : defaultEventIcons.get(event.event_type) ||
              defaultEventIcons.get('meetup')

          return (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={iconToUse || undefined}
            >
              <Popup maxWidth={320} className='event-popup'>
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
          )
        })}
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
