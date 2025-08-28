'use client'

import { motion } from 'framer-motion'
import { Car, Github, Instagram, Mail } from 'lucide-react'
import Link from 'next/link'

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
  product: [{ name: 'Features', href: '#features' }],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ],
  support: [
    { name: 'Help Center', href: '#help' },
    { name: 'Community', href: '#community' },
    { name: 'Status', href: '#status' },
    { name: 'Privacy', href: '#privacy' },
  ],
  legal: [
    { name: 'Terms', href: '#terms' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'Cookies', href: '#cookies' },
    { name: 'Licenses', href: '#licenses' },
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className='flex items-center gap-2 mb-4'
            >
              <Car className='h-8 w-8 text-primary' />
              <span className='text-2xl font-bold text-foreground'>MyRide</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className='text-muted-foreground mb-6 max-w-sm'
            >
              The ultimate platform for car enthusiasts to showcase their rides
              and connect with fellow automotive lovers worldwide.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className='flex items-center gap-4'
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className='p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-300'
                >
                  <social.icon className='h-5 w-5' />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(
            ([category, links], categoryIndex) => (
              <div key={category}>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                  className='text-sm font-semibold text-foreground uppercase tracking-wider mb-4'
                >
                  {category}
                </motion.h3>
                <ul className='space-y-3'>
                  {links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: categoryIndex * 0.1 + linkIndex * 0.05,
                      }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        className='text-muted-foreground hover:text-primary transition-colors duration-300'
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className='border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'
        >
          <p className='text-sm text-muted-foreground'>
            &copy; {new Date().getFullYear()} Daniel Anthony Baudyš. All rights
            reserved.
          </p>
          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <Link
              href='#terms'
              className='hover:text-primary transition-colors'
            >
              Terms of Service
            </Link>
            <Link
              href='#privacy'
              className='hover:text-primary transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='#cookies'
              className='hover:text-primary transition-colors'
            >
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
