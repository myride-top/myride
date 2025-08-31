'use client'

import React from 'react'
import { Camera, Settings, Share2, Smartphone, Globe, Zap } from 'lucide-react'
import FeatureCard, { Feature } from '@/components/common/feature-card'
import SectionHeader from '@/components/common/section-header'
import CTASection from '@/components/common/cta-section'
import Grid from '@/components/common/grid'
import Section from '@/components/common/section'

const features: Feature[] = [
  {
    icon: Camera,
    title: 'Stunning Photo Gallery',
    description:
      'Upload unlimited high-quality photos of your car from every angle. Our optimized platform ensures fast loading and beautiful presentation.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Settings,
    title: 'Detailed Specifications',
    description:
      'Showcase every detail of your ride with comprehensive specifications including engine, performance, and custom modifications.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description:
      'Share your car profile with friends and social media with just one click. Generate beautiful shareable links instantly.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description:
      'Perfect experience on any device. Our responsive design looks great on phones, tablets, and desktops.',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'Connect with car enthusiasts from around the world. Discover amazing rides and share your passion.',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built with modern technology for instant loading and smooth interactions. No waiting, just pure speed.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
  },
]

export default function FeaturesSection() {
  return (
    <Section id="features">
      <SectionHeader
        title="Everything You Need to Showcase Your Ride"
        description="Powerful features designed specifically for car enthusiasts to create the perfect showcase"
      />

      <Grid cols={3} gap="md">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            feature={feature}
            showGradient={true}
            index={index}
          />
        ))}
      </Grid>

      {/* Call to action */}
      <div className='mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500'>
        <CTASection
          title="Ready to get started?"
          variant="highlighted"
          primaryButton={{
            text: "Start Showcasing",
            onClick: () => window.location.href = '/register'
          }}
        />
      </div>
    </Section>
  )
}
