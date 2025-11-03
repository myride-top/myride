import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Unit conversion utilities for European metric system
export const unitConversions = {
  // Torque: lb-ft to Nm (Newton-meters)
  torque: {
    imperialToMetric: (lbFt: number) => Math.round(lbFt * 1.355818),
    metricToImperial: (nm: number) => Math.round(nm / 1.355818),
    imperialUnit: 'lb-ft',
    metricUnit: 'Nm',
  },

  // Tire Pressure: PSI to bar
  pressure: {
    imperialToMetric: (psi: number) => Math.round(psi * 0.0689476 * 10) / 10, // Round to 1 decimal
    metricToImperial: (bar: number) => Math.round(bar / 0.0689476),
    imperialUnit: 'PSI',
    metricUnit: 'bar',
  },

  // Speed: mph to km/h
  speed: {
    imperialToMetric: (mph: number) => Math.round(mph * 1.609344),
    metricToImperial: (kmh: number) => Math.round(kmh / 1.609344),
    imperialUnit: 'mph',
    metricUnit: 'km/h',
  },

  // Weight: lbs to kg
  weight: {
    imperialToMetric: (lbs: number) => Math.round(lbs * 0.453592),
    metricToImperial: (kg: number) => Math.round(kg / 0.453592),
    imperialUnit: 'lbs',
    metricUnit: 'kg',
  },

  // Distance: miles to km
  distance: {
    imperialToMetric: (miles: number) => Math.round(miles * 1.609344),
    metricToImperial: (km: number) => Math.round(km / 1.609344),
    imperialUnit: 'miles',
    metricUnit: 'km',
  },
}

// Helper function to format units with proper spacing
export function formatUnit(
  value: number | null | undefined,
  unit: string
): string {
  if (value === null || value === undefined) return ''
  return `${value} ${unit}`
}

// Helper function to convert and format imperial values to metric
export function convertToMetric(
  value: number | null | undefined,
  type: keyof typeof unitConversions
): string {
  if (value === null || value === undefined) return ''
  const converted = unitConversions[type].imperialToMetric(value)
  return formatUnit(converted, unitConversions[type].metricUnit)
}

// Helper function to convert and format values based on unit preference
export function convertToPreferredUnit(
  value: number | null | undefined,
  type: keyof typeof unitConversions,
  unitPreference: 'metric' | 'imperial' = 'metric'
): string {
  if (value === null || value === undefined) return ''

  // Values in the database are stored in METRIC units.
  if (unitPreference === 'imperial') {
    const converted = unitConversions[type].metricToImperial(value)
    return formatUnit(converted, unitConversions[type].imperialUnit)
  } else {
    return formatUnit(value, unitConversions[type].metricUnit)
  }
}

// Helper function to get the appropriate unit label based on preference
export function getUnitLabel(
  type: keyof typeof unitConversions,
  unitPreference: 'metric' | 'imperial' = 'metric'
): string {
  if (unitPreference === 'metric') {
    return unitConversions[type].metricUnit
  } else {
    return unitConversions[type].imperialUnit
  }
}
