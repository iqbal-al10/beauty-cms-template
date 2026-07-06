'use client'

import { useState, useEffect } from 'react'
import { X, Check, Shield, Cookie } from 'lucide-react'
import Link from 'next/link'
import CookieConsentModal from './CookieConsentModal'
import { setCookieConsent, isCookieAccepted } from '@/lib/cookieConsent'

interface CookieConsentProps {
  siteName?: string
  primaryColor?: string
  secondaryBackground?: string
  primaryBackground?: string
  headingColor?: string
  bodyTextColor?: string
  enableConsent?: boolean
}

export default function CookieConsent({ 
  siteName = 'Beauty Studio',
  primaryColor = '#c4367b',
  secondaryBackground = '#f9fafb',
  primaryBackground = '#ffffff',
  headingColor = '#111827',
  bodyTextColor = '#4b5563',
  enableConsent = true
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Cek apakah user sudah memberikan consent
    const consent = localStorage.getItem('cookie_consent')
    const consentTimestamp = localStorage.getItem('cookie_consent_timestamp')
    
    // Jika consent sudah ada dan belum expired (30 hari)
    if (consent && consentTimestamp) {
      const daysSince = (Date.now() - parseInt(consentTimestamp)) / (1000 * 60 * 60 * 24)
      if (daysSince < 30) {
        // Masih dalam masa berlaku
        return
      }
    }
    
    // Jika consent tidak ada atau expired, tampilkan banner
    if (enableConsent) {
      setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, 500)
    }
  }, [enableConsent])

  const handleAccept = () => {
    // Simpan consent penuh ke localStorage
    setCookieConsent('accepted')
    
    // Simpan semua preferensi = true
    localStorage.setItem('cookie_preferences', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }))
    
    // Aktifkan Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
      })
    }
    
    window.dispatchEvent(new Event('cookieConsentAccepted'))
    
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  const handleReject = () => {
    setCookieConsent('rejected')
    
    localStorage.setItem('cookie_preferences', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }))
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
      })
    }
    
    window.dispatchEvent(new Event('cookieConsentRejected'))
    
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleSavePreferences = (preferences: any) => {
    // Simpan preferensi ke localStorage
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences))
    
    // Set consent status
    const hasAnalytics = preferences.analytics || preferences.marketing || preferences.preferences
    setCookieConsent(hasAnalytics ? 'accepted' : 'rejected')
    
    // Update Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied',
      })
    }
    
    window.dispatchEvent(new Event('cookieConsentAccepted'))
    
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <>
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[9999] transform transition-all duration-300 ease-out ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10" />
        
        <div 
          className="mx-auto max-w-7xl px-4 py-4 md:py-6"
          style={{ 
            backgroundColor: primaryBackground || '#ffffff',
            borderTop: `3px solid ${primaryColor}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon & Text */}
            <div className="flex items-start gap-3 flex-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Cookie className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: headingColor, fontSize: '14px' }}>
                  🍪 Kami Menggunakan Cookie
                </h3>
                <p className="text-xs mt-0.5 max-w-2xl" style={{ color: bodyTextColor, opacity: 0.7, fontSize: '12px' }}>
                  Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas, 
                  dan menampilkan konten yang dipersonalisasi. Dengan mengklik "Terima", Anda menyetujui 
                  penggunaan cookie kami sesuai dengan{' '}
                  <Link href="/privacy" className="hover:underline" style={{ color: primaryColor }}>
                    Kebijakan Privasi
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 active:scale-95"
                style={{ 
                  color: bodyTextColor,
                  opacity: 0.7,
                  fontSize: '13px'
                }}
              >
                Reject
              </button>
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 active:scale-95"
                style={{ 
                  color: bodyTextColor,
                  fontSize: '13px'
                }}
              >
                Set
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 shadow-sm"
                style={{ 
                  backgroundColor: primaryColor,
                  fontSize: '13px'
                }}
              >
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Accept All
                </span>
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleReject}
            className="absolute top-2 right-2 md:top-4 md:right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: bodyTextColor, opacity: 0.4 }}
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <CookieConsentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePreferences}
        primaryColor={primaryColor}
        secondaryBackground={secondaryBackground}
        primaryBackground={primaryBackground}
        headingColor={headingColor}
        bodyTextColor={bodyTextColor}
      />
    </>
  )
}

// TypeScript declaration untuk gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}