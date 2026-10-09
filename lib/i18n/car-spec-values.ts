import {
  normalizeFuelType,
  normalizeTransmission,
} from '@/lib/utils/filter-normalization'

type TranslateFn = (key: string, fallback?: string) => string

const applyVars = (
  template: string,
  vars: Record<string, string | number>
): string => {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, String(value))
  }
  return result
}

const FUEL_KEYS: Record<string, string> = {
  Gasoline: 'gasoline',
  Diesel: 'diesel',
  Electric: 'electric',
  Hybrid: 'hybrid',
  'Plug-in Hybrid': 'plugInHybrid',
  E85: 'e85',
  'Flex Fuel': 'flexFuel',
  CNG: 'cng',
  LPG: 'lpg',
  Hydrogen: 'hydrogen',
  'Fuel Cell': 'fuelCell',
}

const DRIVETRAIN_KEYS: Record<string, string> = {
  awd: 'awd',
  rwd: 'rwd',
  fwd: 'fwd',
  '4wd': 'fourWd',
  '4x4': 'fourWd',
  'all-wheel drive': 'awd',
  'all wheel drive': 'awd',
  'rear-wheel drive': 'rwd',
  'rear wheel drive': 'rwd',
  'front-wheel drive': 'fwd',
  'front wheel drive': 'fwd',
  'four-wheel drive': 'fourWd',
  'four wheel drive': 'fourWd',
}

/** Map DB fuel_type string to a localized label via enum keys. */
export function translateFuelType(
  value: string | null | undefined,
  t: TranslateFn
): string | null {
  if (!value) {
    return null
  }

  const normalized = normalizeFuelType(value)
  if (!normalized) {
    return value
  }

  const key = FUEL_KEYS[normalized]
  if (!key) {
    return normalized
  }

  return t(`carDetail.specValues.fuel.${key}`, normalized)
}

/** Map DB transmission string to a localized label via enum keys. */
export function translateTransmission(
  value: string | null | undefined,
  t: TranslateFn
): string | null {
  if (!value) {
    return null
  }

  const normalized = normalizeTransmission(value)
  if (!normalized) {
    return value
  }

  const nSpeed = normalized.match(
    /^(\d+)-Speed (Manual|Automatic|CVT|DCT|Sequential)$/i
  )
  if (nSpeed) {
    const n = nSpeed[1]
    const kind = nSpeed[2].toLowerCase()
    const keyByKind: Record<string, string> = {
      manual: 'nSpeedManual',
      automatic: 'nSpeedAutomatic',
      cvt: 'nSpeedCvt',
      dct: 'nSpeedDct',
      sequential: 'nSpeedSequential',
    }
    const key = keyByKind[kind]
    if (key) {
      const template = t(
        `carDetail.specValues.transmission.${key}`,
        `{n}-speed ${kind}`
      )
      return applyVars(template, { n })
    }
  }

  const simpleKeys: Record<string, string> = {
    Manual: 'manual',
    Automatic: 'automatic',
    CVT: 'cvt',
    DCT: 'dct',
    Sequential: 'sequential',
  }
  const simpleKey = simpleKeys[normalized]
  if (simpleKey) {
    return t(
      `carDetail.specValues.transmission.${simpleKey}`,
      normalized
    )
  }

  // Fallback for free-form like "7-speed auto"
  const loose = value.trim().match(/(\d+)\s*[-]?\s*speed\s*(auto|automatic|manual|cvt|dct)/i)
  if (loose) {
    const n = loose[1]
    const kind = loose[2].toLowerCase().startsWith('auto')
      ? 'nSpeedAutomatic'
      : loose[2].toLowerCase() === 'manual'
        ? 'nSpeedManual'
        : loose[2].toLowerCase() === 'cvt'
          ? 'nSpeedCvt'
          : 'nSpeedDct'
    const template = t(
      `carDetail.specValues.transmission.${kind}`,
      `{n}-speed ${loose[2]}`
    )
    return applyVars(template, { n })
  }

  return normalized
}

/** Map DB drivetrain string to a localized label via enum keys. */
export function translateDrivetrain(
  value: string | null | undefined,
  t: TranslateFn
): string | null {
  if (!value) {
    return null
  }

  const key = DRIVETRAIN_KEYS[value.trim().toLowerCase()]
  if (!key) {
    return value
  }

  return t(`carDetail.specValues.drivetrain.${key}`, value)
}
