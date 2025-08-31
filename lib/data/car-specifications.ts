import { Car } from '@/lib/types/database'

export interface SpecificationItem {
  key: string
  label: string
  value: string | number | null
  unit?: string
  unitType?: 'torque' | 'weight' | 'pressure' | 'speed' | 'distance' | 'power' | 'volume'
  format?: (value: any) => string | null
  condition?: (car: Car) => boolean
  priority?: number // Higher priority items appear first
}

export interface SpecificationSection {
  id: string
  title: string
  specifications: SpecificationItem[]
  condition?: (car: Car) => boolean
  priority?: number
}

// Utility functions for formatting values
export const formatCurrency = (value: number | null): string | null => {
  if (value === null || value === undefined) return null
  return `$${value.toLocaleString()}`
}

export const formatSocialHandle = (value: string | null): string | null => {
  if (!value) return null
  return value.startsWith('@') ? value : `@${value}`
}

export const formatModifications = (modifications: string[] | null): string | null => {
  if (!modifications || modifications.length === 0) return null
  return modifications.join(', ')
}

export const formatBuildGoals = (goals: string[] | null): string[] => {
  if (!goals || goals.length === 0) return []
  return goals
}

// Specification definitions
export const createBasicInfoSpecs = (): SpecificationItem[] => [
  { key: 'make', label: 'Make', value: null, priority: 1 },
  { key: 'model', label: 'Model', value: null, priority: 2 },
  { key: 'year', label: 'Year', value: null, priority: 3 },
  { key: 'description', label: 'Description', value: null, priority: 4 },
]

export const createEngineSpecs = (unitPreference: 'metric' | 'imperial'): SpecificationItem[] => [
  {
    key: 'engine_displacement',
    label: 'Engine Displacement',
    value: null,
    unit: 'L',
    unitType: 'volume',
    priority: 1,
  },
  {
    key: 'engine_cylinders',
    label: 'Cylinders',
    value: null,
    priority: 2,
  },
  { key: 'engine_code', label: 'Engine Code', value: null, priority: 3 },
  {
    key: 'horsepower',
    label: 'Horsepower',
    value: null,
    unit: 'HP',
    unitType: 'power',
    priority: 4,
  },
  { 
    key: 'torque', 
    label: 'Torque', 
    value: null, 
    unitType: 'torque',
    priority: 5,
  },
  { key: 'engine_type', label: 'Engine Type', value: null, priority: 6 },
  { key: 'fuel_type', label: 'Fuel Type', value: null, priority: 7 },
  { key: 'transmission', label: 'Transmission', value: null, priority: 8 },
  { key: 'drivetrain', label: 'Drivetrain', value: null, priority: 9 },
  {
    key: 'zero_to_sixty',
    label: unitPreference === 'metric' ? '0-100 km/h' : '0-60 mph',
    value: null,
    unit: 's',
    unitType: 'speed',
    priority: 10,
  },
  {
    key: 'top_speed',
    label: 'Top Speed',
    value: null,
    unitType: 'speed',
    priority: 11,
  },
  {
    key: 'quarter_mile',
    label: '0-400m',
    value: null,
    unit: 's',
    unitType: 'distance',
    priority: 12,
  },
  { 
    key: 'weight', 
    label: 'Weight', 
    value: null, 
    unitType: 'weight',
    priority: 13,
  },
  {
    key: 'power_to_weight',
    label: 'Power to Weight Ratio',
    value: null,
    priority: 14,
  },
]

export const createWheelsAndTiresSpecs = (): SpecificationItem[] => [
  { key: 'wheel_size', label: 'Wheel Size', value: null, priority: 1 },
  { key: 'wheel_brand', label: 'Wheel Brand', value: null, priority: 2 },
  { key: 'wheel_material', label: 'Wheel Material', value: null, priority: 3 },
  { key: 'wheel_offset', label: 'Wheel Offset', value: null, priority: 4 },
  { key: 'front_tire_size', label: 'Front Tire Size', value: null, priority: 5 },
  { key: 'front_tire_brand', label: 'Front Tire Brand', value: null, priority: 6 },
  { key: 'front_tire_model', label: 'Front Tire Model', value: null, priority: 7 },
  {
    key: 'front_tire_pressure',
    label: 'Front Tire Pressure',
    value: null,
    unitType: 'pressure',
    priority: 8,
  },
  { key: 'rear_tire_size', label: 'Rear Tire Size', value: null, priority: 9 },
  { key: 'rear_tire_brand', label: 'Rear Tire Brand', value: null, priority: 10 },
  { key: 'rear_tire_model', label: 'Rear Tire Model', value: null, priority: 11 },
  {
    key: 'rear_tire_pressure',
    label: 'Rear Tire Pressure',
    value: null,
    unitType: 'pressure',
    priority: 12,
  },
]

export const createBrakesSpecs = (): SpecificationItem[] => [
  { key: 'front_brakes', label: 'Front Brakes', value: null, priority: 1 },
  { key: 'rear_brakes', label: 'Rear Brakes', value: null, priority: 2 },
  { key: 'brake_rotors', label: 'Rotors', value: null, priority: 3 },
  { key: 'brake_caliper_brand', label: 'Caliper Brand', value: null, priority: 4 },
  { key: 'brake_lines', label: 'Brake Lines', value: null, priority: 5 },
]

