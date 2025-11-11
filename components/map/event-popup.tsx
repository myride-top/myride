'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { EventWithAttendeeCount } from '@/lib/database/events-client'
import {
  updateEventAttendanceClient,
  removeEventAttendanceClient,
  getUserEventAttendanceClient,
  getEventAttendeesWithDetailsClient,
  EventAttendeeWithDetails,
} from '@/lib/database/events-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { Car } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Share2,
  Route,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { AttendeesDialog } from './attendees-dialog'
import { EditEventDialog } from './edit-event-dialog'
import { DeleteEventDialog } from './delete-event-dialog'
import { deleteEventClient } from '@/lib/database/events-client'
import { useEventAnalytics } from '@/lib/hooks/use-event-analytics'
import { EventQRCodeModal } from './event-qr-code-modal'
import { generateQRCodeWithLogo } from '@/lib/utils/qr-code-with-logo'
import { useTheme } from 'next-themes'
import type * as Leaflet from 'leaflet'
import type { DivIcon } from 'leaflet'

// Dynamically import map components for route display
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then(mod => mod.Polyline),
  {
    ssr: false,
  }
)
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
})
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
})

// Component to fit map bounds to route
const FitBounds = dynamic(
  () =>
    import('react-leaflet').then(mod => {
      const { useMap } = mod
      return function FitBounds({ route }: { route: [number, number][] }) {
        const map = useMap()
        useEffect(() => {
          if (route.length > 0) {
            const L = (window as Window & { L: typeof Leaflet }).L
            if (L) {
              const bounds = L.latLngBounds(route)
              map.fitBounds(bounds, { padding: [20, 20] })
            }
          }
        }, [map, route])
        return null
      }
    }),
  { ssr: false }
)

