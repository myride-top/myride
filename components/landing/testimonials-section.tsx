'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Car Enthusiast',
    avatar: 'AC',
    content:
      'MyRide has completely transformed how I showcase my car collection. The platform is incredibly intuitive and the community is amazing!',
    rating: 5,
    car: 'BMW M3 Competition',
  },
  {
    name: 'Sarah Johnson',
    role: 'Photographer',
    avatar: 'SJ',
    content:
      'As a car photographer, I love how MyRide lets me display my work beautifully. The photo galleries are stunning and load super fast.',
    rating: 5,
    car: 'Porsche 911 GT3',
  },
  {
    name: 'Mike Rodriguez',
    role: 'Mechanic',
    avatar: 'MR',
    content:
      'Perfect platform for showing off my custom builds. The detailed specifications section lets me highlight all the work I put into each car.',
    rating: 5,
    car: 'Custom Honda Civic',
  },
  {
    name: 'Emma Wilson',
    role: 'Racing Driver',
    avatar: 'EW',
    content:
      'MyRide helped me connect with other racing enthusiasts and showcase my track car. The sharing features are incredible!',
    rating: 5,
    car: 'Nissan GT-R',
  },
  {
    name: 'David Kim',
    role: 'Collector',
    avatar: 'DK',
    content:
      'I manage a collection of classic cars and MyRide is the perfect platform to share them with the world. The privacy controls are excellent.',
    rating: 5,
    car: '1967 Shelby GT500',
  },
  {
    name: 'Lisa Thompson',
    role: 'Car Blogger',
    avatar: 'LT',
    content:
      "The best car showcase platform I've ever used. Clean design, fast performance, and amazing features. Highly recommended!",
    rating: 5,
    car: 'Tesla Model S Plaid',
  },
]

export default function TestimonialsSection() {
  return (
    <section
      id='reviews'
      className='py-20 bg-gradient-to-br from-muted/20 to-background'
    >
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Loved by Car Enthusiasts Worldwide
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            See what our community has to say about their MyRide experience
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className='group relative animate-in fade-in slide-in-from-bottom-4 duration-500 hover:-translate-y-1 hover:scale-[1.01] transition-transform'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className='relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 h-full'>
                {/* Quote icon */}
                <div className='absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity'>
                  <Quote className='h-8 w-8 text-primary' />
                </div>

                {/* Rating */}
                <div className='flex items-center gap-1 mb-4'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-yellow-400 text-yellow-400'
                    />
                  ))}
                </div>

                {/* Content */}
                <p className='text-muted-foreground mb-6 leading-relaxed'>
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Car info */}
                <div className='mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10'>
                  <p className='text-sm font-medium text-primary'>
                    {testimonial.car}
                  </p>
                </div>

                {/* Author */}
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-sm'>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className='font-semibold text-foreground'>
                      {testimonial.name}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Hover effect */}
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500'>
          <div className='inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20'>
            <div className='text-center sm:text-left'>
              <h3 className='text-xl font-semibold text-foreground mb-2'>
                Join Our Growing Community
              </h3>
              <p className='text-muted-foreground'>
                Start showcasing your ride today and connect with fellow
                enthusiasts
              </p>
            </div>
            <button
              onClick={() => {
                console.log('Get Started Free button clicked from testimonials')
                window.location.href = '/register'
              }}
              className='px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95'
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
