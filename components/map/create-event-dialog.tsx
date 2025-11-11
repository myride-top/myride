'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  createEventClient,
  updateEventClient,
} from '@/lib/database/events-client'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, X, MapPin, Trash2, Undo2 } from 'lucide-react'
import { EventType } from '@/lib/types/database'
import { uploadEventImage } from '@/lib/storage/photos'
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
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
})
const Polyline = dynamic(
  () => import('react-leaflet').then(mod => mod.Polyline),
  {
    ssr: false,
  }
)
const MapClickHandler = dynamic(
  () =>
    import('react-leaflet').then(mod => {
      const { useMapEvents } = mod
      return function MapClickHandler({
        onClick,
        enabled,
      }: {
        onClick: (lat: number, lng: number) => void
        enabled?: boolean
      }) {
        useMapEvents({
          click: e => {
            if (enabled) {
              onClick(e.latlng.lat, e.latlng.lng)
            }
          },
        })
        return null
      }
    }),
  { ssr: false }
)

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated: (event: EventWithAttendeeCount) => void
  initialCenter: [number, number]
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onEventCreated,
  initialCenter,
}: CreateEventDialogProps) {
  const { theme, resolvedTheme } = useTheme()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [position, setPosition] = useState<[number, number]>(initialCenter)
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState<EventType>('meetup')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [route, setRoute] = useState<[number, number][]>([])
  const [isDrawingRoute, setIsDrawingRoute] = useState(false)

  // Determine if dark mode is active
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'

  useEffect(() => {
    if (open) {
      setPosition(initialCenter)
      // Set default date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(20, 0, 0, 0)
      setEventDate(tomorrow)
      // Set default end time to 2 hours after start
      const endTime = new Date(tomorrow)
      endTime.setHours(endTime.getHours() + 2)
      setEndDate(endTime)
      // Reset form
      setTitle('')
      setDescription('')
      setEventType('meetup')
      setSelectedImage(null)
      setImagePreview(null)
      setRoute([])
      setIsDrawingRoute(false)
    }
  }, [open, initialCenter])

  // Reset route when event type changes
  useEffect(() => {
    if (eventType !== 'cruise') {
      setRoute([])
      setIsDrawingRoute(false)
    }
  }, [eventType])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = e => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (isDrawingRoute && eventType === 'cruise') {
      setRoute([...route, [lat, lng]])
    } else if (!isDrawingRoute) {
      setPosition([lat, lng])
    }
  }

  const removeLastRoutePoint = () => {
    if (route.length > 0) {
      setRoute(route.slice(0, -1))
    }
  }

  const clearRoute = () => {
    setRoute([])
    setIsDrawingRoute(false)
  }

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
      // First create the event
      const result = await createEventClient({
        title,
        description: description || undefined,
        latitude: position[0],
        longitude: position[1],
        event_date: eventDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : undefined,
        event_type: eventType,
        route: eventType === 'cruise' && route.length > 0 ? route : null,
      })

      if (result.success && result.data) {
        let imageUrl: string | null = null

        // Upload image if selected
        if (selectedImage && result.data.id) {
          setUploadingImage(true)
          try {
            const uploadedUrl = await uploadEventImage(
              selectedImage,
              result.data.id
            )
            if (uploadedUrl) {
              imageUrl = uploadedUrl
              // Update event with image URL
              await updateEventClient(result.data.id, {
                event_image_url: imageUrl,
              })
            }
          } catch (error) {
            console.error('Failed to upload image:', error)
            toast.error('Event created but image upload failed')
          } finally {
            setUploadingImage(false)
          }
        }

        const newEvent: EventWithAttendeeCount = {
          ...result.data,
          event_image_url: imageUrl || result.data.event_image_url,
          attendee_count: 0,
        }
        onEventCreated(newEvent)
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to create event')
      }
    } catch (error) {
      toast.error(`Failed to create event: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new car event that will appear on the map
          </DialogDescription>
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

          <div>
            <label className='text-sm font-medium mb-1 block'>
              Event Type *
            </label>
            <Select
              value={eventType}
              onValueChange={value => setEventType(value as EventType)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select event type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='meetup'>Meetup</SelectItem>
                <SelectItem value='race'>Race</SelectItem>
                <SelectItem value='show'>Show</SelectItem>
                <SelectItem value='cruise'>Cruise</SelectItem>
                <SelectItem value='track_day'>Track Day</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-sm font-medium mb-1 block'>
              Event Image/Icon
            </label>
            <div className='space-y-2'>
              {imagePreview ? (
                <div className='relative inline-block'>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    className='w-32 h-32 object-cover rounded-lg border'
                  />
                  <button
                    type='button'
                    onClick={removeImage}
                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <Upload className='w-8 h-8 mb-2 text-muted-foreground' />
                    <p className='mb-2 text-sm text-muted-foreground'>
                      <span className='font-semibold'>Click to upload</span> or
                      drag and drop
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
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
              {eventType === 'cruise'
                ? 'Route (click on map to add points)'
                : 'Location (click on map to set)'}
            </label>
            {eventType === 'cruise' && (
              <div className='mb-2 flex gap-2 flex-wrap'>
                <Button
                  type='button'
                  variant={isDrawingRoute ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setIsDrawingRoute(!isDrawingRoute)}
                >
                  <MapPin className='w-4 h-4 mr-2' />
                  {isDrawingRoute ? 'Stop Drawing' : 'Start Drawing Route'}
                </Button>
                {route.length > 0 && (
                  <>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={removeLastRoutePoint}
                      disabled={route.length === 0}
                    >
                      <Undo2 className='w-4 h-4 mr-2' />
                      Remove Last
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={clearRoute}
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Clear Route
                    </Button>
                  </>
                )}
                {route.length > 0 && (
                  <span className='text-sm text-muted-foreground self-center'>
                    {route.length} point{route.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
            <div className='h-64 w-full border rounded-md overflow-hidden relative'>
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
                <MapClickHandler onClick={handleMapClick} enabled={true} />
                <Marker position={position} />
                {route.length > 0 && (
                  <Polyline
                    positions={route}
                    color='#3b82f6'
                    weight={4}
                    opacity={0.8}
                  />
                )}
                {route.map((point, index) => (
                  <Marker key={index} position={point}>
                    <Popup>
                      Point {index + 1}
                      <br />
                      {point[0].toFixed(6)}, {point[1].toFixed(6)}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {eventType === 'cruise' && route.length > 0
                ? `Route: ${route.length} point${route.length !== 1 ? 's' : ''}`
                : `Coordinates: ${position[0].toFixed(
                    6
                  )}, ${position[1].toFixed(6)}`}
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
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
