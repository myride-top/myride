import { cn } from '@/lib/utils'
import { MainNavbar } from '../navbar/main-navbar'

interface PageLayoutProps {
  children: React.ReactNode
  showCreateButton?: boolean
  className?: string
  mainClassName?: string
  containerClassName?: string
  /** Content max width. Default 7xl. Use 'full' for unconstrained. */
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  /** Skip outer main padding (e.g. custom headers that handle their own spacing) */
  bare?: boolean
  /** Disable entrance animation */
  animate?: boolean
}

const maxWidthClasses = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-none',
} as const

export const PageLayout = ({
  children,
  showCreateButton = false,
  className = '',
  mainClassName = '',
  containerClassName = '',
  maxWidth = '7xl',
  bare = false,
  animate = true,
}: PageLayoutProps) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <MainNavbar showCreateButton={showCreateButton} />

      <main
        className={cn(
          maxWidthClasses[maxWidth],
          'mx-auto',
          !bare && 'py-4 sm:py-6 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24',
          bare && 'pt-16 sm:pt-20',
          mainClassName
        )}
      >
        <div
          className={cn(
            !bare && 'py-4 sm:py-6',
            animate &&
              'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
            containerClassName
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
