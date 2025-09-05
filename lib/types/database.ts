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
      car_likes: {
        Row: CarLike
        Insert: Omit<CarLike, 'id' | 'created_at'>
        Update: Partial<Omit<CarLike, 'id' | 'created_at'>>
      }
      car_views: {
        Row: CarView
        Insert: Omit<CarView, 'id' | 'created_at'>
        Update: Partial<Omit<CarView, 'id' | 'created_at'>>
      }
      car_shares: {
        Row: CarShare
        Insert: Omit<CarShare, 'id' | 'created_at'>
        Update: Partial<Omit<CarShare, 'id' | 'created_at'>>
      }
      car_comments: {
        Row: CarComment
        Insert: Omit<CarComment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CarComment, 'id' | 'created_at' | 'updated_at'>>
      }
      comment_likes: {
        Row: CommentLike
        Insert: Omit<CommentLike, 'id' | 'created_at'>
        Update: Partial<Omit<CommentLike, 'id' | 'created_at'>>
      }
      waitlist: {
        Row: WaitlistEntry
        Insert: Omit<WaitlistEntry, 'id' | 'created_at'>
        Update: Partial<Omit<WaitlistEntry, 'id' | 'created_at'>>
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
  unit_preference: 'metric' | 'imperial'
  created_at: string
  updated_at: string
  is_premium: boolean
  premium_purchased_at: string | null
  car_slots_purchased: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  total_supported_amount: number // Total amount supported across all creators
  is_supporter: boolean // Whether this user has supported any creator
}

export interface CarLike {
  id: string
  user_id: string
  car_id: string
  created_at: string
}

export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}

export interface CarPhoto {
  url: string
  category: PhotoCategory
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

  // Build Story & Project Info
  build_story: string | null // The story behind the build
  project_status: 'planning' | 'in_progress' | 'completed' | 'ongoing' | null
  build_start_date: string | null // When the build started
  total_build_cost: number | null // Total cost in cents
  build_goals: string[] | null // What the owner wants to achieve
  inspiration: string | null // What inspired this build

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

  // Social & Links
  instagram_handle: string | null
  youtube_channel: string | null
  build_thread_url: string | null // Link to forum build thread
  website_url: string | null

  // Photo organization
  photos: CarPhoto[] | null
  main_photo_url: string | null
  like_count: number
  view_count: number
  share_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface CarView {
  id: string
  car_id: string
  user_id?: string // Optional - anonymous views are allowed
  ip_address?: string // For tracking unique views
  user_agent?: string // Browser/device info
  referrer?: string // Where the view came from
  created_at: string
}

export interface CarShare {
  id: string
  car_id: string
  user_id?: string // Optional - anonymous shares are allowed
  share_platform:
    | 'twitter'
    | 'facebook'
    | 'instagram'
    | 'whatsapp'
    | 'telegram'
    | 'copy_link'
    | 'other'
  share_url?: string // The URL that was shared
  ip_address?: string // For tracking unique shares
  user_agent?: string // Browser/device info
  created_at: string
}

export interface CarComment {
  id: string
  car_id: string
  user_id: string
  content: string
  parent_comment_id: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface CommentLike {
  id: string
  user_id: string
  comment_id: string
  created_at: string
}

export interface SupportTransaction {
  id: string
  supporter_id: string // User who is supporting
  creator_id: string // User being supported
  amount: number // Amount in cents
  payment_intent_id: string // Stripe payment intent ID
  status: 'pending' | 'completed' | 'failed' | 'refunded'
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
  'other',
] as const

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number]
