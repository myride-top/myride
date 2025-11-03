import { cn } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'
import { unitConversions } from '@/lib/utils'

interface UnitDisplayProps {
  value: number | null | undefined
  unit: string
  unitType?:
    | 'torque'
    | 'weight'
    | 'pressure'
    | 'speed'
    | 'distance'
    | 'power'
    | 'volume'
  precision?: number
  showUnit?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  emptyValue?: string
  formatValue?: (value: number, unit: string) => string
}

export const UnitDisplay = ({
  value,
  unit,
  unitType,
  precision = 1,
  showUnit = true,
  className = '',
  variant = 'default',
  emptyValue = '—',
  formatValue,
}: UnitDisplayProps) => {
  const { unitPreference } = useUnitPreference()

  if (value === null || value === undefined || isNaN(value)) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        {emptyValue}
      </span>
    )
  }

  // Convert value based on unit type and preference
  let displayValue = value
  let displayUnit = unit

  if (unitType) {
    // Database stores METRIC. Convert to imperial if needed.
    switch (unitPreference) {
      case 'imperial':
        switch (unitType) {
          case 'torque':
            displayValue = unitConversions.torque.metricToImperial(value)
            displayUnit = 'lb-ft'
            break
          case 'weight':
            displayValue = unitConversions.weight.metricToImperial(value)
            displayUnit = 'lbs'
            break
          case 'pressure':
            displayValue = unitConversions.pressure.metricToImperial(value)
            displayUnit = 'PSI'
            break
          case 'speed':
            displayValue = unitConversions.speed.metricToImperial(value)
            displayUnit = 'mph'
            break
          case 'distance':
            displayValue = unitConversions.distance.metricToImperial(value)
            displayUnit = 'miles'
            break
        }
        break
      case 'metric':
      default:
        // Keep metric as-is; pick metric unit if none provided
        if (!unit) {
          switch (unitType) {
            case 'torque':
              displayUnit = 'N⋅m'
              break
            case 'weight':
              displayUnit = 'kg'
              break
            case 'pressure':
              displayUnit = 'bar'
              break
            case 'speed':
              displayUnit = 'km/h'
              break
            case 'distance':
              displayUnit = 'km'
              break
          }
        }
        break
    }
  }

  // Format the value
  let formattedValue: string
  if (formatValue) {
    formattedValue = formatValue(displayValue, displayUnit)
  } else {
    formattedValue = displayValue.toFixed(precision)
  }

  const variantClasses = {
    default: 'text-foreground',
    compact: 'text-sm text-foreground',
    minimal: 'text-xs text-muted-foreground',
  }

  const unitClasses = {
    default: 'text-muted-foreground ml-1',
    compact: 'text-xs text-muted-foreground ml-1',
    minimal: 'text-xs text-muted-foreground ml-1',
  }

  return (
    <span className={cn(variantClasses[variant], className)}>
      {formattedValue}
      {showUnit && displayUnit && (
        <span className={unitClasses[variant]}>{displayUnit}</span>
      )}
    </span>
  )
}

// Specialized unit display components
interface TorqueDisplayProps
  extends Omit<UnitDisplayProps, 'unit' | 'unitType'> {
  value: number | null | undefined
  imperialUnit?: string
}

export function TorqueDisplay({
  value,
  imperialUnit = 'Nm',
  ...props
}: TorqueDisplayProps) {
  return (
    <UnitDisplay
      {...props}
      value={value}
      unit={imperialUnit}
      unitType='torque'
    />
  )
}

interface WeightDisplayProps
  extends Omit<UnitDisplayProps, 'unit' | 'unitType'> {
  value: number | null | undefined
  imperialUnit?: string
}

export function WeightDisplay({
  value,
  imperialUnit = 'kg',
  ...props
}: WeightDisplayProps) {
  return (
    <UnitDisplay
      {...props}
      value={value}
      unit={imperialUnit}
      unitType='weight'
    />
  )
}

interface SpeedDisplayProps
  extends Omit<UnitDisplayProps, 'unit' | 'unitType'> {
  value: number | null | undefined
  imperialUnit?: string
}

