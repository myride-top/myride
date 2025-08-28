import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24', className)}>
      <div className='flex justify-between items-center'>
        <div className='flex items-center'>
          {backHref && (
            <Link 
              href={backHref} 
              className='mr-4 flex items-center gap-1 text-foreground hover:text-foreground/80 transition-colors cursor-pointer'
            >
              <ArrowLeft className='w-5 h-5' />
              <span className='hidden sm:inline'>{backLabel}</span>
            </Link>
          )}
          <div>
            <h1 className='text-3xl font-bold text-foreground'>{title}</h1>
            {subtitle && (
              <div className='text-sm text-muted-foreground'>{subtitle}</div>
            )}
          </div>
        </div>
        {actions && (
          <div className='flex items-center space-x-4'>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
