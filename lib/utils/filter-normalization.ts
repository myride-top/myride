/**
 * Normalization utilities for filter values
 * Unifies variations of the same value (e.g., "5 Speed Manual" vs "5-speed manual")
 */

/**
 * Normalizes transmission values to a standard format
 * Handles variations like:
 * - "5 Speed Manual" -> "5-Speed Manual"
 * - "5-speed manual" -> "5-Speed Manual"
 * - "6 speed manual" -> "6-Speed Manual"
 * - "Automatic" -> "Automatic"
 * - "CVT" -> "CVT"
 */
export function normalizeTransmission(value: string | null): string | null {
  if (!value) return null

  const normalized = value.trim()

  // Extract number and type (manual/automatic/cvt/etc)
  const manualMatch = normalized.match(/(\d+)\s*[-]?\s*speed\s*manual/i)
  const autoMatch = normalized.match(/(\d+)\s*[-]?\s*speed\s*automatic/i)
  const cvtMatch = normalized.match(/(\d+)\s*[-]?\s*speed\s*cvt/i)
  const dctMatch = normalized.match(/(\d+)\s*[-]?\s*speed\s*dct/i)
  const sequentialMatch = normalized.match(/(\d+)\s*[-]?\s*speed\s*sequential/i)

  if (manualMatch) {
    return `${manualMatch[1]}-Speed Manual`
  }
  if (autoMatch) {
    return `${autoMatch[1]}-Speed Automatic`
  }
  if (cvtMatch) {
    return `${cvtMatch[1]}-Speed CVT`
  }
  if (dctMatch) {
    return `${dctMatch[1]}-Speed DCT`
  }
  if (sequentialMatch) {
    return `${sequentialMatch[1]}-Speed Sequential`
  }

  // Handle common variations
  const lower = normalized.toLowerCase()
  if (lower.includes('manual') && !lower.match(/\d/)) {
    return 'Manual'
  }
  if (lower.includes('automatic') && !lower.match(/\d/)) {
    return 'Automatic'
  }
  if (lower.includes('cvt') && !lower.match(/\d/)) {
    return 'CVT'
  }
  if (lower.includes('dct') || lower.includes('dual clutch')) {
    return 'DCT'
  }
  if (lower.includes('sequential')) {
    return 'Sequential'
  }

  // Return capitalized version if no pattern matches
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Normalizes fuel type values to a standard format
 * Handles variations like:
 * - "Gasoline" -> "Gasoline"
 * - "Gasolina" -> "Gasoline"
 * - "Petrol" -> "Gasoline"
 * - "Diesel" -> "Diesel"
 * - "Electric" -> "Electric"
 * - "Hybrid" -> "Hybrid"
 */
export function normalizeFuelType(value: string | null): string | null {
  if (!value) return null

  const normalized = value.trim().toLowerCase()

  // Map common variations to standard values
  const fuelTypeMap: Record<string, string> = {
    gasoline: 'Gasoline',
    gasolina: 'Gasoline',
    petrol: 'Gasoline',
    benzina: 'Gasoline',
    diesel: 'Diesel',
    electric: 'Electric',
    ev: 'Electric',
    hybrid: 'Hybrid',
    plug_in_hybrid: 'Plug-in Hybrid',
    'plug-in hybrid': 'Plug-in Hybrid',
    phev: 'Plug-in Hybrid',
    e85: 'E85',
    flex_fuel: 'Flex Fuel',
    'flex fuel': 'Flex Fuel',
    cng: 'CNG',
    lpg: 'LPG',
    hydrogen: 'Hydrogen',
    fuel_cell: 'Fuel Cell',
    'fuel cell': 'Fuel Cell',
  }

  // Check exact matches first
  if (fuelTypeMap[normalized]) {
    return fuelTypeMap[normalized]
  }

  // Check partial matches
  for (const [key, standard] of Object.entries(fuelTypeMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return standard
    }
  }

  // Return capitalized version if no match
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Creates a mapping from normalized values to all original variations
 * This allows filtering to work with the original values while displaying normalized ones
 */
export function createNormalizedMap<T>(
  values: (T | null)[],
  normalizeFn: (value: T | null) => string | null
): Map<string, T[]> {
  const map = new Map<string, T[]>()

  for (const value of values) {
    if (value === null || value === undefined) continue

    const normalized = normalizeFn(value)
    if (!normalized) continue

    if (!map.has(normalized)) {
      map.set(normalized, [])
    }
    map.get(normalized)!.push(value as T)
  }

  return map
}

/**
 * Normalizes engine type values to a standard format
 * Handles variations like:
 * - "Inline 4" / "Inline-4" / "I4" -> "Inline-4"
 * - "Inline 4 Turbo" / "I4 Turbo" -> "Inline-4 Turbo"
 * - "V6" / "v6" -> "V6"
 * - "N/A V6" / "NA V6" -> "N/A V6"
 * - "Turbocharged I4" -> "Inline-4 Turbo"
 */
export function normalizeEngineType(value: string | null): string | null {
  if (!value) return null

  const normalized = value.trim()

  // Convert to lowercase for matching, but preserve original case structure
  const lower = normalized.toLowerCase()

  // Extract common patterns
  // Inline engines: I3, I4, I5, I6, Inline-3, Inline 4, etc.
  const inlineMatch = lower.match(/inline[- ]?(\d+)|i[- ]?(\d+)/)
  if (inlineMatch) {
    const cylinders = inlineMatch[1] || inlineMatch[2]

    // Check for turbo/supercharged
    const hasTurbo = lower.includes('turbo') || lower.includes('turbocharged')
    const hasSupercharged =
      lower.includes('supercharged') || lower.includes('super')

    if (hasTurbo) {
      return `Inline-${cylinders} Turbo`
    }
    if (hasSupercharged) {
      return `Inline-${cylinders} Supercharged`
    }

    return `Inline-${cylinders}`
  }

  // V engines: V6, V8, V10, V12
  const vMatch = lower.match(/v[- ]?(\d+)/)
  if (vMatch) {
    const cylinders = vMatch[1]

    // Check for N/A (naturally aspirated)
    const isNA =
      lower.includes('n/a') ||
      lower.includes('na') ||
      lower.includes('naturally aspirated') ||
      lower.includes('naturally-aspirated')
    const hasTurbo = lower.includes('turbo') || lower.includes('turbocharged')
    const hasSupercharged =
      lower.includes('supercharged') || lower.includes('super')
    const hasTwinTurbo =
      lower.includes('twin turbo') || lower.includes('twin-turbo')
    const hasBiTurbo = lower.includes('biturbo') || lower.includes('bi-turbo')

    if (hasTwinTurbo || hasBiTurbo) {
      return `V${cylinders} Twin-Turbo`
    }
    if (hasTurbo) {
      return `V${cylinders} Turbo`
    }
    if (hasSupercharged) {
      return `V${cylinders} Supercharged`
    }
    if (isNA) {
      return `N/A V${cylinders}`
    }

    return `V${cylinders}`
  }

  // Boxer/Flat engines
  if (lower.includes('boxer') || lower.includes('flat')) {
    const boxerMatch = lower.match(/(\d+)/)
    if (boxerMatch) {
      const cylinders = boxerMatch[1]
      const hasTurbo = lower.includes('turbo') || lower.includes('turbocharged')

      if (hasTurbo) {
        return `Boxer-${cylinders} Turbo`
      }
      return `Boxer-${cylinders}`
    }
    return 'Boxer'
  }

  // Rotary/Wankel
  if (lower.includes('rotary') || lower.includes('wankel')) {
    return 'Rotary'
  }

  // Electric
  if (lower.includes('electric') || lower === 'ev') {
    return 'Electric'
  }

  // Hybrid
  if (lower.includes('hybrid')) {
    const hasTurbo = lower.includes('turbo')
    if (hasTurbo) {
      return 'Hybrid Turbo'
    }
    return 'Hybrid'
  }

  // Handle "Turbocharged I4" -> "Inline-4 Turbo" pattern
  if (lower.includes('turbocharged')) {
    const turboInlineMatch = lower.match(/turbocharged\s+(i|inline)[- ]?(\d+)/)
    if (turboInlineMatch) {
      return `Inline-${turboInlineMatch[2]} Turbo`
    }
    const turboVMatch = lower.match(/turbocharged\s+v[- ]?(\d+)/)
    if (turboVMatch) {
      return `V${turboVMatch[1]} Turbo`
    }
  }

  // Handle "Supercharged I4" -> "Inline-4 Supercharged" pattern
  if (lower.includes('supercharged')) {
    const superInlineMatch = lower.match(/supercharged\s+(i|inline)[- ]?(\d+)/)
    if (superInlineMatch) {
      return `Inline-${superInlineMatch[2]} Supercharged`
    }
    const superVMatch = lower.match(/supercharged\s+v[- ]?(\d+)/)
    if (superVMatch) {
      return `V${superVMatch[1]} Supercharged`
    }
  }

  // Return capitalized version if no pattern matches
  return normalized
    .split(' ')
    .map(word => {
      // Preserve common abbreviations
      if (word.toLowerCase() === 'na' || word.toLowerCase() === 'n/a') {
        return 'N/A'
      }
      if (word.toLowerCase().startsWith('v') && /^\d+$/.test(word.slice(1))) {
        return word.toUpperCase()
      }
      if (word.toLowerCase().startsWith('i') && /^\d+$/.test(word.slice(1))) {
        return `I${word.slice(1)}`
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Checks if a value matches a normalized filter value
 */
export function matchesNormalizedFilter(
  value: string | null,
  filterValue: string,
  normalizeFn: (value: string | null) => string | null
): boolean {
  if (!value) return false
  const normalized = normalizeFn(value)
  return normalized === filterValue
}
