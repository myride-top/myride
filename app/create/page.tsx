'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  createCarClient,
  canUserCreateCarClient,
} from '@/lib/database/cars-client'
import PhotoUpload from '@/components/photos/photo-upload'
import PhotoCategoryMenu from '@/components/photos/photo-category-menu'
import ProtectedRoute from '@/components/auth/protected-route'
import Link from 'next/link'
import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import Navbar from '@/components/ui/navbar'
import { ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getUnitLabel } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'

export default function CreateCarPage() {
  const { user } = useAuth()
  const { unitPreference } = useUnitPreference()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<CarPhoto[]>([])
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [checkingLimit, setCheckingLimit] = useState(true)

  // Check if user can create a car on component mount
  useEffect(() => {
    const checkCarLimit = async () => {
      if (!user) {
        setCheckingLimit(false)
        return
      }

      try {
        const canCreate = await canUserCreateCarClient(user.id)
        if (!canCreate) {
          setShowLimitDialog(true)
        }
      } catch (error) {
        console.error('Error checking car limit:', error)
      } finally {
        setCheckingLimit(false)
      }
    }

    checkCarLimit()
  }, [user])

  const [carData, setCarData] = useState({
    name: '',
    url_slug: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    description: '',
    // Engine Specifications
    engine_displacement: '',
    engine_cylinders: '',
    engine_code: '',
    horsepower: '',
    torque: '',
    engine_type: '',
    fuel_type: '',
    transmission: '',
    drivetrain: '',
    // Performance Specifications
    zero_to_sixty: '',
    top_speed: '',
    quarter_mile: '',
    weight: '',
    power_to_weight: '',
    // Brake System
    front_brakes: '',
    rear_brakes: '',
    brake_rotors: '',
    brake_caliper_brand: '',
    brake_lines: '',
    // Suspension
    front_suspension: '',
    rear_suspension: '',
    suspension_type: '',
    ride_height: '',
    coilovers: '',
    sway_bars: '',
    // Wheels and Tires
    wheel_size: '',
    wheel_material: '',
    wheel_brand: '',
    wheel_offset: '',
    // Front Tires
    front_tire_size: '',
    front_tire_brand: '',
    front_tire_model: '',
    front_tire_pressure: '',
    // Rear Tires
    rear_tire_size: '',
    rear_tire_brand: '',
    rear_tire_model: '',
    rear_tire_pressure: '',
    // Exterior
    body_kit: '',
    paint_color: '',
    paint_type: '',
    wrap_color: '',
    carbon_fiber_parts: '',
    lighting: '',
    // Interior
    interior_color: '',
    interior_material: '',
    seats: '',
    steering_wheel: '',
    shift_knob: '',
    gauges: '',
    // Modifications
    modifications: [] as string[],
    dyno_results: '',
    // Additional Details
    vin: '',
    mileage: '',
    fuel_economy: '',
    maintenance_history: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setCarData(prev => ({
      ...prev,
      [name]:
        name === 'year' ? parseInt(value) || new Date().getFullYear() : value,
    }))
  }

  const handlePhotoUpload = (photo: CarPhoto) => {
    setPhotos(prev => [...prev, photo])
  }

  const handleBatchUploadComplete = (photos: CarPhoto[]) => {
    setPhotos(prev => [...prev, ...photos])
  }

  const handlePhotoCategoryChange = (
    photoIndex: number,
    newCategory: PhotoCategory
  ) => {
    setPhotos(prev => {
      const updated = [...prev]
      updated[photoIndex] = { ...updated[photoIndex], category: newCategory }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('User not found')
      setLoading(false)
      return
    }

    // Double-check car limit before submission
    try {
      const canCreate = await canUserCreateCarClient(user.id)
      if (!canCreate) {
        setShowLimitDialog(true)
        setLoading(false)
        return
      }
    } catch (error) {
      setError('Error checking car limit')
      setLoading(false)
      return
    }

    try {
      const newCar = await createCarClient(
        {
          user_id: user.id,
          name: carData.name,
          url_slug: carData.url_slug || '', // Let database auto-generate if empty
          make: carData.make,
          model: carData.model,
          year: carData.year,
          description: carData.description || null,
          photos: photos,
          main_photo_url: null, // Will be set later when user chooses main photo
          // Engine Specifications
          engine_displacement: carData.engine_displacement
            ? parseFloat(carData.engine_displacement)
            : null,
          engine_cylinders: carData.engine_cylinders
            ? parseInt(carData.engine_cylinders)
            : null,
          engine_code: carData.engine_code || null,
          horsepower: carData.horsepower ? parseInt(carData.horsepower) : null,
          torque: carData.torque ? parseFloat(carData.torque) : null,
          engine_type: carData.engine_type || null,
          fuel_type: carData.fuel_type || null,
          transmission: carData.transmission || null,
          drivetrain: carData.drivetrain || null,
          // Performance Specifications
          zero_to_sixty: carData.zero_to_sixty
            ? parseFloat(carData.zero_to_sixty)
            : null,
          top_speed: carData.top_speed ? parseFloat(carData.top_speed) : null,
          quarter_mile: carData.quarter_mile
            ? parseFloat(carData.quarter_mile)
            : null,
          weight: carData.weight ? parseFloat(carData.weight) : null,
          power_to_weight: carData.power_to_weight || null,
          // Brake System
          front_brakes: carData.front_brakes || null,
          rear_brakes: carData.rear_brakes || null,
          brake_rotors: carData.brake_rotors || null,
          brake_caliper_brand: carData.brake_caliper_brand || null,
          brake_lines: carData.brake_lines || null,
          // Suspension
          front_suspension: carData.front_suspension || null,
          rear_suspension: carData.rear_suspension || null,
          suspension_type: carData.suspension_type || null,
          ride_height: carData.ride_height || null,
          coilovers: carData.coilovers || null,
          sway_bars: carData.sway_bars || null,
          // Wheels and Tires
          wheel_size: carData.wheel_size || null,
          wheel_material: carData.wheel_material || null,
          wheel_brand: carData.wheel_brand || null,
          wheel_offset: carData.wheel_offset || null,
          // Front Tires
          front_tire_size: carData.front_tire_size || null,
          front_tire_brand: carData.front_tire_brand || null,
          front_tire_model: carData.front_tire_model || null,
          front_tire_pressure: carData.front_tire_pressure
            ? parseFloat(carData.front_tire_pressure)
            : null,
          // Rear Tires
          rear_tire_size: carData.rear_tire_size || null,
          rear_tire_brand: carData.rear_tire_brand || null,
          rear_tire_model: carData.rear_tire_model || null,
          rear_tire_pressure: carData.rear_tire_pressure
            ? parseFloat(carData.rear_tire_pressure)
            : null,
          // Exterior
          body_kit: carData.body_kit || null,
          paint_color: carData.paint_color || null,
          paint_type: carData.paint_type || null,
          wrap_color: carData.wrap_color || null,
          carbon_fiber_parts: carData.carbon_fiber_parts || null,
          lighting: carData.lighting || null,
          // Interior
          interior_color: carData.interior_color || null,
          interior_material: carData.interior_material || null,
          seats: carData.seats || null,
          steering_wheel: carData.steering_wheel || null,
          shift_knob: carData.shift_knob || null,
          gauges: carData.gauges || null,
          // Modifications
          modifications: carData.modifications || null,
          dyno_results: carData.dyno_results || null,
          // Additional Details
          vin: carData.vin || null,
          mileage: carData.mileage ? parseFloat(carData.mileage) : null,
          fuel_economy: carData.fuel_economy || null,
          maintenance_history: carData.maintenance_history || null,
        },
        unitPreference
      )

      if (newCar) {
        router.push('/dashboard')
      } else {
        setError('Failed to create car')
      }
    } catch (err) {
      setError('An error occurred while creating the car')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking car limit
  if (checkingLimit) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <Navbar />
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
            <div className='flex items-center justify-center'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                <p className='text-foreground'>Checking car limit...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <Navbar />

        {/* Page Header */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
          <div className='flex items-center'>
            <Link href='/dashboard' className='mr-4'>
              <ArrowLeft />
            </Link>
            <h1 className='text-3xl font-bold text-foreground'>Add New Car</h1>
          </div>
        </div>

        {/* Main Content */}
        <main className='max-w-3xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <div className='bg-card shadow rounded-lg border border-border'>
              <div className='px-4 py-5 sm:p-6'>
                <form onSubmit={handleSubmit} className='space-y-6' noValidate>
                  {/* Car Details */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-foreground'
                      >
                        Car Name *
                      </label>
                      <input
                        type='text'
                        id='name'
                        name='name'
                        value={carData.name}
                        onChange={handleInputChange}
                        required
                        className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
                        placeholder='e.g., My Daily Driver'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='url_slug'
                        className='block text-sm font-medium text-foreground'
                      >
                        URL Slug
                      </label>
                      <input
                        type='text'
                        id='url_slug'
                        name='url_slug'
                        value={carData.url_slug || ''}
                        onChange={handleInputChange}
                        className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
                        placeholder='Auto-generated from car name'
                      />
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Leave empty to auto-generate, or customize your own URL
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor='year'
                        className='block text-sm font-medium text-foreground'
                      >
                        Year *
                      </label>
                      <input
                        type='number'
                        id='year'
                        name='year'
                        value={carData.year}
                        onChange={handleInputChange}
                        required
                        min='1900'
                        max={new Date().getFullYear() + 1}
                        className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='make'
                        className='block text-sm font-medium text-foreground'
                      >
                        Make *
                      </label>
                      <input
                        type='text'
                        id='make'
                        name='make'
                        value={carData.make}
                        onChange={handleInputChange}
                        required
                        className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                        placeholder='e.g., Toyota'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='model'
                        className='block text-sm font-medium text-foreground'
                      >
                        Model *
                      </label>
                      <input
                        type='text'
                        id='model'
                        name='model'
                        value={carData.model}
                        onChange={handleInputChange}
                        required
                        className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                        placeholder='e.g., Camry'
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-foreground'
                    >
                      Description
                    </label>
                    <textarea
                      id='description'
                      name='description'
                      value={carData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
                      placeholder='Tell us about your car...'
                    />
                  </div>

                  {/* Engine Specifications */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-foreground mb-4'>
                      Engine
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='horsepower'
                          className='block text-sm font-medium text-foreground'
                        >
                          Horsepower
                        </label>
                        <input
                          type='number'
                          id='horsepower'
                          name='horsepower'
                          value={carData.horsepower}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 300'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='torque'
                          className='block text-sm font-medium text-foreground'
                        >
                          Torque ({getUnitLabel('torque', unitPreference)})
                        </label>
                        <input
                          type='number'
                          id='torque'
                          name='torque'
                          value={carData.torque}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder={
                            unitPreference === 'metric'
                              ? 'e.g., 475'
                              : 'e.g., 350'
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='engine_type'
                          className='block text-sm font-medium text-foreground'
                        >
                          Engine Type
                        </label>
                        <input
                          type='text'
                          id='engine_type'
                          name='engine_type'
                          value={carData.engine_type}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Turbocharged I4'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='transmission'
                          className='block text-sm font-medium text-foreground'
                        >
                          Transmission
                        </label>
                        <input
                          type='text'
                          id='transmission'
                          name='transmission'
                          value={carData.transmission}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 6-Speed Manual'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='engine_code'
                          className='block text-sm font-medium text-foreground'
                        >
                          Engine Code
                        </label>
                        <input
                          type='text'
                          id='engine_code'
                          name='engine_code'
                          value={carData.engine_code}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., B58, LS3, K20'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='drivetrain'
                          className='block text-sm font-medium text-foreground'
                        >
                          Drivetrain
                        </label>
                        <input
                          type='text'
                          id='drivetrain'
                          name='drivetrain'
                          value={carData.drivetrain}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., AWD, RWD, FWD'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='engine_displacement'
                          className='block text-sm font-medium text-foreground'
                        >
                          Engine Displacement (L)
                        </label>
                        <input
                          type='number'
                          step='0.1'
                          id='engine_displacement'
                          name='engine_displacement'
                          value={carData.engine_displacement}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 2.0'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='engine_cylinders'
                          className='block text-sm font-medium text-foreground'
                        >
                          Engine Cylinders
                        </label>
                        <input
                          type='number'
                          id='engine_cylinders'
                          name='engine_cylinders'
                          value={carData.engine_cylinders}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 4'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='fuel_type'
                          className='block text-sm font-medium text-foreground'
                        >
                          Fuel Type
                        </label>
                        <input
                          type='text'
                          id='fuel_type'
                          name='fuel_type'
                          value={carData.fuel_type}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Gasoline, Diesel, Electric'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wheels & Tires */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Wheels & Tires
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='wheel_size'
                          className='block text-sm font-medium text-foreground'
                        >
                          Wheel Size
                        </label>
                        <input
                          type='text'
                          id='wheel_size'
                          name='wheel_size'
                          value={carData.wheel_size}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 18x8.5'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='wheel_brand'
                          className='block text-sm font-medium text-foreground'
                        >
                          Wheel Brand
                        </label>
                        <input
                          type='text'
                          id='wheel_brand'
                          name='wheel_brand'
                          value={carData.wheel_brand}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., BBS'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='wheel_material'
                          className='block text-sm font-medium text-foreground'
                        >
                          Wheel Material
                        </label>
                        <input
                          type='text'
                          id='wheel_material'
                          name='wheel_material'
                          value={carData.wheel_material}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Forged Aluminum'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='wheel_offset'
                          className='block text-sm font-medium text-foreground'
                        >
                          Wheel Offset
                        </label>
                        <input
                          type='text'
                          id='wheel_offset'
                          name='wheel_offset'
                          value={carData.wheel_offset}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., +35'
                        />
                      </div>

                      {/* Front Tire Specifications */}
                      <div className='md:col-span-2'>
                        <h5 className='text-md font-medium text-gray-800 mb-3 border-b pb-2'>
                          Front Tires
                        </h5>
                      </div>
                      <div>
                        <label
                          htmlFor='front_tire_size'
                          className='block text-sm font-medium text-foreground'
                        >
                          Front Tire Size
                        </label>
                        <input
                          type='text'
                          id='front_tire_size'
                          name='front_tire_size'
                          value={carData.front_tire_size}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 225/40R18'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='front_tire_brand'
                          className='block text-sm font-medium text-foreground'
                        >
                          Front Tire Brand
                        </label>
                        <input
                          type='text'
                          id='front_tire_brand'
                          name='front_tire_brand'
                          value={carData.front_tire_brand}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Michelin'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='front_tire_model'
                          className='block text-sm font-medium text-foreground'
                        >
                          Front Tire Model
                        </label>
                        <input
                          type='text'
                          id='front_tire_model'
                          name='front_tire_model'
                          value={carData.front_tire_model}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Pilot Sport 4S'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='front_tire_pressure'
                          className='block text-sm font-medium text-foreground'
                        >
                          Front Tire Pressure (
                          {getUnitLabel('pressure', unitPreference)})
                        </label>
                        <input
                          type='number'
                          step='0.1'
                          id='front_tire_pressure'
                          name='front_tire_pressure'
                          value={carData.front_tire_pressure}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder={
                            unitPreference === 'metric'
                              ? 'e.g., 2.2'
                              : 'e.g., 32'
                          }
                        />
                      </div>

                      {/* Rear Tire Specifications */}
                      <div className='md:col-span-2'>
                        <h5 className='text-md font-medium text-gray-800 mb-3 border-b pb-2'>
                          Rear Tires
                        </h5>
                      </div>
                      <div>
                        <label
                          htmlFor='rear_tire_size'
                          className='block text-sm font-medium text-foreground'
                        >
                          Rear Tire Size
                        </label>
                        <input
                          type='text'
                          id='rear_tire_size'
                          name='rear_tire_size'
                          value={carData.rear_tire_size}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 255/40R18'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='rear_tire_brand'
                          className='block text-sm font-medium text-foreground'
                        >
                          Rear Tire Brand
                        </label>
                        <input
                          type='text'
                          id='rear_tire_brand'
                          name='rear_tire_brand'
                          value={carData.rear_tire_brand}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Michelin'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='rear_tire_model'
                          className='block text-sm font-medium text-foreground'
                        >
                          Rear Tire Model
                        </label>
                        <input
                          type='text'
                          id='rear_tire_model'
                          name='rear_tire_model'
                          value={carData.rear_tire_model}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Pilot Sport 4S'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='rear_tire_pressure'
                          className='block text-sm font-medium text-foreground'
                        >
                          Rear Tire Pressure (
                          {getUnitLabel('pressure', unitPreference)})
                        </label>
                        <input
                          type='number'
                          step='0.1'
                          id='rear_tire_pressure'
                          name='rear_tire_pressure'
                          value={carData.rear_tire_pressure}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder={
                            unitPreference === 'metric'
                              ? 'e.g., 2.1'
                              : 'e.g., 30'
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brakes & Suspension */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Brakes & Suspension
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='front_brakes'
                          className='block text-sm font-medium text-foreground'
                        >
                          Front Brakes
                        </label>
                        <input
                          type='text'
                          id='front_brakes'
                          name='front_brakes'
                          value={carData.front_brakes}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Brembo 4-Piston'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='suspension_type'
                          className='block text-sm font-medium text-foreground'
                        >
                          Suspension Type
                        </label>
                        <input
                          type='text'
                          id='suspension_type'
                          name='suspension_type'
                          value={carData.suspension_type}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Coilovers'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='rear_brakes'
                          className='block text-sm font-medium text-foreground'
                        >
                          Rear Brakes
                        </label>
                        <input
                          type='text'
                          id='rear_brakes'
                          name='rear_brakes'
                          value={carData.rear_brakes}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Brembo 2-Piston'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='brake_rotors'
                          className='block text-sm font-medium text-foreground'
                        >
                          Brake Rotors
                        </label>
                        <input
                          type='text'
                          id='brake_rotors'
                          name='brake_rotors'
                          value={carData.brake_rotors}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Slotted & Drilled'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='brake_caliper_brand'
                          className='block text-sm font-medium text-foreground'
                        >
                          Brake Caliper Brand
                        </label>
                        <input
                          type='text'
                          id='brake_caliper_brand'
                          name='brake_caliper_brand'
                          value={carData.brake_caliper_brand}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Brembo, AP Racing'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='brake_lines'
                          className='block text-sm font-medium text-foreground'
                        >
                          Brake Lines
                        </label>
                        <input
                          type='text'
                          id='brake_lines'
                          name='brake_lines'
                          value={carData.brake_lines}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Stainless Steel Braided'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='front_suspension'
                          className='block text-sm font-medium text-foreground'
                        >
                          Front Suspension
                        </label>
                        <input
                          type='text'
                          id='front_suspension'
                          name='front_suspension'
                          value={carData.front_suspension}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., MacPherson Strut'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='rear_suspension'
                          className='block text-sm font-medium text-foreground'
                        >
                          Rear Suspension
                        </label>
                        <input
                          type='text'
                          id='rear_suspension'
                          name='rear_suspension'
                          value={carData.rear_suspension}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Multi-Link'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='ride_height'
                          className='block text-sm font-medium text-foreground'
                        >
                          Ride Height
                        </label>
                        <input
                          type='text'
                          id='ride_height'
                          name='ride_height'
                          value={carData.ride_height}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Lowered 2 inches'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='coilovers'
                          className='block text-sm font-medium text-foreground'
                        >
                          Coilovers
                        </label>
                        <input
                          type='text'
                          id='coilovers'
                          name='coilovers'
                          value={carData.coilovers}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., KW Variant 3'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='sway_bars'
                          className='block text-sm font-medium text-foreground'
                        >
                          Sway Bars
                        </label>
                        <input
                          type='text'
                          id='sway_bars'
                          name='sway_bars'
                          value={carData.sway_bars}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., H&R 24mm Front, 22mm Rear'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Exterior */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Exterior
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='body_kit'
                          className='block text-sm font-medium text-foreground'
                        >
                          Body Kit
                        </label>
                        <input
                          type='text'
                          id='body_kit'
                          name='body_kit'
                          value={carData.body_kit}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Rocket Bunny, Liberty Walk'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='paint_color'
                          className='block text-sm font-medium text-foreground'
                        >
                          Paint Color
                        </label>
                        <input
                          type='text'
                          id='paint_color'
                          name='paint_color'
                          value={carData.paint_color}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Championship White'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='paint_type'
                          className='block text-sm font-medium text-foreground'
                        >
                          Paint Type
                        </label>
                        <input
                          type='text'
                          id='paint_type'
                          name='paint_type'
                          value={carData.paint_type}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Pearl, Matte, Metallic'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='wrap_color'
                          className='block text-sm font-medium text-foreground'
                        >
                          Wrap Color
                        </label>
                        <input
                          type='text'
                          id='wrap_color'
                          name='wrap_color'
                          value={carData.wrap_color}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Satin Black, Glossy Red'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='carbon_fiber_parts'
                          className='block text-sm font-medium text-foreground'
                        >
                          Carbon Fiber Parts
                        </label>
                        <input
                          type='text'
                          id='carbon_fiber_parts'
                          name='carbon_fiber_parts'
                          value={carData.carbon_fiber_parts}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Hood, Trunk, Fenders'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='lighting'
                          className='block text-sm font-medium text-foreground'
                        >
                          Lighting
                        </label>
                        <input
                          type='text'
                          id='lighting'
                          name='lighting'
                          value={carData.lighting}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., LED Headlights, Underglow'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interior */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Interior
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='interior_color'
                          className='block text-sm font-medium text-foreground'
                        >
                          Interior Color
                        </label>
                        <input
                          type='text'
                          id='interior_color'
                          name='interior_color'
                          value={carData.interior_color}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Black, Tan, Red'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='interior_material'
                          className='block text-sm font-medium text-foreground'
                        >
                          Interior Material
                        </label>
                        <input
                          type='text'
                          id='interior_material'
                          name='interior_material'
                          value={carData.interior_material}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Leather, Alcantara, Cloth'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='seats'
                          className='block text-sm font-medium text-foreground'
                        >
                          Seats
                        </label>
                        <input
                          type='text'
                          id='seats'
                          name='seats'
                          value={carData.seats}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., Recaro Sport Seats'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='steering_wheel'
                          className='block text-sm font-medium text-foreground'
                        >
                          Steering Wheel
                        </label>
                        <input
                          type='text'
                          id='steering_wheel'
                          name='steering_wheel'
                          value={carData.steering_wheel}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., MOMO Racing Wheel'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='shift_knob'
                          className='block text-sm font-medium text-foreground'
                        >
                          Shift Knob
                        </label>
                        <input
                          type='text'
                          id='shift_knob'
                          name='shift_knob'
                          value={carData.shift_knob}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., MOMO Aluminum'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='gauges'
                          className='block text-sm font-medium text-foreground'
                        >
                          Gauges
                        </label>
                        <input
                          type='text'
                          id='gauges'
                          name='gauges'
                          value={carData.gauges}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., AEM Wideband, Boost Gauge'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Performance Specifications */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Performance
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='zero_to_sixty'
                          className='block text-sm font-medium text-foreground'
                        >
                          {unitPreference === 'metric'
                            ? '0-100 km/h'
                            : '0-60 mph'}{' '}
                          Time (seconds)
                        </label>
                        <input
                          type='number'
                          step='0.1'
                          id='zero_to_sixty'
                          name='zero_to_sixty'
                          value={carData.zero_to_sixty}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 4.2'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='top_speed'
                          className='block text-sm font-medium text-foreground'
                        >
                          Top Speed ({getUnitLabel('speed', unitPreference)})
                        </label>
                        <input
                          type='number'
                          id='top_speed'
                          name='top_speed'
                          value={carData.top_speed}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder={
                            unitPreference === 'metric'
                              ? 'e.g., 250'
                              : 'e.g., 155'
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='quarter_mile'
                          className='block text-sm font-medium text-foreground'
                        >
                          0-400m (seconds)
                        </label>
                        <input
                          type='number'
                          step='0.1'
                          id='quarter_mile'
                          name='quarter_mile'
                          value={carData.quarter_mile}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 12.5'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='weight'
                          className='block text-sm font-medium text-foreground'
                        >
                          Weight ({getUnitLabel('weight', unitPreference)})
                        </label>
                        <input
                          type='number'
                          id='weight'
                          name='weight'
                          value={carData.weight}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder={
                            unitPreference === 'metric'
                              ? 'e.g., 1588'
                              : 'e.g., 3500'
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='power_to_weight'
                          className='block text-sm font-medium text-foreground'
                        >
                          Power to Weight Ratio
                        </label>
                        <input
                          type='text'
                          id='power_to_weight'
                          name='power_to_weight'
                          value={carData.power_to_weight}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 4.6 kg/hp'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modifications */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Modifications & Dyno
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='dyno_results'
                          className='block text-sm font-medium text-foreground'
                        >
                          Dyno Results
                        </label>
                        <input
                          type='text'
                          id='dyno_results'
                          name='dyno_results'
                          value={carData.dyno_results}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 350 WHP, 380 WTQ'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='modifications'
                          className='block text-sm font-medium text-foreground'
                        >
                          Modifications List
                        </label>
                        <textarea
                          id='modifications'
                          name='modifications'
                          value={carData.modifications.join(', ')}
                          onChange={e => {
                            const mods = e.target.value
                              .split(',')
                              .map(m => m.trim())
                              .filter(m => m)
                            setCarData(prev => ({
                              ...prev,
                              modifications: mods,
                            }))
                          }}
                          rows={3}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='List modifications separated by commas (e.g., Cold Air Intake, Exhaust, Tune)'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className='border-t pt-6'>
                    <h4 className='text-lg font-medium text-card-foreground mb-4'>
                      Additional Details
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='vin'
                          className='block text-sm font-medium text-foreground'
                        >
                          VIN
                        </label>
                        <input
                          type='text'
                          id='vin'
                          name='vin'
                          value={carData.vin}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='Vehicle Identification Number'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='mileage'
                          className='block text-sm font-medium text-foreground'
                        >
                          Mileage ({getUnitLabel('distance', unitPreference)})
                        </label>
                        <input
                          type='number'
                          id='mileage'
                          name='mileage'
                          value={carData.mileage}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder={
                            unitPreference === 'metric'
                              ? 'e.g., 80000'
                              : 'e.g., 50000'
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='fuel_economy'
                          className='block text-sm font-medium text-foreground'
                        >
                          Fuel Economy
                        </label>
                        <input
                          type='text'
                          id='fuel_economy'
                          name='fuel_economy'
                          value={carData.fuel_economy}
                          onChange={handleInputChange}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='e.g., 9.4 L/100km City, 7.4 L/100km Highway'
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='maintenance_history'
                          className='block text-sm font-medium text-foreground'
                        >
                          Maintenance History
                        </label>
                        <textarea
                          id='maintenance_history'
                          name='maintenance_history'
                          value={carData.maintenance_history}
                          onChange={handleInputChange}
                          rows={3}
                          className='mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring'
                          placeholder='Recent maintenance, modifications, etc.'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-4'>
                      Photos
                    </label>
                    <p className='text-sm text-gray-600 mb-4'>
                      Upload photos of your car first, then optionally
                      categorize them by part (engine, wheels, exterior, etc.).
                      You can select multiple files at once, and categorize each
                      photo individually after upload.
                    </p>
                    {photos.length > 0 && (
                      <div className='mb-4'>
                        <p className='text-sm text-gray-600 mb-2'>
                          Uploaded photos ({photos.length})
                        </p>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {photos.map((photo, index) => (
                            <div
                              key={index}
                              className='relative group overflow-hidden rounded-md'
                            >
                              <img
                                src={
                                  typeof photo === 'string' ? photo : photo.url
                                }
                                alt={`Car photo ${index + 1}`}
                                className='w-full h-32 object-cover'
                              />

                              {/* Category Selection Menu */}
                              <div className='absolute top-2 left-2'>
                                {typeof photo === 'string' ? (
                                  <div className='bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
                                    other
                                  </div>
                                ) : (
                                  <PhotoCategoryMenu
                                    currentCategory={
                                      photo.category as PhotoCategory
                                    }
                                    onCategoryChange={category =>
                                      handlePhotoCategoryChange(index, category)
                                    }
                                  />
                                )}
                              </div>

                              <button
                                type='button'
                                onClick={() =>
                                  setPhotos(prev =>
                                    prev.filter((_, i) => i !== index)
                                  )
                                }
                                className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 cursor-pointer'
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <PhotoUpload
                      carId='temp'
                      onUploadComplete={handlePhotoUpload}
                      onBatchUploadComplete={handleBatchUploadComplete}
                    />
                  </div>

                  {error && <div className='text-red-600 text-sm'>{error}</div>}

                  <div className='flex justify-end space-x-4'>
                    <Link
                      href='/dashboard'
                      className='px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-accent focus:ring-2 focus:ring-offset-2 focus:ring-ring'
                    >
                      Cancel
                    </Link>
                    <button
                      type='submit'
                      disabled={loading}
                      className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 cursor-pointer'
                    >
                      {loading ? 'Creating...' : 'Create Car'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Car Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Car Limit Reached</DialogTitle>
            <DialogDescription>
              You have already reached the maximum limit of 1 car per user. To
              add a new car, you&apos;ll need to delete your existing car first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link
              href='/dashboard'
              className='px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-accent focus:ring-2 focus:ring-offset-2 focus:ring-ring'
            >
              Go to Dashboard
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
