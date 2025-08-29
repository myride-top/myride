'use client'

import React from 'react'
import { ChevronDown, Car, Users, Zap, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
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

      <div className='text-center max-w-6xl mx-auto px-4'>
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
              console.log('Explore Cars button clicked')
              window.location.href = '/browse'
            }}
            className='group relative z-10 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary border-2 border-primary rounded-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 cursor-pointer'
          >
            Explore Cars
            <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
          </button>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className='group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-500'
              style={{ animationDelay: `${400 + index * 50}ms` }}
            >
              <div className='flex flex-col items-center text-center'>
                <div className='p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4'>
                  <feature.icon className='h-8 w-8 text-primary' />
                </div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>
                  {feature.title}
                </h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in fade-in duration-1000 delay-600'>
          <div className='flex flex-col items-center text-muted-foreground'>
            <span className='text-sm mb-2'>Scroll to explore</span>
            <ChevronDown className='h-6 w-6 animate-bounce' />
          </div>
        </div>
      </div>
    </section>
  )
}
