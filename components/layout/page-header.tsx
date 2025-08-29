import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24',
        className
      )}
    >
      <div className='flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0'>
        <div className='flex items-center'>
          {backHref && (
            <Link
              href={backHref}
              className='mr-4 flex items-center gap-1 text-foreground hover:text-foreground/80 transition-colors cursor-pointer'
            >
              <ArrowLeft className='w-5 h-5' />
            </Link>
          )}
          <div className='min-w-0 flex-1'>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground truncate'>{title}</h1>
            {subtitle && (
              <div className='text-sm text-muted-foreground truncate'>{subtitle}</div>
            )}
          </div>
        </div>
        {actions && (
          <div className='flex flex-wrap items-center gap-2 sm:gap-4'>{actions}</div>
        )}
      </div>
    </div>
  )
}
