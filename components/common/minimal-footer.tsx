import Link from 'next/link'

export const MinimalFooter = () => {
  return (
    <footer className='border-t border-border/50 bg-background/50 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground'>
            <Link
              href='/legal/terms'
              className='hover:text-primary transition-colors'
            >
              Terms
            </Link>
            <span className='text-muted-foreground/50'>•</span>
            <Link
              href='/legal/privacy'
              className='hover:text-primary transition-colors'
            >
              Privacy
            </Link>
            <span className='text-muted-foreground/50'>•</span>
            <Link
              href='/legal/cookies'
              className='hover:text-primary transition-colors'
            >
              Cookies
            </Link>
            <span className='text-muted-foreground/50'>•</span>
            <Link
              href='/legal/licenses'
              className='hover:text-primary transition-colors'
            >
              Licenses
            </Link>
          </div>
          <p className='text-xs text-center text-muted-foreground'>
            &copy; {new Date().getFullYear()} MyRide. All rights reserved.
            Created by{' '}
            <Link href='https://baudys.dev' className='underline'>
              Daniel Anthony Baudyš
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
