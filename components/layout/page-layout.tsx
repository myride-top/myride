import { cn } from '@/lib/utils'
import { MainNavbar } from '../navbar/main-navbar'

interface PageLayoutProps {
  children: React.ReactNode
  showCreateButton?: boolean
  className?: string
  mainClassName?: string
  containerClassName?: string
}

export const PageLayout = ({
  children,
  showCreateButton = false,
  className = '',
  mainClassName = '',
  containerClassName = '',
}: PageLayoutProps) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <MainNavbar showCreateButton={showCreateButton} />

      <main
        className={cn(
          'max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8 pt-20 sm:pt-24',
          mainClassName
        )}
      >
        <div
          className={cn(
            'px-4 sm:px-0 py-4 sm:py-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
            containerClassName
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
