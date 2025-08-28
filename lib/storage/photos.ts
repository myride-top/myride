import { createClient } from '@/lib/supabase/client'

export async function uploadCarPhoto(
  file: File,
  carId: string
): Promise<string | null> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${carId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('car-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading photo:', error)
    return null
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('car-photos').getPublicUrl(fileName)

  return publicUrl
}

export async function deleteCarPhoto(photoUrl: string): Promise<boolean> {
  const supabase = createClient()

  // Extract file path from URL
  const urlParts = photoUrl.split('/')
  const fileName =
    urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1]

  const { error } = await supabase.storage.from('car-photos').remove([fileName])

  if (error) {
    console.error('Error deleting photo:', error)
    return false
  }

  return true
}

export async function uploadProfileAvatar(
  file: File,
  userId: string
): Promise<string | null> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Error uploading avatar:', error)
    return null
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(fileName)

  return publicUrl
}
