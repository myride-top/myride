'use client'

import React from 'react'
import { Users, Car, Camera, Heart } from 'lucide-react'
import StatsCard, { Stat } from '@/components/common/stats-card'
import SectionHeader from '@/components/common/section-header'
import Grid from '@/components/common/grid'
import Section from '@/components/common/section'

const stats: Stat[] = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Car Enthusiasts',
    description: 'Join our growing community of passionate car lovers',
  },
  {
    icon: Car,
    value: '5,000+',
    label: 'Cars Showcased',
    description: 'Amazing vehicles from around the world',
  },
  {
    icon: Camera,
    value: '50,000+',
    label: 'Photos Shared',
    description: 'High-quality images of stunning rides',
  },
  {
    icon: Heart,
    value: '100,000+',
    label: 'Likes Given',
    description: 'Support and appreciation from the community',
  },
]

export default function StatsSection() {
  return (
    <Section background="muted">
      <SectionHeader
        title="Join the Fastest Growing Car Community"
        description="See what our community has accomplished and be part of something amazing"
      />

      <Grid cols={4} gap="md">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.label}
            stat={stat}
            className='animate-in fade-in slide-in-from-bottom-4'
            variant={index === 0 ? 'highlighted' : 'default'}
          />
        ))}
      </Grid>

      {/* Additional stats row */}
      <div className='mt-16'>
        <Grid cols={3} gap="md">
          <StatsCard
            stat={{
              icon: Users,
              value: '99.9%',
              label: 'Uptime',
              description: 'Reliable platform you can count on',
            }}
            variant="minimal"
            className='animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'
          />
          <StatsCard
            stat={{
              icon: Car,
              value: '< 100ms',
              label: 'Load Time',
              description: 'Lightning fast performance',
            }}
            variant="minimal"
            className='animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400'
          />
          <StatsCard
            stat={{
              icon: Camera,
              value: '24/7',
              label: 'Support',
              description: 'We\'re here when you need us',
            }}
            variant="minimal"
            className='animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500'
          />
        </Grid>
      </div>
    </Section>
  )
}
