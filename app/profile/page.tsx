'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  getProfileByUserIdClient,
  getProfileByUsernameClient,
  updateProfileClient,
} from '@/lib/database/profiles-client'
import { Profile } from '@/lib/types/database'
import ProtectedRoute from '@/components/auth/protected-route'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/ui/navbar'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await getProfileByUserIdClient(user.id)
          setProfile(userProfile)

          if (userProfile) {
            setFormData({
              username: userProfile.username || '',
              full_name: userProfile.full_name || '',
            })
          } else {
            // If no profile exists, set default values
            setFormData({
              username: `user_${user.id.slice(0, 8)}`,
              full_name: user.email || '',
            })
          }
        } catch (error) {
          console.error('Error loading profile:', error)
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

      const result = await updateProfileClient(user.id, {
        username: formData.username,
        full_name: formData.full_name,
      })

      if (result.success && result.data) {
        setProfile(result.data)
        toast.success('Profile updated successfully!')
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading profile...</p>
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-28'>
          <div className='flex items-center'>
            <button
              onClick={() => router.back()}
              className='mr-4 text-gray-600 hover:text-gray-900'
            >
              <ArrowLeft className='w-6 h-6' />
            </button>
            <h1 className='text-3xl font-bold text-gray-900'>Edit Profile</h1>
          </div>
        </div>

        {/* Main Content */}
        <main className='max-w-3xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <div className='bg-white shadow rounded-lg'>
              <div className='px-4 py-5 sm:p-6'>
                {/* User Info */}
                <div className='mb-6'>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Account Information
                  </h3>
                  <div className='bg-gray-50 rounded-md p-4'>
                    <p className='text-sm text-gray-600'>
                      <span className='font-medium'>Email:</span> {user?.email}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <span className='font-medium'>Member since:</span>{' '}
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className='mb-4 rounded-md bg-red-50 p-4'>
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

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div>
                    <label
                      htmlFor='username'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Username
                    </label>
                    <input
                      type='text'
                      id='username'
                      name='username'
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      placeholder='Enter your username'
                    />
                    <p className='mt-1 text-sm text-gray-500'>
                      This will be your public username on MyRide
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor='full_name'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Full Name
                    </label>
                    <input
                      type='text'
                      id='full_name'
                      name='full_name'
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      placeholder='Enter your full name'
                    />
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