// Component to display route in popup
function RouteMap({
  route,
  center,
  isDarkMode,
}: {
  route: [number, number][]
  center: [number, number]
  isDarkMode: boolean
}) {
  const [startMarkerIcon, setStartMarkerIcon] = useState<DivIcon | null>(null)
  const [endMarkerIcon, setEndMarkerIcon] = useState<DivIcon | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const createMarkers = async () => {
      const L = (await import('leaflet')).default

      // Create custom start marker icon - green flag style
      const startIcon = L.divIcon({
        className: 'route-start-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 20px;
              line-height: 1;
            ">🚩</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })

      // Create custom end marker icon - red flag style
      const endIcon = L.divIcon({
        className: 'route-end-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 20px;
              line-height: 1;
            ">🏁</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })

      setStartMarkerIcon(startIcon)
      setEndMarkerIcon(endIcon)
    }

    createMarkers()
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
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
      {route.length > 0 && (
        <>
          <Polyline
            positions={route}
            color='#3b82f6'
            weight={4}
            opacity={0.8}
          />
          <FitBounds route={route} />
          {/* Start marker */}
          {route.length > 0 && startMarkerIcon && (
            <Marker position={route[0]} icon={startMarkerIcon}>
              <Popup>
                <div className='text-center'>
                  <strong>Start of Route</strong>
                  <br />
                  Starting point
                </div>
              </Popup>
            </Marker>
          )}
          {/* End marker */}
          {route.length > 0 && endMarkerIcon && (
            <Marker position={route[route.length - 1]} icon={endMarkerIcon}>
              <Popup>
                <div className='text-center'>
                  <strong>End of Route</strong>
                  <br />
                  Final destination
                </div>
              </Popup>
            </Marker>
          )}
        </>
      )}
    </MapContainer>
  )
}

interface EventPopupProps {
  event: EventWithAttendeeCount
  onAttendanceChange: () => void
  onEventUpdated?: (event: EventWithAttendeeCount) => void
  onEventDeleted?: (eventId: string) => void
}

export function EventPopup({
  event,
  onAttendanceChange,
  onEventUpdated,
  onEventDeleted,
}: EventPopupProps) {
  const { user } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [attendees, setAttendees] = useState<EventAttendeeWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [attending, setAttending] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState<string>('')
  const [isAttendeesDialogOpen, setIsAttendeesDialogOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  const isCreator = user?.id === event.created_by
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'
  const isCruiseWithRoute =
    event.event_type === 'cruise' && event.route && event.route.length > 0

  // Track event analytics
  const { trackShare } = useEventAnalytics(event.id, event.created_by)

  const handleShare = async () => {
    if (!qrCodeDataUrl) {
      setIsGeneratingQR(true)
      try {
        const shareUrl = `${
          typeof window !== 'undefined' ? window.location.origin : ''
        }/map?event=${event.id}`
        const dataUrl = await generateQRCodeWithLogo(shareUrl, '/icon.jpg', {
          width: 300,
          margin: 2,
          logoSize: 80,
        })
        setQrCodeDataUrl(dataUrl)
        setShowQRCode(true)
      } catch {
        toast.error('Failed to generate QR code')
      } finally {
        setIsGeneratingQR(false)
      }
    } else {
      setShowQRCode(true)
    }
  }

  // Format date in 24-hour format without seconds
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year}, ${hours}:${minutes}`
  }

  useEffect(() => {
    const loadData = async () => {
      // Load address first
      try {
        const response = await fetch(
          `/api/geocode?lat=${event.latitude}&lng=${event.longitude}`
        )
        if (response.ok) {
          const data = await response.json()
          setAddress(data.address || null)
        }
      } catch (error) {
        console.error('Error loading address:', error)
      } finally {
        setLoadingAddress(false)
      }

      if (user) {
        try {
          const [userCars, userAttendance, attendeesData] = await Promise.all([
            getCarsByUserClient(user.id),
            getUserEventAttendanceClient(event.id, user.id),
            getEventAttendeesWithDetailsClient(event.id),
          ])
          if (userCars) {
            setCars(userCars)
          }
          if (userAttendance) {
            setAttending(userAttendance.attending)
            setSelectedCarId(userAttendance.car_id || '')
          }
          if (attendeesData) {
            setAttendees(attendeesData)
          }
        } catch (error) {
          console.error('Error loading data:', error)
        } finally {
        }
      } else {
        // Load attendees even if user is not logged in
        try {
          const attendeesData = await getEventAttendeesWithDetailsClient(
            event.id
          )
          if (attendeesData) {
            setAttendees(attendeesData)
          }
        } catch (error) {
          console.error('Error loading attendees:', error)
        } finally {
        }
      }
    }
    loadData()
  }, [user, event.id, event.latitude, event.longitude])

  const handleAttendanceChange = async (newAttending?: boolean) => {
    if (!user) return

    // Use the provided value or current state
    const willAttend = newAttending !== undefined ? newAttending : attending

    setLoading(true)
    try {
      if (willAttend) {
        const result = await updateEventAttendanceClient(
          event.id,
          true,
          selectedCarId && selectedCarId !== 'none' ? selectedCarId : null
        )
        if (result.success) {
          // Reload attendees
          const attendeesData = await getEventAttendeesWithDetailsClient(
            event.id
          )
          if (attendeesData) {
            setAttendees(attendeesData)
          }
          setAttending(true)
          toast.success('You are now attending this event!')
          onAttendanceChange()
        } else {
          toast.error(result.error || 'Failed to update attendance')
          setAttending(!willAttend) // Revert on error
        }
      } else {
        const result = await removeEventAttendanceClient(event.id)
        if (result.success) {
          toast.success('Attendance removed')
          setAttending(false)
          onAttendanceChange()
        } else {
          toast.error(result.error || 'Failed to remove attendance')
          setAttending(!willAttend) // Revert on error
        }
      }
    } catch (error) {
      toast.error(`Failed to update attendance: ${error}`)
      setAttending(!willAttend) // Revert on error
    } finally {
      setLoading(false)
    }
  }

  const handleEventUpdated = (updatedEvent: EventWithAttendeeCount) => {
    if (onEventUpdated) {
      onEventUpdated(updatedEvent)
    }
    setIsEditDialogOpen(false)
  }

  const handleDeleteEvent = async () => {
    setDeleting(true)
    try {
      const result = await deleteEventClient(event.id)
      if (result.success) {
        toast.success('Event deleted successfully')
        if (onEventDeleted) {
          onEventDeleted(event.id)
        }
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(result.error || 'Failed to delete event')
      }
    } catch (error) {
      toast.error(`Failed to delete event: ${error}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='w-80 max-h-[70vh] flex flex-col overflow-hidden'>
      <div className='flex-1 overflow-y-auto p-3 space-y-3 pr-2'>
        <div>
          <h3 className='font-semibold text-lg mb-1'>{event.title}</h3>
          {event.description && (
            <p className='text-sm text-muted-foreground mb-2'>
              {event.description}
            </p>
          )}
        </div>

        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Calendar className='w-4 h-4 flex-shrink-0' />
            <span className='break-words'>
              {event.end_date
                ? `${formatDateTime(event.event_date)} - ${formatDateTime(
                    event.end_date
                  )}`
                : formatDateTime(event.event_date)}
            </span>
          </div>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <MapPin className='w-4 h-4 flex-shrink-0' />
            <span className='break-words'>
              {loadingAddress
                ? 'Loading...'
                : address
                ? address
                : `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`}
            </span>
          </div>
          <button
            onClick={() => setIsAttendeesDialogOpen(true)}
            className='flex items-center gap-2 text-primary hover:text-primary/80 underline transition-colors cursor-pointer'
          >
            <Users className='w-4 h-4 flex-shrink-0' />
            <span className='font-medium'>
              {event.attendee_count} attending
            </span>
          </button>
          {isCruiseWithRoute && (
            <div className='pt-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground mb-2'>
                <Route className='w-4 h-4 flex-shrink-0' />
                <span className='font-medium'>Route</span>
              </div>
              <div className='h-48 w-full border rounded-md overflow-hidden'>
                <RouteMap
                  route={event.route || []}
                  center={[event.latitude, event.longitude]}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}
          <div className='pt-2'>
            <Button
              onClick={handleShare}
              variant='outline'
              size='sm'
              className='w-full'
              disabled={isGeneratingQR}
            >
              {isGeneratingQR ? (
                <>
                  <div className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className='w-4 h-4 mr-2' />
                  Share Event
                </>
              )}
            </Button>
          </div>
        </div>

        {isCreator && (
          <div className='pt-2 border-t flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditDialogOpen(true)}
              className='flex-1'
            >
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => setIsDeleteDialogOpen(true)}
              className='flex-1'
            >
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </Button>
          </div>
        )}

        {user && (
          <div className='pt-2 border-t space-y-3 pb-1'>
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id={`attend-${event.id}`}
                checked={attending}
                onChange={e => {
                  const newValue = e.target.checked
                  setAttending(newValue)
                  handleAttendanceChange(newValue)
                }}
                disabled={loading}
                className='w-4 h-4 flex-shrink-0'
              />
              <label
                htmlFor={`attend-${event.id}`}
                className='text-sm font-medium cursor-pointer'
              >
                I&apos;m attending
              </label>
            </div>

            {attending && cars.length > 0 && (
              <div>
                <label className='text-sm font-medium mb-1 block'>
                  Select your car:
                </label>
                <select
                  value={selectedCarId || 'none'}
                  onChange={e => setSelectedCarId(e.target.value)}
                  disabled={loading}
                  className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value='none'>No car selected</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {attending && (
              <Button
                onClick={() => handleAttendanceChange(attending)}
                disabled={loading}
                className='w-full'
                size='sm'
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </Button>
            )}
          </div>
        )}
      </div>

      <AttendeesDialog
        open={isAttendeesDialogOpen}
        onOpenChange={setIsAttendeesDialogOpen}
        attendees={attendees}
        eventTitle={event.title}
      />

      {isCreator && (
        <>
          <EditEventDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            event={event}
            onEventUpdated={handleEventUpdated}
          />
          <DeleteEventDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            eventTitle={event.title}
            onConfirm={handleDeleteEvent}
            loading={deleting}
          />
        </>
      )}

      <EventQRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        qrCodeDataUrl={qrCodeDataUrl}
        event={{
          title: event.title,
          event_date: event.event_date,
          end_date: event.end_date,
          description: event.description,
        }}
        currentUrl={
          typeof window !== 'undefined'
            ? `${window.location.origin}/map?event=${event.id}`
            : undefined
        }
        onShare={() => {
          // Track share analytics when QR code modal opens
          trackShare('other')
        }}
      />
    </div>
  )
}
