'use client'

import { useState } from 'react'
import { Car, CarPhoto, PhotoCategory } from '@/lib/types/database'
import { getUnitLabel } from '@/lib/utils'
import { SortablePhotoGallery } from '@/components/photos/sortable-photo-gallery'
import { PhotoUpload } from '@/components/photos/photo-upload'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface CarFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Car>
  onSubmit: (data: CarFormData) => Promise<void>
  onPhotoUploadComplete?: (photo: CarPhoto) => Promise<void>
  onBatchUploadComplete?: (photos: CarPhoto[]) => Promise<void>
  onPhotoCategoryChange?: (
    photoUrl: string,
    newCategory: PhotoCategory
  ) => Promise<void>
  onSetMainPhoto?: (photoUrl: string) => Promise<void>
  onDeletePhoto?: (photoUrl: string) => Promise<void>
  onPhotoDescriptionChange?: (
    photoIndex: number,
    description: string
  ) => Promise<void>
  onPhotoReorder?: (photos: CarPhoto[]) => Promise<void>
  unitPreference: 'metric' | 'imperial'
  saving?: boolean
  existingPhotos?: CarPhoto[]
  mainPhotoUrl?: string
}

// Define the form data type
interface CarFormData {
  name: string
  url_slug: string
  make: string
  model: string
  year: string | number
  description: string | null
  build_story: string | null
  build_start_date: string | null
  total_build_cost: string | number | null
  build_goals: string[] | null
  inspiration: string | null
  engine_displacement: string | number | null
  engine_cylinders: string | number | null
  engine_code: string | null
  horsepower: string | number | null
  torque: string | number | null
  engine_type: string | null
  fuel_type: string | null
  transmission: string | null
  drivetrain: string | null
  zero_to_sixty: string | number | null
  top_speed: string | number | null
  quarter_mile: string | number | null
  weight: string | number | null
  power_to_weight: string | null
  front_brakes: string | null
  rear_brakes: string | null
  wheel_size: string | null
  wheel_brand: string | null
  wheel_material: string | null
  wheel_offset: string | null
  front_tire_size: string | null
  rear_tire_size: string | null
  front_tire_brand: string | null
  front_tire_model: string | null
  front_tire_pressure: string | number | null
  rear_tire_brand: string | null
  rear_tire_model: string | null
  rear_tire_pressure: string | number | null
  front_suspension: string | null
  rear_suspension: string | null
  coilovers: string | null
  sway_bars: string | null
  suspension_type: string | null
  ride_height: string | null
  paint_color: string | null
  paint_type: string | null
  wrap_color: string | null
  carbon_fiber_parts: string | null
  lighting: string | null
  body_kit: string | null
  interior_color: string | null
  interior_material: string | null
  seats: string | null
  steering_wheel: string | null
  shift_knob: string | null
  gauges: string | null
  modifications: string[] | null
  dyno_results: string | null
  vin: string | null
  mileage: string | number | null
  fuel_economy: string | null
  maintenance_history: string | null
  instagram_handle: string | null
  youtube_channel: string | null
  build_thread_url: string | null
  website_url: string | null
  brake_rotors: string | null
  brake_caliper_brand: string | null
  brake_lines: string | null
  id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Car details and description' },
  { id: 2, title: 'Build Story', description: 'Project background and goals' },
  {
    id: 3,
    title: 'Engine',
    description: 'Engine specifications and performance',
  },
  { id: 4, title: 'Wheels', description: 'Wheels, tires, and brakes' },
  { id: 5, title: 'Suspension', description: 'Suspension and chassis setup' },
  { id: 6, title: 'Exterior', description: 'Body, paint, and lighting' },
  {
    id: 7,
    title: 'Interior',
    description: 'Interior details and modifications',
  },
  {
    id: 8,
    title: 'Additional',
    description: 'VIN, mileage, and other details',
  },
  { id: 9, title: 'Social', description: 'Link your profiles' },
  { id: 10, title: 'Review', description: 'Review and save changes' },
]