export const createSuspensionSpecs = (): SpecificationItem[] => [
  { key: 'front_suspension', label: 'Front Suspension', value: null, priority: 1 },
  { key: 'rear_suspension', label: 'Rear Suspension', value: null, priority: 2 },
  { key: 'suspension_type', label: 'Suspension Type', value: null, priority: 3 },
  { key: 'ride_height', label: 'Ride Height', value: null, priority: 4 },
  { key: 'coilovers', label: 'Coilovers', value: null, priority: 5 },
  { key: 'sway_bars', label: 'Sway Bars', value: null, priority: 6 },
]

export const createExteriorSpecs = (): SpecificationItem[] => [
  { key: 'body_kit', label: 'Body Kit', value: null, priority: 1 },
  { key: 'paint_color', label: 'Paint Color', value: null, priority: 2 },
  { key: 'paint_type', label: 'Paint Type', value: null, priority: 3 },
  { key: 'wrap_color', label: 'Wrap Color', value: null, priority: 4 },
  { key: 'carbon_fiber_parts', label: 'Carbon Fiber Parts', value: null, priority: 5 },
  { key: 'lighting', label: 'Lighting', value: null, priority: 6 },
]

export const createInteriorSpecs = (): SpecificationItem[] => [
  { key: 'interior_color', label: 'Interior Color', value: null, priority: 1 },
  { key: 'interior_material', label: 'Interior Material', value: null, priority: 2 },
  { key: 'seats', label: 'Seats', value: null, priority: 3 },
  { key: 'steering_wheel', label: 'Steering Wheel', value: null, priority: 4 },
  { key: 'shift_knob', label: 'Shift Knob', value: null, priority: 5 },
  { key: 'gauges', label: 'Gauges', value: null, priority: 6 },
]

export const createAdditionalDetailsSpecs = (): SpecificationItem[] => [
  {
    key: 'mileage',
    label: 'Mileage',
    value: null,
    unitType: 'distance',
    priority: 1,
  },
  { key: 'fuel_economy', label: 'Fuel Economy', value: null, priority: 2 },
  { key: 'vin', label: 'VIN', value: null, priority: 3 },
  { key: 'maintenance_history', label: 'Maintenance History', value: null, priority: 4 },
  {
    key: 'modifications',
    label: 'Modifications',
    value: null,
    format: formatModifications,
    priority: 5,
  },
  { key: 'dyno_results', label: 'Dyno Results', value: null, priority: 6 },
]

export const createBuildStorySpecs = (): SpecificationItem[] => [
  { key: 'build_story', label: 'Build Story', value: null, priority: 1 },
  { key: 'build_start_date', label: 'Build Start Date', value: null, priority: 2 },
  {
    key: 'total_build_cost',
    label: 'Total Build Cost',
    value: null,
    format: formatCurrency,
    priority: 3,
  },
  { key: 'inspiration', label: 'Inspiration', value: null, priority: 4 },
]

export const createSocialLinksSpecs = (): SpecificationItem[] => [
  { 
    key: 'instagram_handle', 
    label: 'Instagram', 
    value: null,
    format: formatSocialHandle,
    priority: 1,
  },
  { 
    key: 'youtube_channel', 
    label: 'YouTube', 
    value: null,
    priority: 2,
  },
  { 
    key: 'build_thread_url', 
    label: 'Build Thread', 
    value: null,
    priority: 3,
  },
  { 
    key: 'website_url', 
    label: 'Website', 
    value: null,
    priority: 4,
  },
]

// Create all specification sections
export const createSpecificationSections = (unitPreference: 'metric' | 'imperial'): SpecificationSection[] => [
  {
    id: 'basic',
    title: 'Basic Information',
    specifications: createBasicInfoSpecs(),
    priority: 1,
  },
  {
    id: 'build-story',
    title: 'Build Story & Project Info',
    specifications: createBuildStorySpecs(),
    priority: 2,
  },
  {
    id: 'engine',
    title: 'Engine & Performance',
    specifications: createEngineSpecs(unitPreference),
    priority: 3,
  },
  {
    id: 'wheels-tires',
    title: 'Wheels & Tires',
    specifications: createWheelsAndTiresSpecs(),
    priority: 4,
  },
  {
    id: 'brakes',
    title: 'Brake System',
    specifications: createBrakesSpecs(),
    priority: 5,
  },
  {
    id: 'suspension',
    title: 'Suspension',
    specifications: createSuspensionSpecs(),
    priority: 6,
  },
  {
    id: 'exterior',
    title: 'Exterior',
    specifications: createExteriorSpecs(),
    priority: 7,
  },
  {
    id: 'interior',
    title: 'Interior',
    specifications: createInteriorSpecs(),
    priority: 8,
  },
  {
    id: 'additional',
    title: 'Additional Details',
    specifications: createAdditionalDetailsSpecs(),
    priority: 9,
  },
  {
    id: 'social',
    title: 'Social & Links',
    specifications: createSocialLinksSpecs(),
    priority: 10,
  },
]

// Populate specifications with car data
export const populateSpecifications = (
  specifications: SpecificationItem[],
  car: Car
): SpecificationItem[] => {
  return specifications.map(spec => {
    let value = car[spec.key as keyof Car]
    
    // Apply custom formatting if specified
    if (spec.format && value !== null && value !== undefined) {
      value = spec.format(value)
    }
    
    return {
      ...spec,
      value,
    }
  }).sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

// Check if a section should be displayed
export const shouldShowSection = (
  section: SpecificationSection,
  car: Car
): boolean => {
  if (section.condition) {
    return section.condition(car)
  }
  
  // Default: show if any specification has a value
  return section.specifications.some(spec => {
    const value = car[spec.key as keyof Car]
    return value !== null && value !== undefined && value !== ''
  })
}

// Get build goals from car
export const getBuildGoals = (car: Car): string[] => {
  return formatBuildGoals(car.build_goals)
}
