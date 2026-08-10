'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/context/auth-context'
import { EventWithAttendeeCount } from '@/lib/database/events-client'
import {
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
import { AttendanceDialog } from './attendance-dialog'
import { deleteEventClient } from '@/lib/database/events-client'
import { useEventAnalytics } from '@/lib/hooks/use-event-analytics'
import { EventQRCodeModal } from './event-qr-code-modal'
import { generateQRCodeWithLogo } from '@/lib/utils/qr-code-with-logo'
import { useTheme } from 'next-themes'
import type * as Leaflet from 'leaflet'
import type { DivIcon } from 'leaflet'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'

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
  startTitle,
  startDescription,
  endTitle,
  endDescription,
}: {
  route: [number, number][]
  center: [number, number]
  isDarkMode: boolean
  startTitle: string
  startDescription: string
  endTitle: string
  endDescription: string
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
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        key={isDarkMode ? 'dark' : 'light'}
        attribution=''
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
                  <strong>{startTitle}</strong>
                  <br />
                  {startDescription}
                </div>
              </Popup>
            </Marker>
          )}
          {/* End marker */}
          {route.length > 0 && endMarkerIcon && (
            <Marker position={route[route.length - 1]} icon={endMarkerIcon}>
              <Popup>
                <div className='text-center'>
                  <strong>{endTitle}</strong>
                  <br />
                  {endDescription}
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
  isActive: boolean
  onAttendanceChange: () => void
  onEventUpdated?: (event: EventWithAttendeeCount) => void
  onEventDeleted?: (eventId: string) => void
}

export function EventPopup({
  event,
  isActive,
  onAttendanceChange,
  onEventUpdated,
  onEventDeleted,
}: EventPopupProps) {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [attendees, setAttendees] = useState<EventAttendeeWithDetails[]>([])
  const [loadingAttendees, setLoadingAttendees] = useState(false)
  const [attending, setAttending] = useState(false)
  const [isAttendeesDialogOpen, setIsAttendeesDialogOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
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

  const loadAttendees = useCallback(async () => {
    try {
      setLoadingAttendees(true)
      const attendeesData = await getEventAttendeesWithDetailsClient(event.id)
      if (attendeesData) {
        setAttendees(attendeesData)
      }
    } catch {
      setAttendees([])
    } finally {
      setLoadingAttendees(false)
    }
  }, [event.id])

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
        toast.error(t('map.toast.qrFailed', 'Failed to generate QR code'))
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
    if (!isActive) {
      return
    }

    const loadData = async () => {
      // Load address first
      setLoadingAddress(true)
      try {
        const response = await fetch(
          `/api/geocode?lat=${event.latitude}&lng=${event.longitude}`
        )
        if (response.ok) {
          const data = await response.json()
          setAddress(data.address || null)
        }
      } catch {
        setAddress(null)
      } finally {
        setLoadingAddress(false)
      }

      if (user) {
        try {
          const [userCars, userAttendance] = await Promise.all([
            getCarsByUserClient(user.id),
            getUserEventAttendanceClient(event.id, user.id),
          ])
          if (userCars) {
            setCars(userCars)
          }
          if (userAttendance) {
            setAttending(userAttendance.attending)
          } else {
            setAttending(false)
          }
        } catch {
          setCars([])
          setAttending(false)
        }
      } else {
        setCars([])
        setAttending(false)
      }
    }
    void loadData()
  }, [isActive, user, event.id, event.latitude, event.longitude])

  useEffect(() => {
    if (!isActive || !isAttendeesDialogOpen) {
      return
    }

    void loadAttendees()
  }, [isActive, isAttendeesDialogOpen, loadAttendees])

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
        toast.success(t('map.toast.eventDeleted', 'Event deleted successfully'))
        if (onEventDeleted) {
          onEventDeleted(event.id)
        }
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(
          result.error ||
            t('map.toast.eventDeleteFailed', 'Failed to delete event')
        )
      }
    } catch (error) {
      toast.error(
        `${t('map.toast.eventDeleteFailed', 'Failed to delete event')}: ${error}`
      )
    } finally {
      setDeleting(false)
    }
  }

  const containerClassName = `w-[85vw] max-w-[85vw] sm:w-80 sm:max-w-80 ${
    isCruiseWithRoute ? 'max-h-[85vh]' : 'max-h-[70vh]'
  } flex flex-col overflow-hidden`
  const contentClassName = `flex-1 ${
    isCruiseWithRoute ? 'overflow-visible' : 'overflow-y-auto'
  } p-2 sm:p-3 space-y-2 sm:space-y-3 pr-2`

  return (
    <>
      <div className={containerClassName}>
        <div className={contentClassName}>
          <div>
            <h3 className='font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 break-words leading-tight'>
              {event.title}
            </h3>
            {event.description && (
              <p className='text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2 break-words leading-snug'>
                {event.description}
              </p>
            )}
            {event.club && (
              <Link
                href={buildLocalePath(locale, `/c/${event.club.slug}`)}
                className='inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-primary hover:underline mb-1'
              >
                {event.club.badge_url ? (
                  <Image
                    src={event.club.badge_url}
                    alt={event.club.name}
                    width={16}
                    height={16}
                    className='h-4 w-4 rounded-full object-cover ring-1 ring-border'
                    unoptimized
                  />
                ) : null}
                {event.club.name}
              </Link>
            )}
          </div>

          <div className='space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm'>
            <div className='flex items-start gap-1.5 sm:gap-2 text-muted-foreground'>
              <Calendar className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5' />
              <span className='break-words leading-tight text-[11px] sm:text-sm'>
                {event.end_date
                  ? `${formatDateTime(event.event_date)} - ${formatDateTime(
                      event.end_date
                    )}`
                  : formatDateTime(event.event_date)}
              </span>
            </div>
            <div className='flex items-start gap-1.5 sm:gap-2 text-muted-foreground'>
              <MapPin className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5' />
              <span className='break-words leading-tight text-[11px] sm:text-sm'>
                {loadingAddress
                  ? t('common.loading', 'Loading...')
                  : address
                  ? address
                  : `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(
                      4
                    )}`}
              </span>
            </div>
            <button
              onClick={() => setIsAttendeesDialogOpen(true)}
              className='flex items-center gap-1.5 sm:gap-2 text-primary hover:text-primary/80 underline transition-colors cursor-pointer text-[11px] sm:text-sm'
            >
              <Users className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
              <span className='font-medium'>
                {event.attendee_count}{' '}
                {t('map.attendees.attendingShort', 'attending')}
              </span>
            </button>
            {isCruiseWithRoute && (
              <div className='pt-1 sm:pt-2'>
                <div className='flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-muted-foreground mb-1.5 sm:mb-2'>
                  <Route className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                  <span className='font-medium'>
                    {t('map.route.label', 'Route')}
                  </span>
                </div>
                <div className='h-24 sm:h-48 w-full border rounded-md overflow-hidden [&_.leaflet-control-attribution]:hidden'>
                  <RouteMap
                    route={event.route || []}
                    center={[event.latitude, event.longitude]}
                    isDarkMode={isDarkMode}
                    startTitle={t('map.route.startTitle', 'Start of Route')}
                    startDescription={t(
                      'map.route.startDescription',
                      'Starting point'
                    )}
                    endTitle={t('map.route.endTitle', 'End of Route')}
                    endDescription={t(
                      'map.route.endDescription',
                      'Final destination'
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className='pt-3 pb-2 px-2 sm:px-3 border-t flex flex-col gap-2'>
          <div className='flex flex-nowrap gap-2 sm:gap-2.5'>
            {user && (
              <Button
                variant={attending ? 'default' : 'outline'}
                size='sm'
                onClick={() => setIsAttendanceDialogOpen(true)}
                className='flex-1 min-w-0 text-[11px] sm:text-sm cursor-pointer gap-1'
              >
                {attending
                  ? t('map.attendance.attending', 'Attending')
                  : t('map.attendance.attend', 'Attend')}
              </Button>
            )}
            <Button
              onClick={handleShare}
              variant='outline'
              size='sm'
              className='flex-1 min-w-0 text-[11px] sm:text-sm cursor-pointer gap-1'
              disabled={isGeneratingQR}
            >
              {isGeneratingQR ? (
                <>
                  <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  <span className='hidden sm:inline text-[11px] sm:text-sm'>
                    {t('common.generating', 'Generating...')}
                  </span>
                </>
              ) : (
                <>
                  <Share2 className='w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5' />
                  <span className='text-[11px] sm:text-sm truncate'>
                    {t('common.share', 'Share')}
                  </span>
                </>
              )}
            </Button>
          </div>
          {isCreator && (
            <div className='flex flex-nowrap gap-2 sm:gap-2.5'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditDialogOpen(true)}
                className='flex-1 min-w-0 text-[11px] sm:text-sm cursor-pointer gap-1'
              >
                <Edit className='w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5' />
                <span className='text-[11px] sm:text-sm truncate'>
                  {t('common.edit', 'Edit')}
                </span>
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setIsDeleteDialogOpen(true)}
                className='flex-1 min-w-0 text-[11px] sm:text-sm cursor-pointer gap-1'
              >
                <Trash2 className='w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 flex-shrink-0' />
                <span className='text-[11px] sm:text-sm truncate'>
                  {t('common.delete', 'Delete')}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <>
        <AttendeesDialog
          open={isAttendeesDialogOpen}
          onOpenChange={setIsAttendeesDialogOpen}
          attendees={attendees}
          loading={loadingAttendees}
          eventTitle={event.title}
        />

        {user && (
          <AttendanceDialog
            open={isAttendanceDialogOpen}
            onOpenChange={setIsAttendanceDialogOpen}
            eventId={event.id}
            userId={user.id}
            cars={cars}
            onAttendanceChanged={async () => {
              try {
                const userAttendance = await getUserEventAttendanceClient(
                  event.id,
                  user.id
                )
                if (userAttendance) {
                  setAttending(userAttendance.attending)
                } else {
                  setAttending(false)
                }
                if (isAttendeesDialogOpen) {
                  await loadAttendees()
                }
                onAttendanceChange()
              } catch {
                // Leave current state as-is on transient errors.
              }
            }}
          />
        )}

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
      </>
    </>
  )
}
