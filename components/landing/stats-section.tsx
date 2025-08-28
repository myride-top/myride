'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Car, Users, Heart, Star } from 'lucide-react'
import { getPlatformStats, PlatformStats } from '@/lib/database/stats-client'

const stats = [
  {
    icon: Car,
    key: 'totalCars' as keyof PlatformStats,
    suffix: '+',
    label: 'Cars Showcased',
    color: 'text-blue-500',
  },
  {
    icon: Users,
    key: 'totalUsers' as keyof PlatformStats,
    suffix: '+',
    label: 'Active Users',
    color: 'text-green-500',
  },
  {
    icon: Heart,
    key: 'totalLikes' as keyof PlatformStats,
    suffix: '+',
    label: 'Likes Given',
    color: 'text-red-500',
  },
  {
    icon: Star,
    key: 'averageRating' as keyof PlatformStats,
    suffix: '/5',
    label: 'User Rating',
    color: 'text-yellow-500',
  },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
      className='text-4xl md:text-5xl font-bold'
    >
      {count}
      {suffix}
    </motion.span>
  )
}

export default function StatsSection() {
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalCars: 0,
    totalUsers: 0,
    totalLikes: 0,
    averageRating: 4.9,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getPlatformStats()
        setPlatformStats(stats)
      } catch (error) {
        console.error('Error fetching platform stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <section
      id='community'
      className='py-20 bg-gradient-to-r from-muted/30 to-background'
    >
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Trusted by Car Enthusiasts Worldwide
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Join thousands of car lovers who are already showcasing their rides
            and connecting with the community
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className='text-center group'
            >
              <div className='relative'>
                <div className='p-4 rounded-2xl bg-card border border-border/50 group-hover:border-primary/50 transition-all duration-300 mb-6'>
                  <stat.icon
                    className={`h-12 w-12 mx-auto ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                </div>
                <motion.div
                  className='absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full'
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-center gap-1'>
                  {loading ? (
                    <div className='text-4xl md:text-5xl font-bold text-muted-foreground'>
                      ...
                    </div>
                  ) : (
                    <AnimatedCounter
                      value={platformStats[stat.key]}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <p className='text-muted-foreground font-medium'>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional visual element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className='mt-16 text-center'
        >
          <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20'>
            <div className='flex -space-x-2'>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className='w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-background'
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className='text-sm font-medium text-primary'>
              Growing community
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
