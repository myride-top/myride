import { createBrowserClient } from '@supabase/ssr'
import { CarTimeline } from '@/lib/types/database'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Get all timeline entries for a car, sorted by date and order_index
 */
export async function getCarTimelineClient(
  carId: string
): Promise<CarTimeline[]> {
  try {
    const { data, error } = await supabase
      .from('car_timeline')
      .select('*')
      .eq('car_id', carId)
      .order('date', { ascending: true })
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching car timeline:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching car timeline:', error)
    return []
  }
}

/**
 * Create a new timeline entry
 */
export async function createTimelineEntryClient(
  carId: string,
  entry: Omit<CarTimeline, 'id' | 'car_id' | 'created_at' | 'updated_at'>
): Promise<CarTimeline | null> {
  try {
    const { data, error } = await supabase
      .from('car_timeline')
      .insert({
        car_id: carId,
        date: entry.date,
        title: entry.title,
        description: entry.description || null,
        photo_url: entry.photo_url || null,
        photo_url_2: entry.photo_url_2 || null,
        order_index: entry.order_index || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating timeline entry:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating timeline entry:', error)
    return null
  }
}

/**
 * Update a timeline entry
 */
export async function updateTimelineEntryClient(
  entryId: string,
  updates: Partial<
    Omit<CarTimeline, 'id' | 'car_id' | 'created_at' | 'updated_at'>
  >
): Promise<CarTimeline | null> {
  try {
    const { data, error } = await supabase
      .from('car_timeline')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating timeline entry:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating timeline entry:', error)
    return null
  }
}

/**
 * Delete a timeline entry
 */
export async function deleteTimelineEntryClient(
  entryId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('car_timeline')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('Error deleting timeline entry:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting timeline entry:', error)
    return false
  }
}

/**
 * Bulk upsert timeline entries for a car
 * This is useful when saving the entire timeline from the form
 */
export async function upsertCarTimelineClient(
  carId: string,
  entries: Omit<CarTimeline, 'id' | 'car_id' | 'created_at' | 'updated_at'>[]
): Promise<CarTimeline[]> {
  try {
    // First, delete all existing entries for this car
    const { error: deleteError } = await supabase
      .from('car_timeline')
      .delete()
      .eq('car_id', carId)

    if (deleteError) {
      console.error('Error deleting existing timeline entries:', deleteError)
      return []
    }

    // If no entries to insert, return empty array
    if (entries.length === 0) {
      return []
    }

    // Insert all new entries
    const entriesToInsert = entries.map(entry => ({
      car_id: carId,
      date: entry.date,
      title: entry.title,
      description: entry.description || null,
      photo_url: entry.photo_url || null,
      photo_url_2: entry.photo_url_2 || null,
      order_index: entry.order_index || 0,
    }))

    const { data, error } = await supabase
      .from('car_timeline')
      .insert(entriesToInsert)
      .select()

    if (error) {
      console.error('Error upserting timeline entries:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error upserting timeline entries:', error)
    return []
  }
}
