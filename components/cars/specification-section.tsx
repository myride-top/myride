import { Car } from '@/lib/types/database'
import { convertToPreferredUnit } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'

interface SpecificationSectionProps {
  title: string
  specifications: Array<{
    key: string
    label: string
    value: string | number | null
    unit?: string
    unitType?: 'torque' | 'speed' | 'weight' | 'pressure' | 'distance'
  }>
  className?: string
}

export default function SpecificationSection({
  title,
  specifications,
  className,
}: SpecificationSectionProps) {
  const { unitPreference } = useUnitPreference()

  // Filter out specifications with null/empty values
  const validSpecs = specifications.filter(spec => 
    spec.value !== null && spec.value !== undefined && spec.value !== ''
  )

  if (validSpecs.length === 0) {
    return null
  }

  const formatValue = (spec: typeof validSpecs[0]) => {
    if (spec.unitType && typeof spec.value === 'number') {
      return convertToPreferredUnit(spec.value, spec.unitType, unitPreference)
    }
    
    if (spec.unit && typeof spec.value === 'number') {
      return `${spec.value} ${spec.unit}`
    }
    
    return spec.value
  }

  return (
    <div className={className}>
      <h3 className='text-lg font-medium text-foreground mb-4'>{title}</h3>
      <dl className='space-y-3'>
        {validSpecs.map((spec) => (
          <div key={spec.key}>
            <dt className='text-sm font-medium text-muted-foreground'>
              {spec.label}
            </dt>
            <dd className='text-sm text-foreground'>
              {formatValue(spec)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
