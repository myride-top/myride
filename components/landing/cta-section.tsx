'use client'

import React from 'react'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getPlatformStats } from '@/lib/database/stats-client'

const benefits = [
  'Unlimited car showcases',
  'High-quality photo galleries',
  'Detailed specifications',
  'Easy sharing & social features',
  'Mobile optimized',
  'Free forever',
]

interface CTASectionProps {
  initialUserCount?: number
}

export default function CTASection({ initialUserCount }: CTASectionProps) {
  const [userCount, setUserCount] = useState<number>(initialUserCount || 0)
  const [loading, setLoading] = useState(!initialUserCount)

  useEffect(() => {
    if (!initialUserCount) {
      const fetchUserCount = async () => {
        try {
          const stats = await getPlatformStats()
          setUserCount(stats.totalUsers)
        } catch (error) {
          setUserCount(5000) // Fallback to default value
        } finally {
          setLoading(false)
        }
      }

      fetchUserCount()
    }
  }, [initialUserCount])

  return (
    <section className='py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5'>
      <div className='max-w-4xl mx-auto px-4 text-center'>
        <div className='relative animate-in fade-in slide-in-from-bottom-4 duration-700'>
          {/* Static sparkles */}
          <div className='absolute -top-8 -left-8 text-primary/30'>
            <Sparkles className='h-8 w-8' />
          </div>
          <div className='absolute -top-4 -right-4 text-secondary/30'>
            <Sparkles className='h-6 w-6' />
          </div>

          <h2 className='text-4xl md:text-5xl font-bold text-foreground mb-6'>
            Ready to Showcase Your Ride?
          </h2>
          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed'>
            Join thousands of car enthusiasts who are already showcasing their
            rides and connecting with the community. It&apos;s completely free
            and takes just minutes to get started.
          </p>
        </div>

        {/* Benefits grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'>
          {benefits.map((benefit, index) => (
            <div
              key={benefit}
              className='flex items-center gap-3 text-left animate-in fade-in slide-in-from-left-4 duration-500'
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <CheckCircle className='h-5 w-5 text-green-500 flex-shrink-0' />
              <span className='text-foreground font-medium'>{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400'>
          <Link
            href='/register'
            className='group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          >
            <span className='relative z-10 flex items-center gap-2'>
              Get Started Free
              <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
            </span>
            <div className='absolute inset-0 bg-gradient-to-r from-primary to-secondary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300' />
          </Link>
          <button
            onClick={() => {
              window.location.href = '/browse'
            }}
            className='group relative z-10 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary border-2 border-primary rounded-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 cursor-pointer'
          >
            Explore Cars
            <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
          </button>
        </div>

        {/* Trust indicators */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground animate-in fade-in duration-700 delay-600'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
            <span>No credit card required</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
            <span>Setup in under 2 minutes</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse' />
            <span>Free forever</span>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className='mt-12 animate-in fade-in scale-in-95 duration-700 delay-800'>
          <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20'>
            <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
            <span className='text-sm font-medium text-primary'>
              {loading
                ? 'Join car enthusiasts'
                : `Join ${userCount.toLocaleString()}+ car enthusiasts`}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
