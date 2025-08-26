'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  getCarByUrlSlugAndUsernameClient,
  updateCarClient,
  deleteCarClient,
  setMainPhoto,
} from '@/lib/database/cars-client'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { Car, CarPhoto, PhotoCategory } from '@/lib/types/database'
import ProtectedRoute from '@/components/auth/protected-route'
import PhotoUpload from '@/components/photos/photo-upload'
import PhotoCategoryMenu from '@/components/photos/photo-category-menu'
import { toast } from 'sonner'
import { ArrowLeft, Star, X, Loader2, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/ui/navbar'

export default function EditCarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const carId = params.car as string

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url_slug: '',
    make: '',
    model: '',
    year: '',
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

  useEffect(() => {
    const loadCar = async () => {
      if (carId && user) {
        try {
          const carData = await getCarByUrlSlugAndUsernameClient(
            carId,
            params.username as string
          )
          if (carData) {
            // Check if the car belongs to the current user
            if (carData.user_id !== user.id) {
              setError('You do not have permission to edit this car')
              setLoading(false)
              return
            }

            // Migrate old photo format to new format if needed
            if (carData.photos && carData.photos.length > 0) {
              const migratedPhotos = carData.photos.map((photo, index) => {
                if (typeof photo === 'string') {
                  // Convert old string format to new CarPhoto format
                  return {
                    url: photo,
                    category: 'other' as PhotoCategory,
                    description: '',
                    order: index,
                  }
                }
                return photo
              })

              // Update the car data with migrated photos
              carData.photos = migratedPhotos

              // Save migrated photos to database
              try {
                const updatedCar = await updateCarClient(carData.id, {
                  photos: migratedPhotos,
                })
                if (updatedCar) {
                  carData.photos = updatedCar.photos
                }
              } catch (error) {
                console.error('Error migrating photos:', error)
                // Continue with local migration even if database update fails
              }
            }

            setCar(carData)
            setFormData({
              name: carData.name || '',
              url_slug: carData.url_slug || '',
              make: carData.make || '',
              model: carData.model || '',
              year: carData.year?.toString() || '',
              description: carData.description || '',
              // Engine Specifications
              engine_displacement:
                carData.engine_displacement?.toString() || '',
              engine_cylinders: carData.engine_cylinders?.toString() || '',
              engine_code: carData.engine_code || '',
              horsepower: carData.horsepower?.toString() || '',
              torque: carData.torque?.toString() || '',
              engine_type: carData.engine_type || '',
              fuel_type: carData.fuel_type || '',
              transmission: carData.transmission || '',
              drivetrain: carData.drivetrain || '',
              // Performance Specifications
              zero_to_sixty: carData.zero_to_sixty?.toString() || '',
              top_speed: carData.top_speed?.toString() || '',
              quarter_mile: carData.quarter_mile?.toString() || '',
              weight: carData.weight?.toString() || '',
              power_to_weight: carData.power_to_weight || '',
              // Brake System
              front_brakes: carData.front_brakes || '',
              rear_brakes: carData.rear_brakes || '',
              brake_rotors: carData.brake_rotors || '',
              brake_caliper_brand: carData.brake_caliper_brand || '',
              brake_lines: carData.brake_lines || '',
              // Suspension
              front_suspension: carData.front_suspension || '',
              rear_suspension: carData.rear_suspension || '',
              suspension_type: carData.suspension_type || '',
              ride_height: carData.ride_height || '',
              coilovers: carData.coilovers || '',
              sway_bars: carData.sway_bars || '',
              // Wheels and Tires
              wheel_size: carData.wheel_size || '',
              wheel_material: carData.wheel_material || '',
              wheel_brand: carData.wheel_brand || '',
              wheel_offset: carData.wheel_offset || '',
              // Front Tires
              front_tire_size: carData.front_tire_size || '',
              front_tire_brand: carData.front_tire_brand || '',
              front_tire_model: carData.front_tire_model || '',
              front_tire_pressure:
                carData.front_tire_pressure?.toString() || '',
              // Rear Tires
              rear_tire_size: carData.rear_tire_size || '',
              rear_tire_brand: carData.rear_tire_brand || '',
              rear_tire_model: carData.rear_tire_model || '',
              rear_tire_pressure: carData.rear_tire_pressure?.toString() || '',
              // Exterior
              body_kit: carData.body_kit || '',
              paint_color: carData.paint_color || '',
              paint_type: carData.paint_type || '',
              wrap_color: carData.wrap_color || '',
              carbon_fiber_parts: carData.carbon_fiber_parts || '',
              lighting: carData.lighting || '',
              // Interior
              interior_color: carData.interior_color || '',
              interior_material: carData.interior_material || '',
              seats: carData.seats || '',
              steering_wheel: carData.steering_wheel || '',
              shift_knob: carData.shift_knob || '',
              gauges: carData.gauges || '',
              // Modifications
              modifications: carData.modifications || [],
              dyno_results: carData.dyno_results || '',
              // Additional Details
              vin: carData.vin || '',
              mileage: carData.mileage?.toString() || '',
              fuel_economy: carData.fuel_economy || '',
              maintenance_history: carData.maintenance_history || '',
            })
          } else {
            setError('Car not found')
          }
        } catch (error) {
          console.error('Error loading car:', error)
          setError('Failed to load car')
        } finally {
          setLoading(false)
        }
      }
    }

    loadCar()
  }, [carId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!car || !user) {
      setError('Car or user not found')
      setSaving(false)
      return
    }

    try {
      const updatedCar = await updateCarClient(car.id, {
        name: formData.name,
        url_slug: formData.url_slug || '', // Let database auto-generate if empty
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        description: formData.description || null,
        photos: car.photos || [], // Include the current photos array
        // Engine Specifications
        engine_displacement: formData.engine_displacement
          ? parseFloat(formData.engine_displacement)
          : null,
        engine_cylinders: formData.engine_cylinders
          ? parseInt(formData.engine_cylinders)
          : null,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
        torque: formData.torque ? parseInt(formData.torque) : null,
        engine_type: formData.engine_type || null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        // Performance Specifications
        zero_to_sixty: formData.zero_to_sixty
          ? parseFloat(formData.zero_to_sixty)
          : null,
        top_speed: formData.top_speed ? parseInt(formData.top_speed) : null,
        quarter_mile: formData.quarter_mile
          ? parseFloat(formData.quarter_mile)
          : null,
        // Brake System
        front_brakes: formData.front_brakes || null,
        rear_brakes: formData.rear_brakes || null,
        brake_rotors: formData.brake_rotors || null,
        // Suspension
        front_suspension: formData.front_suspension || null,
        rear_suspension: formData.rear_suspension || null,
        suspension_type: formData.suspension_type || null,
        ride_height: formData.ride_height || null,
        // Wheels and Tires
        wheel_size: formData.wheel_size || null,
        wheel_material: formData.wheel_material || null,
        wheel_brand: formData.wheel_brand || null,
        wheel_offset: formData.wheel_offset || null,
        // Front Tires
        front_tire_size: formData.front_tire_size || null,
        front_tire_brand: formData.front_tire_brand || null,
        front_tire_model: formData.front_tire_model || null,
        front_tire_pressure: formData.front_tire_pressure
          ? parseInt(formData.front_tire_pressure)
          : null,
        // Rear Tires
        rear_tire_size: formData.rear_tire_size || null,
        rear_tire_brand: formData.rear_tire_brand || null,
        rear_tire_model: formData.rear_tire_model || null,
        rear_tire_pressure: formData.rear_tire_pressure
          ? parseInt(formData.rear_tire_pressure)
          : null,
        // Exterior
        body_kit: formData.body_kit || null,
        paint_color: formData.paint_color || null,
        paint_type: formData.paint_type || null,
        // Interior
        interior_color: formData.interior_color || null,
        interior_material: formData.interior_material || null,
        seats: formData.seats || null,
        // Modifications
        modifications: formData.modifications || null,
        dyno_results: formData.dyno_results || null,
      })

      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Car updated successfully!')
      } else {
        setError('Failed to update car')
      }
    } catch (error) {
      console.error('Error updating car:', error)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!car || !user) {
      setError('Car or user not found')
      return
    }

    if (
      !confirm(
        'Are you sure you want to delete this car? This action cannot be undone.'
      )
    ) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const success = await deleteCarClient(car.id)
      if (success) {
        // Get user profile to redirect to the correct URL
        const profile = await getProfileByUserIdClient(user.id)
        if (profile) {
          router.push(`/${profile.username}`)
        } else {
          router.push('/dashboard')
        }
      } else {
        setError('Failed to delete car')
      }
    } catch (error) {
      console.error('Error deleting car:', error)
      setError('An unexpected error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoUploadComplete = async (photo: CarPhoto) => {
    if (car) {
      const updatedPhotos = [...(car.photos || []), photo]

      // Immediately save to database to ensure persistence
      try {
        const updatedCar = await updateCarClient(car.id, {
          photos: updatedPhotos,
        })

        if (updatedCar) {
          setCar(updatedCar)
          toast.success('Photo uploaded and saved!')
        } else {
          setError('Failed to save photo to database')
        }
      } catch (error) {
        console.error('Error saving photo to database:', error)
        setError('Failed to save photo to database')
      }
    }
  }

  const handleBatchUploadComplete = async (photos: CarPhoto[]) => {
    if (car) {
      const updatedPhotos = [...(car.photos || []), ...photos]

      // Save all photos to the database at once
      try {
        const updatedCar = await updateCarClient(car.id, {
          photos: updatedPhotos,
        })

        if (updatedCar) {
          setCar(updatedCar)
          toast.success(`${photos.length} photo(s) saved successfully!`)
        } else {
          setError('Failed to save photos to database')
        }
      } catch (error) {
        console.error('Error saving photos to database:', error)
        setError('Failed to save photos to database')
      }
    }
  }

  const handlePhotoCategoryChange = async (
    photoIndex: number,
    newCategory: PhotoCategory
  ) => {
    console.log('handlePhotoCategoryChange called:', {
      photoIndex,
      newCategory,
    })

    if (car && car.photos) {
      const updatedPhotos = [...car.photos]
      if (typeof updatedPhotos[photoIndex] === 'object') {
        ;(updatedPhotos[photoIndex] as CarPhoto).category = newCategory

        try {
          const updatedCar = await updateCarClient(car.id, {
            photos: updatedPhotos,
          })

          if (updatedCar) {
            setCar(updatedCar)
            toast.success('Photo category updated!')
          }
        } catch (error) {
          console.error('Error updating photo category:', error)
          toast.error('Failed to update photo category')
        }
      }
    }
  }

  const handleSetMainPhoto = async (photoUrl: string) => {
    if (!car) return

    try {
      const updatedCar = await setMainPhoto(car.id, photoUrl)
      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Main photo set successfully!')
      } else {
        toast.error('Failed to set main photo')
      }
    } catch (error) {
      console.error('Error setting main photo:', error)
      toast.error('Failed to set main photo')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading car...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error && !car) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-red-600 mb-4'>
              <AlertTriangle className='w-16 h-16 mx-auto' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Error</h2>
            <p className='text-gray-600 mb-4'>{error}</p>
            <button
              onClick={() => router.back()}
              className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <Navbar />

        {/* Page Header */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <button
                onClick={() => router.back()}
                className='mr-4 text-gray-600 hover:text-gray-900 cursor-pointer'
              >
                <ArrowLeft className='w-6 h-6' />
              </button>
              <h1 className='text-3xl font-bold text-gray-900'>Edit Car</h1>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50'
            >
              {deleting ? 'Deleting...' : 'Delete Car'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className='max-w-4xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            {/* Error Messages */}
            {error && (
              <div className='mb-6 rounded-md bg-red-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <AlertTriangle className='h-5 w-5 text-red-400' />
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-800'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Car Details Form */}
              <div className='bg-white shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg font-medium text-gray-900 mb-6'>
                    Car Details
                  </h3>
                  <form
                    onSubmit={handleSubmit}
                    className='space-y-6'
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Car Name
                      </label>
                      <input
                        type='text'
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        placeholder='e.g., My Daily Driver'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='url_slug'
                        className='block text-sm font-medium text-gray-700'
                      >
                        URL Slug
                      </label>
                      <input
                        type='text'
                        id='url_slug'
                        name='url_slug'
                        value={formData.url_slug || ''}
                        onChange={handleInputChange}
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        placeholder='Custom URL for your car'
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        Customize your car's URL or leave empty for
                        auto-generation
                      </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          htmlFor='make'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Make
                        </label>
                        <input
                          type='text'
                          id='make'
                          name='make'
                          value={formData.make}
                          onChange={handleInputChange}
                          required
                          className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                          placeholder='e.g., Toyota'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='model'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Model
                        </label>
                        <input
                          type='text'
                          id='model'
                          name='model'
                          value={formData.model}
                          onChange={handleInputChange}
                          required
                          className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                          placeholder='e.g., Camry'
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor='year'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Year
                      </label>
                      <input
                        type='number'
                        id='year'
                        name='year'
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        min='1900'
                        max={new Date().getFullYear() + 1}
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        placeholder='e.g., 2020'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='description'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Description
                      </label>
                      <textarea
                        id='description'
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        placeholder='Tell us about your car...'
                      />
                    </div>

                    {/* Engine Specifications */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Engine & Performance
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='horsepower'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Horsepower
                          </label>
                          <input
                            type='number'
                            id='horsepower'
                            name='horsepower'
                            value={formData.horsepower}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 300'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='torque'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Torque (lb-ft)
                          </label>
                          <input
                            type='number'
                            id='torque'
                            name='torque'
                            value={formData.torque}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 350'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='engine_type'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Engine Type
                          </label>
                          <input
                            type='text'
                            id='engine_type'
                            name='engine_type'
                            value={formData.engine_type}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Turbocharged I4'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='transmission'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Transmission
                          </label>
                          <input
                            type='text'
                            id='transmission'
                            name='transmission'
                            value={formData.transmission}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 6-Speed Manual'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Engine Specifications */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Engine & Performance
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='engine_displacement'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Engine Displacement (L)
                          </label>
                          <input
                            type='number'
                            step='0.1'
                            id='engine_displacement'
                            name='engine_displacement'
                            value={formData.engine_displacement}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 2.0'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='engine_cylinders'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Engine Cylinders
                          </label>
                          <input
                            type='number'
                            id='engine_cylinders'
                            name='engine_cylinders'
                            value={formData.engine_cylinders}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 4'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='engine_code'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Engine Code
                          </label>
                          <input
                            type='text'
                            id='engine_code'
                            name='engine_code'
                            value={formData.engine_code}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., B58, LS3, K20'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='horsepower'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Horsepower
                          </label>
                          <input
                            type='number'
                            id='horsepower'
                            name='horsepower'
                            value={formData.horsepower}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 300'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='torque'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Torque (lb-ft)
                          </label>
                          <input
                            type='number'
                            id='torque'
                            name='torque'
                            value={formData.torque}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 350'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='engine_type'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Engine Type
                          </label>
                          <input
                            type='text'
                            id='engine_type'
                            name='engine_type'
                            value={formData.engine_type}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Turbocharged I4'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='fuel_type'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Fuel Type
                          </label>
                          <input
                            type='text'
                            id='fuel_type'
                            name='fuel_type'
                            value={formData.fuel_type}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Gasoline, Diesel, Electric'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='drivetrain'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Drivetrain
                          </label>
                          <input
                            type='text'
                            id='drivetrain'
                            name='drivetrain'
                            value={formData.drivetrain}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., AWD, RWD, FWD'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Performance Specifications */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Performance
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='zero_to_sixty'
                            className='block text-sm font-medium text-gray-700'
                          >
                            0-60 Time (seconds)
                          </label>
                          <input
                            type='number'
                            step='0.1'
                            id='zero_to_sixty'
                            name='zero_to_sixty'
                            value={formData.zero_to_sixty}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 4.2'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='top_speed'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Top Speed (mph)
                          </label>
                          <input
                            type='number'
                            id='top_speed'
                            name='top_speed'
                            value={formData.top_speed}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 155'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='quarter_mile'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Quarter Mile (seconds)
                          </label>
                          <input
                            type='number'
                            step='0.1'
                            id='quarter_mile'
                            name='quarter_mile'
                            value={formData.quarter_mile}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 12.5'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='weight'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Weight (lbs)
                          </label>
                          <input
                            type='number'
                            id='weight'
                            name='weight'
                            value={formData.weight}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 3500'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='power_to_weight'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Power to Weight Ratio
                          </label>
                          <input
                            type='text'
                            id='power_to_weight'
                            name='power_to_weight'
                            value={formData.power_to_weight}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 10.2 lbs/hp'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Wheels & Tires */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Wheels & Tires
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='wheel_size'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Wheel Size
                          </label>
                          <input
                            type='text'
                            id='wheel_size'
                            name='wheel_size'
                            value={formData.wheel_size}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 18x8.5'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='wheel_brand'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Wheel Brand
                          </label>
                          <input
                            type='text'
                            id='wheel_brand'
                            name='wheel_brand'
                            value={formData.wheel_brand}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., BBS'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='wheel_material'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Wheel Material
                          </label>
                          <input
                            type='text'
                            id='wheel_material'
                            name='wheel_material'
                            value={formData.wheel_material}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Forged Aluminum'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='wheel_offset'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Wheel Offset
                          </label>
                          <input
                            type='text'
                            id='wheel_offset'
                            name='wheel_offset'
                            value={formData.wheel_offset}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., +35'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='front_tire_size'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Front Tire Size
                          </label>
                          <input
                            type='text'
                            id='front_tire_size'
                            name='front_tire_size'
                            value={formData.front_tire_size}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 225/40R18'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='front_tire_brand'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Front Tire Brand
                          </label>
                          <input
                            type='text'
                            id='front_tire_brand'
                            name='front_tire_brand'
                            value={formData.front_tire_brand}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Michelin'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='rear_tire_size'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Rear Tire Size
                          </label>
                          <input
                            type='text'
                            id='rear_tire_size'
                            name='rear_tire_size'
                            value={formData.rear_tire_size}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 255/40R18'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='rear_tire_brand'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Rear Tire Brand
                          </label>
                          <input
                            type='text'
                            id='rear_tire_brand'
                            name='rear_tire_brand'
                            value={formData.rear_tire_brand}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Michelin'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='front_tire_model'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Front Tire Model
                          </label>
                          <input
                            type='text'
                            id='front_tire_model'
                            name='front_tire_model'
                            value={formData.front_tire_model}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Pilot Sport 4S'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='front_tire_pressure'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Front Tire Pressure (PSI)
                          </label>
                          <input
                            type='number'
                            id='front_tire_pressure'
                            name='front_tire_pressure'
                            value={formData.front_tire_pressure}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 32'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='rear_tire_model'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Rear Tire Model
                          </label>
                          <input
                            type='text'
                            id='rear_tire_model'
                            name='rear_tire_model'
                            value={formData.rear_tire_model}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Pilot Sport 4S'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='rear_tire_pressure'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Rear Tire Pressure (PSI)
                          </label>
                          <input
                            type='number'
                            id='rear_tire_pressure'
                            name='rear_tire_pressure'
                            value={formData.rear_tire_pressure}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 30'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brakes & Suspension */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Brakes & Suspension
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='front_brakes'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Front Brakes
                          </label>
                          <input
                            type='text'
                            id='front_brakes'
                            name='front_brakes'
                            value={formData.front_brakes}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Brembo 4-Piston'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='rear_brakes'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Rear Brakes
                          </label>
                          <input
                            type='text'
                            id='rear_brakes'
                            name='rear_brakes'
                            value={formData.rear_brakes}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Brembo 2-Piston'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='brake_rotors'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Brake Rotors
                          </label>
                          <input
                            type='text'
                            id='brake_rotors'
                            name='brake_rotors'
                            value={formData.brake_rotors}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Slotted & Drilled'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='brake_caliper_brand'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Brake Caliper Brand
                          </label>
                          <input
                            type='text'
                            id='brake_caliper_brand'
                            name='brake_caliper_brand'
                            value={formData.brake_caliper_brand}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Brembo, AP Racing'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='brake_lines'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Brake Lines
                          </label>
                          <input
                            type='text'
                            id='brake_lines'
                            name='brake_lines'
                            value={formData.brake_lines}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Stainless Steel Braided'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='front_suspension'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Front Suspension
                          </label>
                          <input
                            type='text'
                            id='front_suspension'
                            name='front_suspension'
                            value={formData.front_suspension}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., MacPherson Strut'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='rear_suspension'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Rear Suspension
                          </label>
                          <input
                            type='text'
                            id='rear_suspension'
                            name='rear_suspension'
                            value={formData.rear_suspension}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Multi-Link'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='suspension_type'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Suspension Type
                          </label>
                          <input
                            type='text'
                            id='suspension_type'
                            name='suspension_type'
                            value={formData.suspension_type}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Coilovers'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='ride_height'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Ride Height
                          </label>
                          <input
                            type='text'
                            id='ride_height'
                            name='ride_height'
                            value={formData.ride_height}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Lowered 2 inches'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='coilovers'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Coilovers
                          </label>
                          <input
                            type='text'
                            id='coilovers'
                            name='coilovers'
                            value={formData.coilovers}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., KW Variant 3'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='sway_bars'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Sway Bars
                          </label>
                          <input
                            type='text'
                            id='sway_bars'
                            name='sway_bars'
                            value={formData.sway_bars}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., H&R 24mm Front, 22mm Rear'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Exterior */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Exterior
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='body_kit'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Body Kit
                          </label>
                          <input
                            type='text'
                            id='body_kit'
                            name='body_kit'
                            value={formData.body_kit}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Rocket Bunny, Liberty Walk'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='paint_color'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Paint Color
                          </label>
                          <input
                            type='text'
                            id='paint_color'
                            name='paint_color'
                            value={formData.paint_color}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Championship White'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='paint_type'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Paint Type
                          </label>
                          <input
                            type='text'
                            id='paint_type'
                            name='paint_type'
                            value={formData.paint_type}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Pearl, Matte, Metallic'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='wrap_color'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Wrap Color
                          </label>
                          <input
                            type='text'
                            id='wrap_color'
                            name='wrap_color'
                            value={formData.wrap_color}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Satin Black, Glossy Red'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='carbon_fiber_parts'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Carbon Fiber Parts
                          </label>
                          <input
                            type='text'
                            id='carbon_fiber_parts'
                            name='carbon_fiber_parts'
                            value={formData.carbon_fiber_parts}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Hood, Trunk, Fenders'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='lighting'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Lighting
                          </label>
                          <input
                            type='text'
                            id='lighting'
                            name='lighting'
                            value={formData.lighting}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., LED Headlights, Underglow'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interior */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Interior
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='interior_color'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Interior Color
                          </label>
                          <input
                            type='text'
                            id='interior_color'
                            name='interior_color'
                            value={formData.interior_color}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Black, Tan, Red'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='interior_material'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Interior Material
                          </label>
                          <input
                            type='text'
                            id='interior_material'
                            name='interior_material'
                            value={formData.interior_material}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Leather, Alcantara, Cloth'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='seats'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Seats
                          </label>
                          <input
                            type='text'
                            id='seats'
                            name='seats'
                            value={formData.seats}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., Recaro Sport Seats'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='steering_wheel'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Steering Wheel
                          </label>
                          <input
                            type='text'
                            id='steering_wheel'
                            name='steering_wheel'
                            value={formData.steering_wheel}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., MOMO Racing Wheel'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='shift_knob'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Shift Knob
                          </label>
                          <input
                            type='text'
                            id='shift_knob'
                            name='shift_knob'
                            value={formData.shift_knob}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., MOMO Aluminum'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='gauges'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Gauges
                          </label>
                          <input
                            type='text'
                            id='gauges'
                            name='gauges'
                            value={formData.gauges}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., AEM Wideband, Boost Gauge'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modifications */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Modifications & Dyno
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='dyno_results'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Dyno Results
                          </label>
                          <input
                            type='text'
                            id='dyno_results'
                            name='dyno_results'
                            value={formData.dyno_results}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 350 WHP, 380 WTQ'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='modifications'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Modifications List
                          </label>
                          <textarea
                            id='modifications'
                            name='modifications'
                            value={formData.modifications.join(', ')}
                            onChange={e => {
                              const mods = e.target.value
                                .split(',')
                                .map(m => m.trim())
                                .filter(m => m)
                              setFormData(prev => ({
                                ...prev,
                                modifications: mods,
                              }))
                            }}
                            rows={3}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='List modifications separated by commas (e.g., Cold Air Intake, Exhaust, Tune)'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className='border-t pt-6'>
                      <h4 className='text-lg font-medium text-gray-900 mb-4'>
                        Additional Details
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='vin'
                            className='block text-sm font-medium text-gray-700'
                          >
                            VIN
                          </label>
                          <input
                            type='text'
                            id='vin'
                            name='vin'
                            value={formData.vin}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='Vehicle Identification Number'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='mileage'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Mileage
                          </label>
                          <input
                            type='number'
                            id='mileage'
                            name='mileage'
                            value={formData.mileage}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 50000'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='fuel_economy'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Fuel Economy
                          </label>
                          <input
                            type='text'
                            id='fuel_economy'
                            name='fuel_economy'
                            value={formData.fuel_economy}
                            onChange={handleInputChange}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='e.g., 25 MPG City, 32 MPG Highway'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='maintenance_history'
                            className='block text-sm font-medium text-gray-700'
                          >
                            Maintenance History
                          </label>
                          <textarea
                            id='maintenance_history'
                            name='maintenance_history'
                            value={formData.maintenance_history}
                            onChange={handleInputChange}
                            rows={3}
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            placeholder='Recent maintenance, modifications, etc.'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-end'>
                      <button
                        type='submit'
                        disabled={saving}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                      >
                        {saving ? (
                          <>
                            <Loader2 className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Photo Upload */}
              <div className='bg-white shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg font-medium text-gray-900 mb-6'>
                    Photos
                  </h3>
                  <p className='text-sm text-gray-600 mb-4'>
                    Upload photos first, then optionally categorize them by car
                    part. You can categorize each photo individually after
                    upload.
                  </p>

                  {/* Existing Photos */}
                  {car && car.photos && car.photos.length > 0 && (
                    <div className='mb-6'>
                      <h4 className='text-sm font-medium text-gray-700 mb-3'>
                        Current Photos
                      </h4>
                      <div className='grid grid-cols-2 gap-3'>
                        {car.photos.map((photo, index) => (
                          <div
                            key={index}
                            className='relative group overflow-hidden rounded-lg'
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

                            {/* Main Photo Badge */}
                            {car.main_photo_url ===
                              (typeof photo === 'string'
                                ? photo
                                : photo.url) && (
                              <div className='absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
                                Main
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className='absolute bottom-2 right-2 flex space-x-1'>
                              {/* Set as Main Photo Button */}
                              {car.main_photo_url !==
                                (typeof photo === 'string'
                                  ? photo
                                  : photo.url) && (
                                <button
                                  onClick={() =>
                                    handleSetMainPhoto(
                                      typeof photo === 'string'
                                        ? photo
                                        : photo.url
                                    )
                                  }
                                  className='bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors cursor-pointer'
                                  title='Set as main photo'
                                >
                                  <Star className='w-3 h-3' />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={async () => {
                                  // TODO: Implement photo deletion
                                  setError('Photo deletion not implemented yet')
                                }}
                                className='bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors cursor-pointer'
                                title='Delete photo'
                              >
                                <X className='w-3 h-3' />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo Upload Component */}
                  {car && (
                    <PhotoUpload
                      carId={car.id}
                      onUploadComplete={handlePhotoUploadComplete}
                      onBatchUploadComplete={handleBatchUploadComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
