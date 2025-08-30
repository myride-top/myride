import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='text-center px-6 py-12'>
        {/* 404 Number */}
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-gray-300 dark:text-gray-700 select-none'>
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className='mb-8'>
          <h2 className='text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>
            Page Not Found
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto'>
            Oops! The page you're looking for doesn't exist. It might have been
            moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Button asChild size='lg'>
            <Link href='/'>Go Home</Link>
          </Button>
          <Button variant='outline' asChild size='lg'>
            <Link href='/browse'>Browse Cars</Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className='mt-12 text-sm text-gray-500 dark:text-gray-400'>
          <p>
            Need help? Contact us at{' '}
            <a
              href='mailto:support@myride.top'
              className='underline hover:text-gray-700 dark:hover:text-gray-300'
            >
              support@myride.top
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
