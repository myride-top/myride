import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center px-6 py-12 max-w-lg'>
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-muted-foreground/30 select-none'>
            404
          </h1>
        </div>

        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-foreground mb-4 tracking-tight'>
            Page Not Found
          </h2>
          <p className='text-lg text-muted-foreground max-w-md mx-auto'>
            The page you&apos;re looking for doesn&apos;t exist. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Button asChild size='lg'>
            <Link href='/'>Go Home</Link>
          </Button>
          <Button variant='outline' asChild size='lg'>
            <Link href='/browse'>Browse Cars</Link>
          </Button>
        </div>

        <div className='mt-12 text-sm text-muted-foreground'>
          <p>
            Need help? Contact us at{' '}
            <a
              href='mailto:support@myride.top'
              className='underline hover:text-foreground transition-colors'
            >
              support@myride.top
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
