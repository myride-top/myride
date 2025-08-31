'use client'

import React from 'react'
import TestimonialCard, {
  Testimonial,
} from '@/components/common/testimonial-card'
import SectionHeader from '@/components/common/section-header'
import CTASection from '@/components/common/cta-section'
import Grid from '@/components/common/grid'
import Section from '@/components/common/section'

const testimonials: Testimonial[] = [
  {
    name: 'Alex Chen',
    role: 'Car Enthusiast',
    company: 'AutoBlog',
    content:
      "MyRide has completely transformed how I showcase my cars. The platform is incredibly fast and the photo quality is outstanding. I've connected with so many fellow enthusiasts!",
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'Classic Car Collector',
    content:
      'As someone who owns multiple classic cars, I love how easy it is to organize and display each vehicle. The specifications section is perfect for showing off all the details.',
    rating: 5,
  },
  {
    name: 'Mike Rodriguez',
    role: 'Modification Specialist',
    company: 'Custom Motors',
    content:
      'The platform makes it super easy to showcase before and after photos of my car modifications. My clients love being able to see the transformation process.',
    rating: 5,
  },
  {
    name: 'Emma Thompson',
    role: 'Car Photographer',
    content:
      'I use MyRide to showcase my automotive photography work. The platform handles high-resolution images beautifully and loads incredibly fast.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Racing Enthusiast',
    content:
      'Perfect for documenting my racing journey. I can easily share my track day photos and car specs with the racing community.',
    rating: 5,
  },
  {
    name: 'Lisa Wang',
    role: 'Car Dealer',
    company: 'Premium Motors',
    content:
      'We use MyRide to showcase our inventory. The professional presentation helps us sell cars faster and gives customers confidence.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <Section id='reviews'>
      <SectionHeader
        title='Loved by Car Enthusiasts Worldwide'
        description='See what our community has to say about their MyRide experience'
      />

      <Grid cols={3} gap='md'>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.name}
            testimonial={testimonial}
            className='animate-in fade-in slide-in-from-bottom-4'
            variant={index === 0 ? 'featured' : 'default'}
          />
        ))}
      </Grid>

      {/* Call to action */}
      <div className='mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500'>
        <CTASection
          title='Ready to join them?'
          variant='highlighted'
          primaryButton={{
            text: 'Get Started Free',
            onClick: () => (window.location.href = '/register'),
          }}
        />
      </div>
    </Section>
  )
}
