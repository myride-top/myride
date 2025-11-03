'use client'

import React from 'react'
import { Github, Instagram, Mail } from 'lucide-react'
import Link from 'next/link'
import { TikTokIcon } from '../icons/social-media-icon'

const socialLinks = [
  { name: 'TikTok', icon: TikTokIcon, href: 'https://tiktok.com/@baudys.me' },
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://instagram.com/baudys.me',
  },
  { name: 'GitHub', icon: Github, href: 'https://github.com/baudys' },
  { name: 'Email', icon: Mail, href: 'mailto:support@myride.top' },
]

export const Footer = () => {
  return (
    <footer className='bg-card border-t border-border/50'>
      <div className='max-w-7xl mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <div className='flex items-center mb-4'>
              <img src='/logo.svg' alt='MyRide' className='h-8 w-auto' />
            </div>
            <p className='text-muted-foreground mb-4 max-w-sm'>
              The ultimate platform for car enthusiasts to showcase their rides
              and connect with fellow automotive lovers worldwide.
            </p>

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
        </div>

        <div className='mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
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
