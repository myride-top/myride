'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import BaseNavbar from './base-navbar'

export default function LegalNavbar() {
  return (
    <BaseNavbar
      variant='minimal'
      showLogo={true}
      logoHref='/'
    >
      <Link
        href='/'
        className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        <span>Back to Home</span>
      </Link>
    </BaseNavbar>
  )
}
