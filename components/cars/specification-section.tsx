import { convertToPreferredUnit } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'

interface SpecificationSectionProps {
  title: string
  specifications: Array<{
    key: string
    label: string
    value: string | number | null
    unit?: string
    unitType?:
      | 'torque'
      | 'weight'
      | 'speed'
      | 'pressure'
      | 'distance'
      | 'power'
      | 'volume'
  }>
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
}

export default function SpecificationSection({
  title,
  specifications,
  variant = 'default',
  className,
}: SpecificationSectionProps) {
  const { unitPreference } = useUnitPreference()

  // Filter out specifications with null/empty values
  const validSpecs = specifications.filter(
    spec => spec.value !== null && spec.value !== undefined && spec.value !== ''
  )

  if (validSpecs.length === 0) {
    return null
  }

  const formatValue = (spec: (typeof validSpecs)[0]) => {
    if (spec.unitType && typeof spec.value === 'number') {
      // Only convert supported unit types
      const supportedTypes = [
        'torque',
        'weight',
        'speed',
        'pressure',
        'distance',
      ] as const
      if (supportedTypes.includes(spec.unitType as any)) {
        return convertToPreferredUnit(
          spec.value,
          spec.unitType as any,
          unitPreference
        )
      }
    }

    if (spec.unit && typeof spec.value === 'number') {
      return `${spec.value} ${spec.unit}`
    }

    // Check if this is a social media link
    if (typeof spec.value === 'string' && spec.value.startsWith('http')) {
      return (
        <a
          href={spec.value}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:text-primary/80 underline'
        >
          {spec.value}
        </a>
      )
    }

    // Check if this is an Instagram handle
    if (spec.key === 'instagram_handle' && typeof spec.value === 'string') {
      const handle = spec.value.replace('@', '')
      return (
        <a
          href={`https://instagram.com/${handle}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:text-primary/80 underline'
        >
          {spec.value}
        </a>
      )
    }

    return spec.value
  }

  return (
    <div className={className}>
      <h3 className='text-lg font-medium text-foreground mb-4'>{title}</h3>
      <dl className='space-y-3'>
        {validSpecs.map(spec => (
          <div key={spec.key}>
            <dt className='text-sm font-medium text-muted-foreground'>
              {spec.label}
            </dt>
            <dd className='text-sm text-foreground font-atkinson'>
              {formatValue(spec)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
