'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { updateEventClient } from '@/lib/database/events-client'
import { EventWithAttendeeCount } from '@/lib/database/events-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateTimePicker } from '@/components/ui/datetime'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Dynamically import map components
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
const MapClickHandler = dynamic(
  () =>
    import('react-leaflet').then(mod => {
      const { useMapEvents } = mod
      return function MapClickHandler({
        onClick,
      }: {
        onClick: (lat: number, lng: number) => void
      }) {
        useMapEvents({
          click: e => {
            onClick(e.latlng.lat, e.latlng.lng)
          },
        })
        return null
      }
    }),
  { ssr: false }
)

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventWithAttendeeCount
  onEventUpdated: (event: EventWithAttendeeCount) => void
}

export function EditEventDialog({
  open,
  onOpenChange,
  event,
  onEventUpdated,
}: EditEventDialogProps) {
  const { theme, resolvedTheme } = useTheme()
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [position, setPosition] = useState<[number, number]>([
    event.latitude,
    event.longitude,
  ])
  const [loading, setLoading] = useState(false)

  // Determine if dark mode is active
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'

  useEffect(() => {
    if (open && event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setPosition([event.latitude, event.longitude])

      // Set dates from event
      const startDate = new Date(event.event_date)
      setEventDate(startDate)

      if (event.end_date) {
        const endDateValue = new Date(event.end_date)
        setEndDate(endDateValue)
      } else {
        setEndDate(undefined)
      }
    }
  }, [open, event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !eventDate) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate that end date is after start date if provided
    if (endDate && endDate <= eventDate) {
      toast.error('End time must be after start time')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const result = await updateEventClient(event.id, {
        title,
        description: description || undefined,
        latitude: position[0],
        longitude: position[1],
        event_date: eventDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
      })

      if (result.success && result.data) {
        const updatedEvent: EventWithAttendeeCount = {
          ...result.data,
          attendee_count: event.attendee_count,
        }
        onEventUpdated(updatedEvent)
        toast.success('Event updated successfully')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to update event')
      }
    } catch (error) {
      toast.error(`Failed to update event: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the event details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium mb-1 block'>
              Event Title *
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='e.g., Prague Car Meet'
              required
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-1 block'>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Event description...'
              className='w-full px-3 py-2 border rounded-md min-h-[80px]'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-1 block'>
                Start Date & Time *
              </label>
              <DateTimePicker date={eventDate} onDateChange={setEventDate} />
            </div>
            <div>
              <label className='text-sm font-medium mb-1 block'>
                End Date & Time
              </label>
              <DateTimePicker
                date={endDate}
                onDateChange={setEndDate}
                minDate={eventDate}
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-1 block'>
              Location (click on map to set)
            </label>
            <div className='h-64 w-full border rounded-md overflow-hidden'>
              <MapContainer
                center={position}
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
                <MapClickHandler
                  onClick={(lat, lng) => setPosition([lat, lng])}
                />
                <Marker position={position} />
              </MapContainer>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Updating...' : 'Update Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
