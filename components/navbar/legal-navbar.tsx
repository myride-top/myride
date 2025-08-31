'use client'

import React from 'react'
import BaseNavbar from './base-navbar'
import BackButton from '@/components/common/back-button'

export default function LegalNavbar() {
  return (
    <BaseNavbar
      variant='minimal'
      showLogo={true}
      logoHref='/'
    >
      <BackButton href="/" variant="ghost">
        Back to Home
      </BackButton>
    </BaseNavbar>
  )
}