// Step Components
function BasicInformationStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>
        Basic Information
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Car Name *
          </label>
          <input
            type='text'
            name='name'
            value={carData.name || ''}
            onChange={onInputChange}
            placeholder='e.g., My Dream Build'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            URL Slug *
          </label>
          <input
            type='text'
            name='url_slug'
            value={carData.url_slug || ''}
            onChange={onInputChange}
            placeholder='e.g., my-dream-build'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Make *
          </label>
          <input
            type='text'
            name='make'
            value={carData.make || ''}
            onChange={onInputChange}
            placeholder='e.g., Mazda'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Model *
          </label>
          <input
            type='text'
            name='model'
            value={carData.model || ''}
            onChange={onInputChange}
            placeholder='e.g., RX-7'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Year *
          </label>
          <input
            type='number'
            name='year'
            value={carData.year || ''}
            onChange={onInputChange}
            min='1900'
            max={new Date().getFullYear() + 1}
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Description
          </label>
          <textarea
            name='description'
            value={carData.description || ''}
            onChange={onInputChange}
            rows={4}
            placeholder='Tell us about your car...'
            className='w-full px-3 py-2 border border-input rounded-md focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function BuildStoryStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>Build Story</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Build Story
          </label>
          <textarea
            name='build_story'
            value={carData.build_story || ''}
            onChange={onInputChange}
            rows={4}
            placeholder="What's the story behind it?"
            className='w-full px-3 py-2 border border-input rounded-md focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Build Start Date
          </label>
          <input
            type='date'
            name='build_start_date'
            value={carData.build_start_date || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Total Build Cost
          </label>
          <input
            type='number'
            name='total_build_cost'
            value={carData.total_build_cost || ''}
            onChange={onInputChange}
            placeholder='e.g., 25000'
            min='0'
            step='0.01'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Build Goals
          </label>
          <textarea
            name='build_goals'
            value={carData.build_goals ? carData.build_goals.join(', ') : ''}
            onChange={e => {
              const goals = e.target.value
                .split(',')
                .map(g => g.trim())
                .filter(g => g)
              // Create a custom event object to pass the array value
              const customEvent = {
                target: { name: 'build_goals', value: goals },
              }
              onInputChange(customEvent)
            }}
            rows={3}
            placeholder='List build goals separated by commas (e.g., Track Car, 1000hp, 100mph)'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Inspiration
          </label>
          <input
            type='text'
            name='inspiration'
            value={carData.inspiration || ''}
            onChange={onInputChange}
            placeholder='e.g., Aventador SVJ, 911 GT3 RS'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function EnginePerformanceStep({
  carData,
  onInputChange,
  unitPreference,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
  unitPreference: 'metric' | 'imperial'
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>
        Engine & Performance
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Engine Displacement ({unitPreference === 'metric' ? 'L' : 'cc'})
          </label>
          <input
            type='text'
            name='engine_displacement'
            value={carData.engine_displacement || ''}
            onChange={onInputChange}
            placeholder={unitPreference === 'metric' ? '2.0' : '2000'}
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Cylinders
          </label>
          <input
            type='text'
            name='engine_cylinders'
            value={carData.engine_cylinders || ''}
            onChange={onInputChange}
            placeholder='4, 6, 8, etc.'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Engine Code
          </label>
          <input
            type='text'
            name='engine_code'
            value={carData.engine_code || ''}
            onChange={onInputChange}
            placeholder='e.g., K20A, 2JZ-GTE'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Horsepower
          </label>
          <input
            type='number'
            name='horsepower'
            value={carData.horsepower || ''}
            onChange={onInputChange}
            placeholder='200'
            min='0'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Torque ({getUnitLabel('torque', unitPreference)})
          </label>
          <input
            type='number'
            name='torque'
            value={carData.torque || ''}
            onChange={onInputChange}
            placeholder='180'
            min='0'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Engine Type
          </label>
          <input
            type='text'
            name='engine_type'
            value={carData.engine_type || ''}
            onChange={onInputChange}
            placeholder='e.g., Inline-4, V6, Boxer'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Fuel Type
          </label>
          <input
            type='text'
            name='fuel_type'
            value={carData.fuel_type || ''}
            onChange={onInputChange}
            placeholder='e.g., Gasoline, Diesel, Electric'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Transmission
          </label>
          <input
            type='text'
            name='transmission'
            value={carData.transmission || ''}
            onChange={onInputChange}
            placeholder='e.g., 6-speed Manual, 8-speed Auto'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Drivetrain
          </label>
          <input
            type='text'
            name='drivetrain'
            value={carData.drivetrain || ''}
            onChange={onInputChange}
            placeholder='e.g., FWD, RWD, AWD'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            {unitPreference === 'metric' ? '0-100 km/h' : '0-60 mph'} (seconds)
          </label>
          <input
            type='number'
            name='zero_to_sixty'
            value={carData.zero_to_sixty || ''}
            onChange={onInputChange}
            placeholder='5.2'
            min='0'
            step='0.1'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Top Speed ({getUnitLabel('speed', unitPreference)})
          </label>
          <input
            type='number'
            name='top_speed'
            value={carData.top_speed || ''}
            onChange={onInputChange}
            placeholder='155'
            min='0'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Quarter Mile (seconds)
          </label>
          <input
            type='number'
            name='quarter_mile'
            value={carData.quarter_mile || ''}
            onChange={onInputChange}
            placeholder='13.5'
            min='0'
            step='0.1'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Weight ({getUnitLabel('weight', unitPreference)})
          </label>
          <input
            type='number'
            name='weight'
            value={carData.weight || ''}
            onChange={onInputChange}
            placeholder='1200'
            min='0'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Power to Weight Ratio
          </label>
          <input
            type='text'
            name='power_to_weight'
            value={carData.power_to_weight || ''}
            onChange={onInputChange}
            placeholder='e.g., 200 HP/ton'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function WheelsTiresStep({
  carData,
  onInputChange,
  unitPreference,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
  unitPreference: 'metric' | 'imperial'
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>Wheels & Tires</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Wheel Size
          </label>
          <input
            type='text'
            name='wheel_size'
            value={carData.wheel_size || ''}
            onChange={onInputChange}
            placeholder='e.g., 18x8.5'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Wheel Brand
          </label>
          <input
            type='text'
            name='wheel_brand'
            value={carData.wheel_brand || ''}
            onChange={onInputChange}
            placeholder='e.g., BBS'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Wheel Material
          </label>
          <input
            type='text'
            name='wheel_material'
            value={carData.wheel_material || ''}
            onChange={onInputChange}
            placeholder='e.g., Forged Aluminum, Cast Steel'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Wheel Offset
          </label>
          <input
            type='text'
            name='wheel_offset'
            value={carData.wheel_offset || ''}
            onChange={onInputChange}
            placeholder='e.g., +35, -10'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Front Tire Size
          </label>
          <input
            type='text'
            name='front_tire_size'
            value={carData.front_tire_size || ''}
            onChange={onInputChange}
            placeholder='e.g., 225/40R18'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Rear Tire Size
          </label>
          <input
            type='text'
            name='rear_tire_size'
            value={carData.rear_tire_size || ''}
            onChange={onInputChange}
            placeholder='e.g., 255/40R18'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Front Tire Brand
          </label>
          <input
            type='text'
            name='front_tire_brand'
            value={carData.front_tire_brand || ''}
            onChange={onInputChange}
            placeholder='e.g., Michelin, Pirelli'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Front Tire Model
          </label>
          <input
            type='text'
            name='front_tire_model'
            value={carData.front_tire_model || ''}
            onChange={onInputChange}
            placeholder='e.g., Pilot Sport 4S'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Front Tire Pressure ({unitPreference === 'metric' ? 'bar' : 'PSI'})
          </label>
          <input
            type='number'
            name='front_tire_pressure'
            value={carData.front_tire_pressure || ''}
            onChange={onInputChange}
            placeholder={unitPreference === 'metric' ? '2.2' : '32'}
            min='0'
            step={unitPreference === 'metric' ? '0.1' : '1'}
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Rear Tire Brand
          </label>
          <input
            type='text'
            name='rear_tire_brand'
            value={carData.rear_tire_brand || ''}
            onChange={onInputChange}
            placeholder='e.g., Michelin, Pirelli'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Rear Tire Model
          </label>
          <input
            type='text'
            name='rear_tire_model'
            value={carData.rear_tire_model || ''}
            onChange={onInputChange}
            placeholder='e.g., Pilot Sport 4S'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Rear Tire Pressure ({unitPreference === 'metric' ? 'bar' : 'PSI'})
          </label>
          <input
            type='number'
            name='rear_tire_pressure'
            value={carData.rear_tire_pressure || ''}
            onChange={onInputChange}
            placeholder={unitPreference === 'metric' ? '2.2' : '32'}
            min='0'
            step={unitPreference === 'metric' ? '0.1' : '1'}
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Front Brakes
          </label>
          <input
            type='text'
            name='front_brakes'
            value={carData.front_brakes || ''}
            onChange={onInputChange}
            placeholder='e.g., Brembo 4-Piston'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Rear Brakes
          </label>
          <input
            type='text'
            name='rear_brakes'
            value={carData.rear_brakes || ''}
            onChange={onInputChange}
            placeholder='e.g., Brembo 2-Piston'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Brake Rotors
          </label>
          <input
            type='text'
            name='brake_rotors'
            value={carData.brake_rotors || ''}
            onChange={onInputChange}
            placeholder='e.g., Slotted, Drilled, Carbon Ceramic'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Brake Caliper Brand
          </label>
          <input
            type='text'
            name='brake_caliper_brand'
            value={carData.brake_caliper_brand || ''}
            onChange={onInputChange}
            placeholder='e.g., Brembo, AP Racing'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Brake Lines
          </label>
          <input
            type='text'
            name='brake_lines'
            value={carData.brake_lines || ''}
            onChange={onInputChange}
            placeholder='e.g., Stainless Steel, Braided'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function SuspensionChassisStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
  unitPreference: 'metric' | 'imperial'
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>
        Suspension & Chassis
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Front Suspension
          </label>
          <input
            type='text'
            name='front_suspension'
            value={carData.front_suspension || ''}
            onChange={onInputChange}
            placeholder='e.g., MacPherson Strut'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Rear Suspension
          </label>
          <input
            type='text'
            name='rear_suspension'
            value={carData.rear_suspension || ''}
            onChange={onInputChange}
            placeholder='e.g., Multi-Link'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Coilovers
          </label>
          <input
            type='text'
            name='coilovers'
            value={carData.coilovers || ''}
            onChange={onInputChange}
            placeholder='e.g., KW Variant 3'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Sway Bars
          </label>
          <input
            type='text'
            name='sway_bars'
            value={carData.sway_bars || ''}
            onChange={onInputChange}
            placeholder='e.g., H&R 24mm Front, 22mm Rear'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Suspension Type
          </label>
          <input
            type='text'
            name='suspension_type'
            value={carData.suspension_type || ''}
            onChange={onInputChange}
            placeholder='e.g., Independent, Solid Axle, Multi-Link'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Ride Height
          </label>
          <input
            type='text'
            name='ride_height'
            value={carData.ride_height || ''}
            onChange={onInputChange}
            placeholder='e.g., Lowered 2 inches, Stock height'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function ExteriorInteriorStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
  unitPreference: 'metric' | 'imperial'
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>Exterior</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Paint Color
          </label>
          <input
            type='text'
            name='paint_color'
            value={carData.paint_color || ''}
            onChange={onInputChange}
            placeholder='e.g., Championship White'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Body Kit
          </label>
          <input
            type='text'
            name='body_kit'
            value={carData.body_kit || ''}
            onChange={onInputChange}
            placeholder='e.g., Rocket Bunny'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Paint Type
          </label>
          <input
            type='text'
            name='paint_type'
            value={carData.paint_type || ''}
            onChange={onInputChange}
            placeholder='e.g., Metallic, Matte, Pearl'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Wrap Color
          </label>
          <input
            type='text'
            name='wrap_color'
            value={carData.wrap_color || ''}
            onChange={onInputChange}
            placeholder='e.g., Satin Black, Gloss Red'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Carbon Fiber Parts
          </label>
          <input
            type='text'
            name='carbon_fiber_parts'
            value={carData.carbon_fiber_parts || ''}
            onChange={onInputChange}
            placeholder='e.g., Hood, Trunk, Side Skirts'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Lighting
          </label>
          <input
            type='text'
            name='lighting'
            value={carData.lighting || ''}
            onChange={onInputChange}
            placeholder='e.g., LED Headlights, Underglow'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function InteriorStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>
        Interior Details
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Interior Color
          </label>
          <input
            type='text'
            name='interior_color'
            value={carData.interior_color || ''}
            onChange={onInputChange}
            placeholder='e.g., Black'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Interior Material
          </label>
          <input
            type='text'
            name='interior_material'
            value={carData.interior_material || ''}
            onChange={onInputChange}
            placeholder='e.g., Leather, Alcantara, Carbon Fiber'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Seats
          </label>
          <input
            type='text'
            name='seats'
            value={carData.seats || ''}
            onChange={onInputChange}
            placeholder='e.g., Recaro Sport Seats'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Steering Wheel
          </label>
          <input
            type='text'
            name='steering_wheel'
            value={carData.steering_wheel || ''}
            onChange={onInputChange}
            placeholder='e.g., Momo, Sparco, Custom'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Shift Knob
          </label>
          <input
            type='text'
            name='shift_knob'
            value={carData.shift_knob || ''}
            onChange={onInputChange}
            placeholder='e.g., B&M, Hurst, Custom'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Gauges
          </label>
          <input
            type='text'
            name='gauges'
            value={carData.gauges || ''}
            onChange={onInputChange}
            placeholder='e.g., AEM, Defi, Stack'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function AdditionalDetailsStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>
        Additional Details
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            VIN
          </label>
          <input
            type='text'
            name='vin'
            value={carData.vin || ''}
            onChange={onInputChange}
            placeholder='e.g., 1HGBH41JXMN109186'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Mileage
          </label>
          <input
            type='number'
            name='mileage'
            value={carData.mileage || ''}
            onChange={onInputChange}
            placeholder='e.g., 50000'
            min='0'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Fuel Economy
          </label>
          <input
            type='text'
            name='fuel_economy'
            value={carData.fuel_economy || ''}
            onChange={onInputChange}
            placeholder='e.g., 25 MPG City, 30 MPG Highway'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Dyno Results
          </label>
          <input
            type='text'
            name='dyno_results'
            value={carData.dyno_results || ''}
            onChange={onInputChange}
            placeholder='e.g., 350 WHP, 320 WTQ'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Modifications
          </label>
          <textarea
            name='modifications'
            value={
              carData.modifications ? carData.modifications.join(', ') : ''
            }
            onChange={e => {
              const mods = e.target.value
                .split(',')
                .map(m => m.trim())
                .filter(m => m)
              const customEvent = {
                target: { name: 'modifications', value: mods },
              }
              onInputChange(customEvent)
            }}
            rows={3}
            placeholder='e.g., Cold air intake, exhaust, tune'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function PhotosSocialStep({
  carData,
  onInputChange,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
  unitPreference: 'metric' | 'imperial'
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>Social</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Instagram Handle
          </label>
          <input
            type='text'
            name='instagram_handle'
            value={carData.instagram_handle || ''}
            onChange={onInputChange}
            placeholder='e.g., @mycarbuild'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            YouTube Channel
          </label>
          <input
            type='text'
            name='youtube_channel'
            value={carData.youtube_channel || ''}
            onChange={onInputChange}
            placeholder='e.g., https://youtube.com/mycarbuild'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Website URL
          </label>
          <input
            type='text'
            name='website_url'
            value={carData.website_url || ''}
            onChange={onInputChange}
            placeholder='e.g., https://mycarbuild.com'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
          />
        </div>
      </div>
    </div>
  )
}

function ReviewSubmitStep({
  mode,
}: {
  carData: CarFormData
  onInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | string[] } }
  ) => void
  unitPreference: 'metric' | 'imperial'
  mode: 'create' | 'edit'
}) {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-foreground'>Review & Submit</h3>

      <div className='bg-muted/50 p-6 rounded-lg'>
        <p className='text-muted-foreground text-center'>
          Review your car details and click &quot;
          {mode === 'create' ? 'Create Car' : 'Save Changes'}&quot; to{' '}
          {mode === 'create' ? 'create' : 'update'} your car.
        </p>
      </div>
    </div>
  )
}

export const CarForm = ({
  mode,
  initialData = {},
  onSubmit,
  onPhotoUploadComplete,
  onBatchUploadComplete,
  onPhotoCategoryChange,
  onSetMainPhoto,
  onDeletePhoto,
  onPhotoDescriptionChange,
  onPhotoReorder,
  unitPreference,
  saving = false,
  existingPhotos = [],
  mainPhotoUrl,
}: CarFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    url_slug: '',
    make: '',
    model: '',
    year: '',
    description: '',
    build_story: '',
    build_start_date: '',
    total_build_cost: '',
    build_goals: [] as string[],
    inspiration: '',
    engine_displacement: '',
    engine_cylinders: '',
    engine_code: '',
    horsepower: '',
    torque: '',
    engine_type: '',
    fuel_type: '',
    transmission: '',
    drivetrain: '',
    zero_to_sixty: '',
    top_speed: '',
    quarter_mile: '',
    weight: '',
    power_to_weight: '',
    front_brakes: '',
    rear_brakes: '',
    wheel_size: '',
    wheel_brand: '',
    wheel_material: '',
    wheel_offset: '',
    front_tire_size: '',
    rear_tire_size: '',
    front_tire_brand: '',
    front_tire_model: '',
    front_tire_pressure: '',
    rear_tire_brand: '',
    rear_tire_model: '',
    rear_tire_pressure: '',
    front_suspension: '',
    rear_suspension: '',
    coilovers: '',
    sway_bars: '',
    suspension_type: '',
    ride_height: '',
    paint_color: '',
    paint_type: '',
    wrap_color: '',
    carbon_fiber_parts: '',
    lighting: '',
    body_kit: '',
    interior_color: '',
    interior_material: '',
    seats: '',
    steering_wheel: '',
    shift_knob: '',
    gauges: '',
    modifications: [] as string[],
    dyno_results: '',
    vin: '',
    mileage: '',
    fuel_economy: '',
    maintenance_history: '',
    instagram_handle: '',
    youtube_channel: '',
    build_thread_url: '',
    website_url: '',
    brake_rotors: '',
    brake_caliper_brand: '',
    brake_lines: '',
    ...initialData,
  })

  // Check if a step has data
  const hasStepData = (stepId: number): boolean => {
    switch (stepId) {
      case 1: // Basic Information - ALL fields must be filled
        return !!(
          formData.make &&
          formData.model &&
          formData.year &&
          formData.url_slug
        )
      case 2: // Build Story - ALL fields must be filled
        return !!(
          formData.build_story &&
          formData.build_start_date &&
          formData.total_build_cost
        )
      case 3: // Engine & Performance - ANY field can be filled
        return !!(
          formData.engine_displacement ||
          formData.horsepower ||
          formData.torque ||
          formData.transmission
        )
      case 4: // Wheels & Tires - ANY field can be filled
        return !!(
          formData.wheel_size ||
          formData.front_tire_size ||
          formData.front_brakes
        )
      case 5: // Suspension & Chassis - ANY field can be filled
        return !!(
          formData.front_suspension ||
          formData.coilovers ||
          formData.sway_bars
        )
      case 6: // Exterior & Interior - ANY field can be filled
        return !!(
          formData.paint_color ||
          formData.body_kit ||
          formData.paint_type ||
          formData.wrap_color ||
          formData.carbon_fiber_parts ||
          formData.lighting
        )
      case 7: // Interior Details - ANY field can be filled
        return !!(
          formData.interior_color ||
          formData.interior_material ||
          formData.seats ||
          formData.steering_wheel ||
          formData.shift_knob ||
          formData.gauges
        )
      case 8: // Additional Details - ANY field can be filled
        return !!(
          formData.vin ||
          formData.mileage ||
          formData.fuel_economy ||
          formData.maintenance_history ||
          formData.modifications?.length ||
          formData.dyno_results ||
          formData.build_thread_url
        )
      case 9: // Photos & Social - ANY field can be filled
        return !!(
          formData.instagram_handle ||
          formData.youtube_channel ||
          formData.website_url
        )
      case 10: // Review & Submit
        return false // This step doesn't collect data
      default:
        return false
    }
  }

  const handleInputChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: string | string[] } }
  ) => {
    const { name, value } = e.target

    if (name === 'build_goals') {
      // Handle build_goals as a comma-separated array
      setFormData(prev => ({
        ...prev,
        [name]: Array.isArray(value) ? value : [value],
      }))
    } else if (name === 'modifications') {
      // Handle modifications as a comma-separated array
      setFormData(prev => ({
        ...prev,
        [name]: Array.isArray(value) ? value : [value],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className='space-y-8'>
      {/* Multi-Step Form */}
      <div className='bg-card shadow rounded-lg border border-border'>
        <div className='px-4 py-5 sm:p-6'>
          {/* Progress Bar */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-card-foreground'>
                {mode === 'create' ? 'Create Your Car' : 'Edit Car Details'}
              </h3>
              <span className='text-sm text-muted-foreground'>
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            <div className='w-full bg-muted rounded-full h-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300'
                style={{
                  width: `${(currentStep / STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className='flex justify-between mb-8'>
            {STEPS.map(step => (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep === step.id
                    ? 'text-primary'
                    : hasStepData(step.id)
                    ? 'text-purple-600'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : hasStepData(step.id)
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <span className='text-xs text-center'>{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <BasicInformationStep
                carData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {/* Step 2: Build Story */}
            {currentStep === 2 && (
              <BuildStoryStep
                carData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {/* Step 3: Engine & Performance */}
            {currentStep === 3 && (
              <EnginePerformanceStep
                carData={formData}
                onInputChange={handleInputChange}
                unitPreference={unitPreference}
              />
            )}

            {/* Step 4: Wheels & Tires */}
            {currentStep === 4 && (
              <WheelsTiresStep
                carData={formData}
                onInputChange={handleInputChange}
                unitPreference={unitPreference}
              />
            )}

            {/* Step 5: Suspension & Chassis */}
            {currentStep === 5 && (
              <SuspensionChassisStep
                carData={formData}
                onInputChange={handleInputChange}
                unitPreference={unitPreference}
              />
            )}

            {/* Step 6: Exterior & Interior */}
            {currentStep === 6 && (
              <ExteriorInteriorStep
                carData={formData}
                onInputChange={handleInputChange}
                unitPreference={unitPreference}
              />
            )}

            {/* Step 7: Interior Details */}
            {currentStep === 7 && (
              <InteriorStep
                carData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {/* Step 8: Additional Details */}
            {currentStep === 8 && (
              <AdditionalDetailsStep
                carData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {/* Step 9: Photos & Social */}
            {currentStep === 9 && (
              <PhotosSocialStep
                carData={formData}
                onInputChange={handleInputChange}
                unitPreference={unitPreference}
              />
            )}

            {/* Step 10: Review & Submit */}
            {currentStep === 10 && (
              <ReviewSubmitStep
                carData={formData}
                onInputChange={handleInputChange}
                unitPreference={unitPreference}
                mode={mode}
              />
            )}

            {/* Navigation Buttons */}
            <div className='flex justify-between mt-8 pt-6 border-t'>
              <button
                type='button'
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className='inline-flex items-center px-4 py-2 border border-input bg-background text-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              >
                <ChevronLeft className='w-4 h-4 mr-2' />
                Previous
              </button>

              <div className='flex space-x-2'>
                {currentStep < STEPS.length ? (
                  <button
                    type='button'
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className='inline-flex items-center px-4 py-2 border border-transparent bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer'
                  >
                    Next
                    <ChevronRight className='w-4 h-4 ml-2' />
                  </button>
                ) : (
                  <button
                    type='submit'
                    disabled={saving}
                    className='inline-flex items-center px-4 py-2 border border-transparent bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                  >
                    {saving ? (
                      <>
                        <Loader2 className='animate-spin -ml-1 mr-3 h-5 w-5' />
                        {mode === 'create' ? 'Creating...' : 'Saving...'}
                      </>
                    ) : mode === 'create' ? (
                      'Create Car'
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Photo Management Section - Show for both create and edit modes */}
      <div className='bg-card shadow rounded-lg border border-border'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg font-medium text-card-foreground mb-6'>
            Photos
          </h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Upload photos and add descriptions. You can categorize each photo by
            car part.
          </p>

          {/* Photo Upload Component */}
          <PhotoUpload
            carId={formData.id || 'temp'}
            onUploadComplete={
              onPhotoUploadComplete || (() => Promise.resolve())
            }
            onBatchUploadComplete={
              onBatchUploadComplete || (() => Promise.resolve())
            }
          />

          {/* Photo List */}
          {existingPhotos && existingPhotos.length > 0 && (
            <div className='mt-6'>
              <h4 className='text-md font-medium text-foreground mb-4'>
                Manage Photos ({existingPhotos.length})
              </h4>
              <SortablePhotoGallery
                key={existingPhotos.map(p => p.url).join(',')}
                photos={existingPhotos}
                onReorder={onPhotoReorder || (() => Promise.resolve())}
                onDelete={onDeletePhoto || (() => Promise.resolve())}
                onSetMain={onSetMainPhoto || (() => Promise.resolve())}
                mainPhotoUrl={mainPhotoUrl}
                onUpdateCategory={
                  onPhotoCategoryChange || (() => Promise.resolve())
                }
                onUpdateDescription={
                  onPhotoDescriptionChange
                    ? async (photoUrl: string, description: string) => {
                        const photoIndex = existingPhotos.findIndex(
                          p => p.url === photoUrl
                        )
                        if (photoIndex !== -1) {
                          await onPhotoDescriptionChange(
                            photoIndex,
                            description
                          )
                        }
                      }
                    : () => Promise.resolve()
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
