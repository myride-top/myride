'use client'

import React from 'react'
import { Car, Github, Instagram, Mail } from 'lucide-react'
import Link from 'next/link'
import SupportButton from '@/components/common/support-button'

// Custom TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
  </svg>
)

const footerLinks = {
  '': [{ name: '', href: '' }],
  product: [{ name: 'Features', href: '#features' }],
  community: [
    { name: 'Community', href: '#community' },
    { name: 'Reviews', href: '#reviews' },
  ],
  legal: [
    { name: 'Terms', href: '/legal/terms' },
    { name: 'Privacy', href: '/legal/privacy' },
    { name: 'Cookies', href: '/legal/cookies' },
    { name: 'Licenses', href: '/legal/licenses' },
  ],
}

const socialLinks = [
  { name: 'TikTok', icon: TikTokIcon, href: 'https://tiktok.com/@baudys.me' },
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://instagram.com/baudys.me',
  },
  { name: 'GitHub', icon: Github, href: 'https://github.com/baudys' },
  { name: 'Email', icon: Mail, href: 'mailto:tonyasek007@gmail.com' },
]

export default function Footer() {
  return (
    <footer className='bg-card border-t border-border/50'>
      <div className='max-w-7xl mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <Car className='h-8 w-8 text-primary' />
              <span className='text-2xl font-bold text-primary'>MyRide</span>
            </div>
            <p className='text-muted-foreground mb-4 max-w-sm'>
              The ultimate platform for car enthusiasts to showcase their rides
              and connect with fellow automotive lovers worldwide.
            </p>
            <div className='mb-6'>
              <SupportButton variant='outline' size='sm'>
                Support MyRide
              </SupportButton>
            </div>
            <div className='flex items-center gap-4'>
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-0.5'
                >
                  <social.icon className='h-5 w-5' />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className='ml-auto'>
              <h3 className='text-sm font-semibold text-foreground uppercase tracking-wider mb-4'>
                {category}
              </h3>
              <ul className='space-y-3'>
                {links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-primary transition-colors duration-300'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className='border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-muted-foreground'>
            &copy; {new Date().getFullYear()} Daniel Anthony Baudyš. All rights
            reserved.
          </p>
          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <Link
              href='/legal/terms'
              className='hover:text-primary transition-colors'
            >
              Terms of Service
            </Link>
            <Link
              href='/legal/privacy'
              className='hover:text-primary transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='/legal/cookies'
              className='hover:text-primary transition-colors'
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
