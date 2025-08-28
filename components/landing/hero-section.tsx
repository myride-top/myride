'use client'

import { motion } from 'framer-motion'
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
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl'
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className='absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl'
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className='text-center max-w-6xl mx-auto px-4'>
        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className='text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-6 py-2'>
            MyRide
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed'
        >
          Showcase your car to friends and audience with our super fast and
          easy-to-use platform. Connect with fellow car enthusiasts and share
          your automotive passion.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className='flex flex-col sm:flex-row gap-4 justify-center mb-16'
        >
          <Link
            href='/register'
            className='group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          >
            <span className='relative z-10 flex items-center gap-2'>
              Get Started Free
              <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
            </span>
            <motion.div
              className='absolute inset-0 bg-gradient-to-r from-primary to-secondary'
              initial={{ x: '-100%' }}
              whileHover={{ x: '0%' }}
              transition={{ duration: 0.3 }}
            />
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
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto'
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className='group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300'
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
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className='absolute bottom-4 left-1/2 transform -translate-x-1/2'
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className='flex flex-col items-center text-muted-foreground'
          >
            <span className='text-sm mb-2'>Scroll to explore</span>
            <ChevronDown className='h-6 w-6' />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
