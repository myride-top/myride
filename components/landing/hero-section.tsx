'use client'

import React from 'react'
import { ChevronDown, Car, Users, Zap, Shield } from 'lucide-react'
import CTAButton from '@/components/common/cta-button'
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
  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 pt-28 lg:pt-0'>
      {/* Simplified background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl' />
      </div>

      <Container className='text-center'>
        {/* Main heading */}
        <div className='animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <h1 className='text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-6 py-2'>
            MyRide
          </h1>
        </div>

        {/* Subtitle */}
        <p className='text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
          Showcase your car to friends and audience with our super fast and
          easy-to-use platform. Connect with fellow car enthusiasts and share
          your automotive passion.
        </p>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'>
          <CTAButton href="/register">
            Get Started Free
          </CTAButton>
          <CTAButton 
            href="/browse" 
            gradient={false}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Explore Cars
          </CTAButton>
        </div>

        {/* Features Grid */}
        <div className='max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'>
          <Grid cols={4} gap="md">
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

        {/* Scroll indicator */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in fade-in duration-1000 delay-600'>
          <div className='flex flex-col items-center text-muted-foreground'>
            <span className='text-sm mb-2'>Scroll to explore</span>
            <ChevronDown className='h-6 w-6 animate-bounce' />
          </div>
        </div>
      </Container>
    </section>
  )
}
