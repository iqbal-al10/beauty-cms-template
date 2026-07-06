'use client'

import { useEffect } from 'react'
import { isCookieAccepted } from '@/lib/cookieConsent'

interface GoogleAnalyticsProps {
  trackingId: string
}

export default function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!trackingId) return
    
    // Cek apakah user menyetujui cookie
    const consent = isCookieAccepted()
    
    if (consent) {
      // Initialize GA dengan consent
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'granted',
        })
      }
    } else {
      // Block GA jika tidak ada consent
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
        })
      }
    }
  }, [trackingId])

  return null
}