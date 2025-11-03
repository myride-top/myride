import Link from 'next/link'

export const MinimalFooter = () => {
  return (
    <footer className='border-t border-border/50 bg-background/50 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <p className='text-xs text-center text-muted-foreground'>
          &copy; {new Date().getFullYear()} MyRide. All rights reserved. Created
          by{' '}
          <Link href='https://baudys.dev' className='underline'>
            Daniel Anthony Baudyš
          </Link>
        </p>
      </div>
    </footer>
  )
}
