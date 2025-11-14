'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import {
  getProfileByUserIdClient,
  getProfileByUsernameClient,
  updateProfileClient,
} from '@/lib/database/profiles-client'
import { Profile } from '@/lib/types/database'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import { AvatarUpload } from '@/components/common/avatar-upload'
import { isUserPremium } from '@/lib/database/premium-client'
import { Crown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { FormSection } from '@/components/forms/form-section'
import FormField from '@/components/forms/form-field'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { NationalitySelect } from '@/components/forms/nationality-select'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    unit_preference: 'metric' as 'metric' | 'imperial',
    nationality: '',
    // Premium fields
    bio: '',
    location: '',
    instagram_handle: '',
    youtube_channel: '',
    website_url: '',
    garage_description: '',
  })
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const [userProfile, premiumStatus] = await Promise.all([
            getProfileByUserIdClient(user.id),
            isUserPremium(user.id),
          ])

          setProfile(userProfile)
          setIsPremium(premiumStatus)

          if (userProfile) {
            setFormData({
              username: userProfile.username || '',
              full_name: userProfile.full_name || '',
              unit_preference: userProfile.unit_preference || 'metric',
              nationality: userProfile.nationality || '',
              // Premium fields
              bio: userProfile.bio || '',
              location: userProfile.location || '',
              instagram_handle: userProfile.instagram_handle || '',
              youtube_channel: userProfile.youtube_channel || '',
              website_url: userProfile.website_url || '',
              garage_description: userProfile.garage_description || '',
            })
            setAvatarUrl(userProfile.avatar_url || '')
          } else {
            // If no profile exists, set default values
            setFormData({
              username: `user_${user.id.slice(0, 8)}`,
              full_name: user.email || '',
              unit_preference: 'metric',
              nationality: '',
              bio: '',
              location: '',
              instagram_handle: '',
              youtube_channel: '',
              website_url: '',
              garage_description: '',
            })
            setAvatarUrl('')
          }
        } catch {
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!user) {
      setError('User not authenticated')
      setSaving(false)
      return
    }

    try {
      // Check if username is being changed and if it's available
      if (profile && formData.username !== profile.username) {
        // Username is being changed, check if it's available
        const existingProfile = await getProfileByUsernameClient(
          formData.username
        )
        if (existingProfile && existingProfile.id !== user.id) {
          setError(
            'Username already exists. Please choose a different username.'
          )
          setSaving(false)
          return
        }
      }

      const updateData: Partial<Profile> = {
        username: formData.username,
        full_name: formData.full_name,
        unit_preference: formData.unit_preference,
        nationality: formData.nationality || null,
        // avatar_url is already updated when avatar changes, no need to update again
      }

      // Only include premium fields if user is premium
      if (isPremium) {
        updateData.bio = formData.bio || null
        updateData.location = formData.location || null
        updateData.instagram_handle = formData.instagram_handle || null
        updateData.youtube_channel = formData.youtube_channel || null
        updateData.website_url = formData.website_url || null
        updateData.garage_description = formData.garage_description || null
      }

      const result = await updateProfileClient(user.id, updateData)

      if (result.success && result.data) {
        setProfile(result.data)
        toast.success('Profile updated successfully!')
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl)

    // Immediately update the database when avatar changes
    if (user) {
      try {
        const result = await updateProfileClient(user.id, {
          avatar_url: newAvatarUrl,
        })

        if (result.success && result.data) {
          setProfile(result.data)
        } else {
          toast.error(result.error || 'Failed to update avatar')
        }
      } catch (error) {
        toast.error('Failed to update avatar')
        console.error('Avatar update error:', error)
      }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout showCreateButton={false}>
          <div className='flex items-center justify-center min-h-[calc(100vh-6rem)]'>
            <LoadingSpinner message='Loading profile...' />
          </div>
        </PageLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton={false}>
        <PageHeader
          title='Edit Profile'
          description='Manage your profile information and garage customization'
        />

        <div className='max-w-3xl mx-auto'>
          <div className='bg-card shadow rounded-lg border border-border'>
            <div className='px-4 py-5 sm:p-6'>
              {/* User Info */}
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-foreground mb-2'>
                  Account Information
                </h3>
                <div className='bg-muted rounded-md p-4'>
                  <p className='text-sm text-muted-foreground'>
                    <span className='font-medium'>Email:</span> {user?.email}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    <span className='font-medium'>Member since:</span>{' '}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className='mb-6 rounded-md bg-destructive/10 p-4 border border-destructive/20'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <AlertTriangle className='h-5 w-5 text-destructive' />
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-destructive'>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className='space-y-8'>
                {/* Avatar Upload Section */}
                <FormSection title='Profile Avatar' showBorder={false}>
                  <div className='flex flex-col items-center space-y-4'>
                    <AvatarUpload
                      currentAvatarUrl={avatarUrl}
                      userId={user?.id || ''}
                      onAvatarUpdate={handleAvatarUpdate}
                      size='lg'
                    />
                  </div>
                </FormSection>

                {/* Basic Information Section */}
                <FormSection title='Basic Information'>
                  <FormField
                    label='Username'
                    name='username'
                    type='text'
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder='Enter your username'
                    className='space-y-2'
                  />
                  <p className='text-sm text-muted-foreground -mt-4'>
                    This will be your public username on MyRide
                  </p>

                  <FormField
                    label='Full Name'
                    name='full_name'
                    type='text'
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder='Enter your full name'
                    className='space-y-2'
                  />

                  <div className='space-y-2'>
                    <Label htmlFor='unit_preference'>Unit System</Label>
                    <Select
                      value={formData.unit_preference}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          unit_preference: value as 'metric' | 'imperial',
                        }))
                      }
                    >
                      <SelectTrigger id='unit_preference'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='metric'>
                          Metric (km/h, Nm, bar, kg)
                        </SelectItem>
                        <SelectItem value='imperial'>
                          Imperial (mph, lb-ft, PSI, lbs)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className='text-sm text-muted-foreground'>
                      Choose your preferred unit system for car specifications
                    </p>
                  </div>

                  <NationalitySelect
                    value={formData.nationality}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        nationality: value,
                      }))
                    }
                    label='Nationality'
                    placeholder='Select your nationality'
                    className='space-y-2'
                  />
                  <p className='text-sm text-muted-foreground -mt-4'>
                    Your nationality or country of origin
                  </p>
                </FormSection>

                {/* Premium Garage Customization Section */}
                {isPremium && (
                  <FormSection title='Garage Customization'>
                    <div className='flex items-center gap-2 mb-4'>
                      <Crown className='w-5 h-5 text-yellow-500' />
                      <span className='text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full'>
                        Premium Feature
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mb-6'>
                      Customize how your garage page appears to visitors. These
                      options are only available to premium users.
                    </p>

                    <div className='space-y-6'>
                      <FormField
                        label='Garage Description'
                        name='garage_description'
                        type='textarea'
                        value={formData.garage_description}
                        onChange={handleInputChange}
                        placeholder='Describe your car collection...'
                        rows={3}
                        className='space-y-2'
                      />
                      <p className='text-sm text-muted-foreground -mt-4'>
                        A brief description that appears at the top of your
                        garage page
                      </p>

                      <FormField
                        label='Bio'
                        name='bio'
                        type='textarea'
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder='Tell visitors about yourself...'
                        rows={4}
                        className='space-y-2'
                      />
                      <p className='text-sm text-muted-foreground -mt-4'>
                        A longer bio about yourself and your passion for cars
                      </p>

                      <FormField
                        label='Location'
                        name='location'
                        type='text'
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder='City, Country'
                        className='space-y-2'
                      />
                      <p className='text-sm text-muted-foreground -mt-4'>
                        Your location (e.g., &quot;Los Angeles, CA&quot; or
                        &quot;London, UK&quot;)
                      </p>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label htmlFor='instagram_handle'>
                            Instagram Handle
                          </Label>
                          <div className='flex rounded-md'>
                            <span className='inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm'>
                              @
                            </span>
                            <Input
                              id='instagram_handle'
                              name='instagram_handle'
                              type='text'
                              value={formData.instagram_handle}
                              onChange={handleInputChange}
                              className='rounded-l-none'
                              placeholder='username'
                            />
                          </div>
                        </div>

                        <FormField
                          label='YouTube Channel'
                          name='youtube_channel'
                          type='text'
                          value={formData.youtube_channel}
                          onChange={handleInputChange}
                          placeholder='Channel name or URL'
                          className='space-y-2'
                        />
                      </div>

                      <FormField
                        label='Website URL'
                        name='website_url'
                        type='url'
                        value={formData.website_url}
                        onChange={handleInputChange}
                        placeholder='https://yourwebsite.com'
                        className='space-y-2'
                      />
                      <p className='text-sm text-muted-foreground -mt-4'>
                        Your personal website or portfolio
                      </p>
                    </div>
                  </FormSection>
                )}

                {/* Form Actions */}
                <div className='flex justify-end pt-6 border-t border-border'>
                  <Button type='submit' disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className='animate-spin -ml-1 mr-2 h-4 w-4' />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
