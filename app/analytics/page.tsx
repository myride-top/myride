'use client'

import React from 'react'
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard'
import MainNavbar from '@/components/navbar/main-navbar'

export default function AnalyticsPage() {
  return (
    <>
      <MainNavbar showCreateButton={true} />
      <div className='container mx-auto px-4 pb-8 pt-28'>
        <AnalyticsDashboard />
      </div>
    </>
  )
}
