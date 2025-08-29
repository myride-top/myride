'use client'

import React from 'react'
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
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1500 // 1.5 seconds
          const steps = 30
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
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span
      ref={ref}
      className='text-4xl md:text-5xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500'
    >
      {count}
      {suffix}
    </span>
  )
}

interface StatsSectionProps {
  initialStats?: PlatformStats
}

export default function StatsSection({ initialStats }: StatsSectionProps) {
  const [platformStats, setPlatformStats] = useState<PlatformStats>(
    initialStats || {
      totalCars: 0,
      totalUsers: 0,
      totalLikes: 0,
      averageRating: 4.9,
    }
  )
  const [loading, setLoading] = useState(!initialStats)

  useEffect(() => {
    if (!initialStats) {
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
    }
  }, [initialStats])

  return (
    <section
      id='community'
      className='py-20 bg-gradient-to-r from-muted/30 to-background'
    >
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            Trusted by Car Enthusiasts Worldwide
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Join thousands of car lovers who are already showcasing their rides
            and connecting with the community
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className='text-center group animate-in fade-in slide-in-from-bottom-4 duration-500 hover:-translate-y-1 hover:scale-[1.02] transition-transform'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className='relative'>
                <div className='p-4 rounded-2xl bg-card border border-border/50 group-hover:border-primary/50 transition-all duration-300 mb-6'>
                  <stat.icon
                    className={`h-12 w-12 mx-auto ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                </div>
                <div className='absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse' />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-center gap-1'>
                  {loading ? (
                    <div className='text-4xl md:text-5xl font-bold text-muted-foreground animate-pulse'>
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
            </div>
          ))}
        </div>

        {/* Additional visual element */}
        <div className='mt-16 text-center animate-in fade-in scale-in-95 duration-700 delay-500'>
          <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20'>
            <div className='flex -space-x-2'>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className='w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-background'
                />
              ))}
            </div>
            <span className='text-sm font-medium text-primary'>
              Growing community
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
