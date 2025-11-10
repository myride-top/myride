'use client'

import * as React from 'react'
import { useId } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateTimePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  disabled?: boolean
  minDate?: Date
  placeholder?: string
}

export function DateTimePicker({
  date,
  onDateChange,
  disabled = false,
  minDate,
  placeholder = 'Pick a date and time',
}: DateTimePickerProps) {
  const id = useId()
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)
  const [tempTime, setTempTime] = React.useState<string>('')

  // Initialize temp values from date prop
  React.useEffect(() => {
    if (date) {
      setTempDate(date)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setTempTime(`${hours}:${minutes}`)
    } else {
      setTempDate(undefined)
      setTempTime('')
    }
  }, [date])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setTempDate(undefined)
      setTempTime('')
      return
    }

    const now = new Date()
    const isToday = newDate.toDateString() === now.toDateString()

    // Preserve time if we have it, otherwise use current time
    if (tempTime) {
      const [hours, minutes] = tempTime.split(':').map(Number)
      newDate.setHours(hours || 0, minutes || 0, 0, 0)

      // If date is today and time is in the past, use current time
      if (isToday && newDate < now) {
        newDate.setHours(now.getHours(), now.getMinutes(), 0, 0)
        const h = String(newDate.getHours()).padStart(2, '0')
        const m = String(newDate.getMinutes()).padStart(2, '0')
        setTempTime(`${h}:${m}`)
      }
    } else {
      // Use current time, but if it's today, ensure it's not in the past
      if (isToday) {
        newDate.setHours(now.getHours(), now.getMinutes(), 0, 0)
      } else {
        // For future dates, use a default time (e.g., 12:00)
        newDate.setHours(12, 0, 0, 0)
      }
      const hours = String(newDate.getHours()).padStart(2, '0')
      const minutes = String(newDate.getMinutes()).padStart(2, '0')
      setTempTime(`${hours}:${minutes}`)
    }

    setTempDate(newDate)
    // Auto-apply when date is selected
    const finalDate = new Date(newDate)
    const [h, m] = tempTime.split(':').map(Number)
    finalDate.setHours(h || 0, m || 0, 0, 0)
    onDateChange(finalDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setTempTime(time)

    if (tempDate && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(tempDate)
      newDate.setHours(hours || 0, minutes || 0, 0, 0)

      // If the date is today, ensure the time is not in the past
      const now = new Date()
      if (newDate.toDateString() === now.toDateString() && newDate < now) {
        // If time is in the past, use current time instead
        const currentTime = new Date()
        newDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0)
        const h = String(newDate.getHours()).padStart(2, '0')
        const m = String(newDate.getMinutes()).padStart(2, '0')
        setTempTime(`${h}:${m}`)
      }

      setTempDate(newDate)
      onDateChange(newDate)
    }
  }

  // Get today's date at midnight for comparison
  const today = React.useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  // Determine the minimum allowed date (either minDate prop or today)
  const effectiveMinDate = React.useMemo(() => {
    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      return min > today ? min : today
    }
    return today
  }, [minDate, today])

  const displayValue = date
    ? `${format(date, 'dd.MM.yyyy')}, ${format(date, 'HH:mm')}`
    : placeholder

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 max-h-[80vh] overflow-y-auto'
        align='start'
        side='top'
        sideOffset={8}
        collisionPadding={{ top: 16, bottom: 80, left: 16, right: 16 }}
      >
        <div className='rounded-md border'>
          <Calendar
            mode='single'
            className='p-2'
            selected={tempDate}
            onSelect={handleDateSelect}
            disabled={disabled}
            fromDate={effectiveMinDate}
            modifiersClassNames={{
              disabled: 'rdp-day_disabled',
            }}
            modifiers={{
              disabled: [{ before: effectiveMinDate }],
            }}
          />
          <div className='border-t p-3'>
            <div className='flex items-center gap-3'>
              <Label htmlFor={id} className='text-xs'>
                Enter time
              </Label>
              <div className='relative grow'>
                <Input
                  id={id}
                  type='time'
                  step='60'
                  value={tempTime}
                  onChange={handleTimeChange}
                  disabled={disabled || !tempDate}
                  className='peer appearance-none ps-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                />
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50'>
                  <ClockIcon size={16} aria-hidden='true' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
