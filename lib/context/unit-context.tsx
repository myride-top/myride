'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useAuth } from './auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'

type UnitPreference = 'metric' | 'imperial'

interface UnitContextType {
  unitPreference: UnitPreference
  setUnitPreference: (preference: UnitPreference) => void
  isLoading: boolean
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

export function UnitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [unitPreference, setUnitPreferenceState] =
    useState<UnitPreference>('metric')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUnitPreference = async () => {
      if (user) {
        try {
          const profile = await getProfileByUserIdClient(user.id)
          if (profile?.unit_preference) {
            setUnitPreferenceState(profile.unit_preference)
          }
        } catch {
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    loadUnitPreference()
  }, [user])

  const setUnitPreference = (preference: UnitPreference) => {
    setUnitPreferenceState(preference)
  }

  return (
    <UnitContext.Provider
      value={{ unitPreference, setUnitPreference, isLoading }}
    >
      {children}
    </UnitContext.Provider>
  )
}

export function useUnitPreference() {
  const context = useContext(UnitContext)
  if (context === undefined) {
    throw new Error('useUnitPreference must be used within a UnitProvider')
  }
  return context
}
