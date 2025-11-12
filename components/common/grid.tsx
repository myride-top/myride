import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  mobileCols?: 1 | 2 | 3 | 4 | 5 | 6
  mobileGap?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Grid = ({
  children,
  className = '',
  cols = 3,
  gap = 'md',
  responsive = true,
  mobileCols,
  mobileGap,
}: GridProps) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10',
  }

  let responsiveCols: string
  let responsiveGap: string

  if (mobileCols && responsive) {
    // Custom responsive behavior: mobileCols on mobile, cols on desktop
    const mobileColsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    }
    const desktopColsMap: Record<number, string> = {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6',
    }
    responsiveCols = `${mobileColsMap[mobileCols]} ${desktopColsMap[cols]}`
  } else if (responsive) {
    // Default responsive behavior
    const defaultResponsiveCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    }
    responsiveCols = defaultResponsiveCols[cols]
  } else {
    // Non-responsive behavior
    const nonResponsiveColsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    }
    responsiveCols = nonResponsiveColsMap[cols]
  }

  // Handle responsive gaps
  if (mobileGap && responsive) {
    responsiveGap = `${gapClasses[mobileGap]} md:${gapClasses[gap]}`
  } else {
    responsiveGap = gapClasses[gap]
  }

  return (
    <div className={cn('grid', responsiveCols, responsiveGap, className)}>
      {children}
    </div>
  )
}
