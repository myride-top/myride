'use client'

import React from 'react'
import { ChevronDown, Car, Users, Zap, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FeatureCard, { Feature } from '@/components/common/feature-card'
import Container from '@/components/common/container'
import Grid from '@/components/common/grid'

const features: Feature[] = [
  {
    icon: Car,
    title: 'Showcase Your Ride',
    description:
      'Display your car with stunning photos and detailed specifications',
  },
  {
    icon: Users,
    title: 'Connect with Enthusiasts',
    description: 'Share your passion with a community of car lovers',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Super fast and responsive platform for the best experience',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is safe with enterprise-grade security',
  },
]

export default function HeroSection() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/register')
  }

  const handleExploreCars = () => {
    router.push('/browse')
  }

  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 pt-28'>
      {/* Simplified background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl' />
      </div>

      <Container className='text-center'>
        {/* Subtitle */}
        <p className='text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
          Showcase your car to friends and audience with our super fast and
          easy-to-use platform. Connect with fellow car enthusiasts and share
          your automotive passion.
        </p>

        <div className='grid grid-cols-2 gap-4'>
          <div className='border-2 border-primary rounded-xl p-1'>
            <img
              src='/hero-1.webp'
              alt='Platform Showcase'
              className='rounded-xl'
            />
          </div>

          <div className='border-2 border-primary rounded-xl p-1'>
            <img
              src='/hero-2.webp'
              alt='Platform Showcase'
              className='rounded-xl'
            />
          </div>
        </div>

        {/* CTA Buttons - Updated Design */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 mt-10'>
          <button
            onClick={handleGetStarted}
            className='group px-8 py-4 bg-gradient-to-r from-primary to-primary/50 text-primary-foreground font-bold rounded-full hover:from-primary/90 hover:to-primary/40 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer'
          >
            Get Started Free
            <svg
              className='w-5 h-5 group-hover:translate-x-1 transition-transform'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
            </svg>
          </button>
          <button
            onClick={handleExploreCars}
            className='px-8 py-4 border-2 border-primary/30 text-primary font-bold rounded-full hover:bg-primary/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 cursor-pointer'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            Explore Cars
          </button>
        </div>

        {/* Features Grid */}
        <div className='max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'>
          <Grid cols={4} gap='md'>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                className='animate-in fade-in slide-in-from-bottom-4'
                index={index}
              />
            ))}
          </Grid>
        </div>
      </Container>
    </section>
  )
}
