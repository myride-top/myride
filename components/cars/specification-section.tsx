import { unitConversions } from '@/lib/utils'
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

export const SpecificationSection = ({
  title,
  specifications,
  className,
}: SpecificationSectionProps) => {
  const { unitPreference, isLoading: unitLoading } = useUnitPreference()

  // Filter out specifications with null/empty values
  const validSpecs = specifications.filter(
    spec => spec.value !== null && spec.value !== undefined && spec.value !== ''
  )

  if (validSpecs.length === 0) {
    return null
  }

  const formatValue = (spec: (typeof validSpecs)[0]) => {
    // Values are already in the user's preferred units from car-specifications
    // Just format with the correct unit label
    if (spec.unitType && typeof spec.value === 'number') {
      const value = spec.value
      const preference = unitLoading ? 'metric' : unitPreference || 'metric'

      // Format with correct unit label based on preference
      switch (spec.unitType) {
        case 'torque':
          return preference === 'metric'
            ? `${value} ${unitConversions.torque.metricUnit}`
            : `${value} ${unitConversions.torque.imperialUnit}`
        case 'weight':
          return preference === 'metric'
            ? `${value} ${unitConversions.weight.metricUnit}`
            : `${value} ${unitConversions.weight.imperialUnit}`
        case 'speed':
          return preference === 'metric'
            ? `${value} ${unitConversions.speed.metricUnit}`
            : `${value} ${unitConversions.speed.imperialUnit}`
        case 'pressure':
          return preference === 'metric'
            ? `${value} ${unitConversions.pressure.metricUnit}`
            : `${value} ${unitConversions.pressure.imperialUnit}`
        case 'distance':
          return preference === 'metric'
            ? `${value} ${unitConversions.distance.metricUnit}`
            : `${value} ${unitConversions.distance.imperialUnit}`
        default:
          return spec.value.toString()
      }
    }

    // Non-convertible units (like HP, L, seconds) just show with their unit
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
