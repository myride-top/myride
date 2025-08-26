export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>
      }
      cars: {
        Row: Car
        Insert: Omit<Car, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Car, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface CarPhoto {
  url: string
  category: string
  description?: string
  order: number
}

export interface Car {
  id: string
  user_id: string
  name: string
  url_slug: string
  make: string
  model: string
  year: number
  description: string | null
  photos: CarPhoto[] | null
  
  // Engine Specifications
  engine_displacement: number | null // in liters
  engine_cylinders: number | null
  engine_code: string | null // e.g., "B58", "LS3", "K20"
  horsepower: number | null // in HP
  torque: number | null // in lb-ft
  engine_type: string | null // e.g., "Turbocharged I4"
  fuel_type: string | null // e.g., "Gasoline"
  transmission: string | null // e.g., "6-Speed Manual"
  drivetrain: string | null // e.g., "AWD", "RWD", "FWD"
  
  // Performance Specifications
  zero_to_sixty: number | null // 0-60 mph time in seconds
  top_speed: number | null // in mph
  quarter_mile: number | null // quarter mile time in seconds
  weight: number | null // in lbs
  power_to_weight: string | null // e.g., "10.2 lbs/hp"
  
  // Brake System
  front_brakes: string | null
  rear_brakes: string | null
  brake_rotors: string | null
  brake_caliper_brand: string | null
  brake_lines: string | null
  
  // Suspension
  front_suspension: string | null
  rear_suspension: string | null
  suspension_type: string | null
  ride_height: string | null
  coilovers: string | null
  sway_bars: string | null
  
  // Wheels and Tires
  wheel_size: string | null
  wheel_material: string | null
  wheel_brand: string | null
  wheel_offset: string | null
  // Front Tires
  front_tire_size: string | null
  front_tire_brand: string | null
  front_tire_model: string | null
  front_tire_pressure: number | null
  // Rear Tires
  rear_tire_size: string | null
  rear_tire_brand: string | null
  rear_tire_model: string | null
  rear_tire_pressure: number | null
  
  // Exterior
  body_kit: string | null
  paint_color: string | null
  paint_type: string | null
  wrap_color: string | null
  carbon_fiber_parts: string | null
  lighting: string | null
  
  // Interior
  interior_color: string | null
  interior_material: string | null
  seats: string | null
  steering_wheel: string | null
  shift_knob: string | null
  gauges: string | null
  
  // Modifications
  modifications: string[] | null
  dyno_results: string | null
  
  // Additional Details
  vin: string | null
  mileage: number | null
  fuel_economy: string | null
  maintenance_history: string | null
  
  // Photo organization
  photos: CarPhoto[] | null
  
  created_at: string
  updated_at: string
}

// Photo categories for organization
export const PHOTO_CATEGORIES = [
  'exterior',
  'interior',
  'engine',
  'wheels',
  'brakes',
  'suspension',
  'underbody',
  'dyno',
  'other'
] as const

export type PhotoCategory = typeof PHOTO_CATEGORIES[number]
