'use client'

import { motion } from 'framer-motion'
import { Camera, Settings, Share2, Smartphone, Globe, Zap } from 'lucide-react'

const features = [
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
    <section id='features' className='py-20 bg-background'>
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Everything You Need to Showcase Your Ride
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Powerful features designed specifically for car enthusiasts to
            create the perfect showcase
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className='group relative'
            >
              <div className='relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 h-full'>
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative p-3 rounded-xl ${feature.bgColor} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon
                    className={`h-8 w-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                  />
                </div>

                {/* Content */}
                <div className='relative'>
                  <h3 className='text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors'>
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>
                </div>

                {/* Hover effect overlay */}
                <motion.div
                  className='absolute inset-0 rounded-2xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  initial={false}
                  whileHover={{ scale: 1.02 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className='text-center mt-16'
        >
          <div className='inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20'>
            <div className='flex items-center gap-2'>
              <motion.div
                className='w-3 h-3 bg-primary rounded-full'
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className='text-sm font-medium text-primary'>
                Ready to get started?
              </span>
            </div>
            <motion.button
              onClick={() => {
                console.log('Start Showcasing button clicked from features')
                window.location.href = '/register'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer'
            >
              Start Showcasing
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
