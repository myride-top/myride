'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Car } from '@/lib/types/database'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  updateEventAttendanceClient,
  removeEventAttendanceClient,
  getUserEventAttendanceClient,
} from '@/lib/database/events-client'
import { useI18n } from '@/lib/i18n/provider'

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  userId: string
  cars: Car[]
  onAttendanceChanged: () => void
}

export function AttendanceDialog({
  open,
  onOpenChange,
  eventId,
  userId,
  cars,
  onAttendanceChanged,
}: AttendanceDialogProps) {
  const { t } = useI18n()
  const [attending, setAttending] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (open && userId) {
      const loadAttendance = async () => {
        try {
          const userAttendance = await getUserEventAttendanceClient(
            eventId,
            userId
          )
          if (userAttendance) {
            setAttending(userAttendance.attending)
            setSelectedCarId(userAttendance.car_id || '')
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error loading attendance:', error)
          }
        } finally {
          setInitialLoading(false)
        }
      }
      loadAttendance()
    } else {
      setInitialLoading(false)
    }
  }, [open, eventId, userId])

  const handleSave = async () => {
    setLoading(true)
    try {
      if (attending) {
        const result = await updateEventAttendanceClient(
          eventId,
          true,
          selectedCarId && selectedCarId !== 'none' ? selectedCarId : null
        )
        if (result.success) {
          toast.success(
            t('map.attendance.toast.attendingSaved', 'You are now attending this event!')
          )
          onAttendanceChanged()
          onOpenChange(false)
        } else {
          toast.error(
            result.error ||
              t('map.attendance.toast.updateFailed', 'Failed to update attendance')
          )
        }
      } else {
        const result = await removeEventAttendanceClient(eventId)
        if (result.success) {
          toast.success(t('map.attendance.toast.removed', 'Attendance removed'))
          onAttendanceChanged()
          onOpenChange(false)
        } else {
          toast.error(
            result.error ||
              t('map.attendance.toast.removeFailed', 'Failed to remove attendance')
          )
        }
      }
    } catch (error) {
      toast.error(
        `${t('map.attendance.toast.updateFailed', 'Failed to update attendance')}: ${error}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('map.attendance.title', 'Event Attendance')}</DialogTitle>
          <DialogDescription>
            {t(
              'map.attendance.description',
              "Manage your attendance and select which car you'll be bringing."
            )}
          </DialogDescription>
        </DialogHeader>
        {initialLoading ? (
          <div className='py-8 text-center text-sm text-muted-foreground'>
            {t('common.loading', 'Loading...')}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='attending-checkbox'
                checked={attending}
                onChange={e => setAttending(e.target.checked)}
                disabled={loading}
                className='w-4 h-4'
              />
              <label
                htmlFor='attending-checkbox'
                className='text-sm font-medium cursor-pointer'
              >
                {t("map.attendance.imAttending", "I'm attending")}
              </label>
            </div>

            {attending && cars.length > 0 && (
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('map.attendance.selectCar', 'Select your car:')}
                </label>
                <select
                  value={selectedCarId || 'none'}
                  onChange={e => setSelectedCarId(e.target.value)}
                  disabled={loading}
                  className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value='none'>
                    {t('map.attendance.noCarSelected', 'No car selected')}
                  </option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className='flex gap-2 pt-2'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className='flex-1'
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className='flex-1'
              >
                {loading
                  ? t('common.saving', 'Saving...')
                  : t('common.save', 'Save')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
