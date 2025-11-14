import { getCountryFlag } from '@/lib/utils/countries'
import { cn } from '@/lib/utils'

interface NationalityFlagProps {
  nationality: string | null | undefined
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function NationalityFlag({
  nationality,
  className,
  size = 'md',
}: NationalityFlagProps) {
  if (!nationality) {
    return null
  }

  const flag = getCountryFlag(nationality)
  if (!flag) {
    return null
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <span
      className={cn('inline-flex items-center', sizeClasses[size], className)}
      title={`Nationality: ${nationality}`}
    >
      {flag}
    </span>
  )
}

