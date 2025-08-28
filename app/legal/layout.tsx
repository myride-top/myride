import Link from 'next/link'
import { ArrowLeft, Car } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href='/'
              className='flex items-center gap-2 text-foreground hover:text-primary transition-colors'
            >
              <Car className='h-6 w-6' />
              <span className='text-xl font-bold'>MyRide</span>
            </Link>

            <Link
              href='/'
              className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1'>{children}</main>

      {/* Footer */}
      <footer className='border-t border-border/50 bg-card/50 mt-16'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='text-center text-muted-foreground'>
            <p className='text-sm'>
              © {new Date().getFullYear()} Daniel Anthony Baudyš. All rights
              reserved.
            </p>
            <div className='flex justify-center gap-6 mt-4 text-sm'>
              <Link
                href='/legal/terms'
                className='hover:text-primary transition-colors'
              >
                Terms of Service
              </Link>
              <Link
                href='/legal/privacy'
                className='hover:text-primary transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/legal/cookies'
                className='hover:text-primary transition-colors'
              >
                Cookie Policy
              </Link>
              <Link
                href='/legal/licenses'
                className='hover:text-primary transition-colors'
              >
                Licenses
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
