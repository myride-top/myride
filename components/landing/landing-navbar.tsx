'use client'

import { motion } from 'framer-motion'
import { Car, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'Community', href: '#community' },
  { name: 'About', href: '#about' },
]

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50'
    >
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className='flex items-center gap-2'
          >
            <Car className='h-8 w-8 text-primary' />
            <span className='text-xl md:text-2xl font-black text-primary'>
              MyRide
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-8'>
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className='hidden md:flex items-center gap-4'>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href='/login'
                className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link
                href='/register'
                className='px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors duration-300'
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='md:hidden p-2 rounded-lg hover:bg-muted transition-colors'
          >
            {isMenuOpen ? (
              <X className='h-6 w-6 text-foreground' />
            ) : (
              <Menu className='h-6 w-6 text-foreground' />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className='md:hidden overflow-hidden'
        >
          <div className='py-4 space-y-4 border-t border-border/50'>
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isMenuOpen ? 1 : 0,
                  x: isMenuOpen ? 0 : -20,
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setIsMenuOpen(false)}
                className='block text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
              >
                {item.name}
              </motion.a>
            ))}
            <div className='pt-4 space-y-3 border-t border-border/50'>
              <Link
                href='/login'
                onClick={() => setIsMenuOpen(false)}
                className='block text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
              >
                Sign In
              </Link>
              <Link
                href='/register'
                onClick={() => setIsMenuOpen(false)}
                className='block px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors duration-300 text-center'
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}
