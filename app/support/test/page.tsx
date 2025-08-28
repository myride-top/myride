'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function StripeTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testStripeConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-stripe')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testPaymentLink = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/create-support-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 500, // $5.00
          description: 'Test payment',
          metadata: {
            test: 'true',
          },
        }),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-2xl font-bold mb-6'>Stripe Integration Test</h1>

      <div className='space-y-4'>
        <Button
          onClick={testStripeConnection}
          disabled={isLoading}
          className='mr-4'
        >
          {isLoading ? 'Testing...' : 'Test Stripe Connection'}
        </Button>

        <Button
          onClick={testPaymentLink}
          disabled={isLoading}
          variant='outline'
        >
          {isLoading ? 'Testing...' : 'Test Payment Link Creation'}
        </Button>
      </div>

      {testResult && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Test Results:</h2>
          <pre className='bg-gray-100 p-4 rounded-lg overflow-auto'>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
