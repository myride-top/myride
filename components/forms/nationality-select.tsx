'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { COUNTRIES } from '@/lib/utils/countries'
import { cn } from '@/lib/utils'

interface NationalitySelectProps {
  value?: string | null
  onValueChange: (value: string) => void
  label?: string
  required?: boolean
  className?: string
  id?: string
  placeholder?: string
}

export function NationalitySelect({
  value,
  onValueChange,
  label = 'Nationality',
  required = false,
  className,
  id = 'nationality',
  placeholder = 'Select your nationality',
}: NationalitySelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </Label>
      )}
      <Select value={value || ''} onValueChange={onValueChange}>
        <SelectTrigger id={id} className='w-full'>
          <SelectValue placeholder={placeholder}>
            {value ? (
              <div className='flex items-center gap-2'>
                <span className='text-base'>
                  {COUNTRIES.find(c => c.code === value)?.flag || ''}
                </span>
                <span>
                  {COUNTRIES.find(c => c.code === value)?.name || value}
                </span>
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className='max-h-[300px]'>
          {COUNTRIES.map(country => (
            <SelectItem key={country.code} value={country.code}>
              <div className='flex items-center gap-2'>
                <span className='text-base'>{country.flag}</span>
                <span>{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