export function SpeedDisplay({
  value,
  imperialUnit = 'km/h',
  ...props
}: SpeedDisplayProps) {
  return (
    <UnitDisplay
      {...props}
      value={value}
      unit={imperialUnit}
      unitType='speed'
    />
  )
}

interface PressureDisplayProps
  extends Omit<UnitDisplayProps, 'unit' | 'unitType'> {
  value: number | null | undefined
  imperialUnit?: string
}

export function PressureDisplay({
  value,
  imperialUnit = 'bar',
  ...props
}: PressureDisplayProps) {
  return (
    <UnitDisplay
      {...props}
      value={value}
      unit={imperialUnit}
      unitType='pressure'
    />
  )
}

interface PowerDisplayProps
  extends Omit<UnitDisplayProps, 'unit' | 'unitType'> {
  value: number | null | undefined
  imperialUnit?: string
}

export function PowerDisplay({
  value,
  imperialUnit = 'HP',
  ...props
}: PowerDisplayProps) {
  return (
    <UnitDisplay
      {...props}
      value={value}
      unit={imperialUnit}
      unitType='power'
    />
  )
}

// Range display for values like 0-60 mph
interface RangeDisplayProps {
  minValue: number | null | undefined
  maxValue: number | null | undefined
  unit: string
  unitType?:
    | 'torque'
    | 'weight'
    | 'pressure'
    | 'speed'
    | 'distance'
    | 'power'
    | 'volume'
  separator?: string
  precision?: number
  showUnit?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
}

export function RangeDisplay({
  minValue,
  maxValue,
  unit,
  unitType,
  separator = '-',
  precision = 1,
  showUnit = true,
  className = '',
  variant = 'default',
}: RangeDisplayProps) {
  if (minValue === null && maxValue === null) {
    return null
  }

  if (minValue === maxValue) {
    return (
      <UnitDisplay
        value={minValue}
        unit={unit}
        unitType={unitType}
        precision={precision}
        showUnit={showUnit}
        className={className}
        variant={variant}
      />
    )
  }

  return (
    <span className={className}>
      <UnitDisplay
        value={minValue}
        unit={unit}
        unitType={unitType}
        precision={precision}
        showUnit={false}
        variant={variant}
      />
      <span className='text-muted-foreground mx-1'>{separator}</span>
      <UnitDisplay
        value={maxValue}
        unit={unit}
        unitType={unitType}
        precision={precision}
        showUnit={showUnit}
        variant={variant}
      />
    </span>
  )
}

// Performance metrics display
interface PerformanceDisplayProps {
  value: number | null | undefined
  metric: 'zero_to_sixty' | 'quarter_mile' | 'top_speed' | 'power_to_weight'
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
}

export function PerformanceDisplay({
  value,
  metric,
  className = '',
  variant = 'default',
}: PerformanceDisplayProps) {
  const metricConfig = {
    zero_to_sixty: {
      label: '0-60 mph',
      unit: 's',
      unitType: 'speed' as const,
      imperialUnit: 's',
      metricUnit: 's',
    },
    quarter_mile: {
      label: '0-400m',
      unit: 's',
      unitType: 'distance' as const,
      imperialUnit: 's',
      metricUnit: 's',
    },
    top_speed: {
      label: 'Top Speed',
      unit: 'mph',
      unitType: 'speed' as const,
      imperialUnit: 'mph',
      metricUnit: 'km/h',
    },
    power_to_weight: {
      label: 'Power/Weight',
      unit: 'HP/lbs',
      unitType: 'power' as const,
      imperialUnit: 'HP/lbs',
      metricUnit: 'kW/kg',
    },
  }

  const config = metricConfig[metric]

  return (
    <div className={className}>
      <div
        className={cn(
          'text-xs text-muted-foreground',
          variant === 'minimal' ? 'text-xs' : 'text-sm'
        )}
      >
        {config.label}
      </div>
      <UnitDisplay
        value={value}
        unit={config.unit}
        unitType={config.unitType}
        precision={metric === 'power_to_weight' ? 2 : 1}
        showUnit={true}
        variant={variant}
      />
    </div>
  )
}
