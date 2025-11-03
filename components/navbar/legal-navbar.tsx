'use client'

import { BaseNavbar } from './base-navbar'
import { BackButton } from '@/components/common/back-button'

export const LegalNavbar = () => {
  return (
    <BaseNavbar variant='minimal' showLogo={true} logoHref='/'>
      <BackButton href='/' variant='ghost'>
        Back to Home
      </BackButton>
    </BaseNavbar>
  )
}
