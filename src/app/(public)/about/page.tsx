'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Target, Eye } from 'lucide-react'

interface Settings {
  colorPrimary: string
  colorSecondary: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  fontFamily: string
  aboutHeroTitle: string
  aboutHeroSubtitle: string
  aboutStoryTitle: string
  aboutStoryContent: string
  aboutMission: string
  aboutVision: string
  aboutTeamTitle: string
  aboutTeam: any
  siteName: string
}

function AboutContent() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const primaryColor = '#c4367b'

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/public/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-4 bg-gray-200 rounded w-24 mb-6 animate-pulse" />
        <div className="rounded-2xl p-10 mb-12 bg-gray-200 animate-pulse h-40" />
        <div className="max-w-3xl mx-auto mb-16">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4" />
              <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const secondaryColor = settings?.colorSecondary || '#f5dbe8'
  const headingFontSize = settings?.headingFontSize || '32px'
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">About</span>
      </nav>

      <div className="rounded-2xl p-10 text-center mb-12" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
        <h1 className="font-bold text-white" style={{ fontSize: headingFontSize }}>{settings?.aboutHeroTitle || 'About Us'}</h1>
        <p className="text-white/80 max-w-2xl mx-auto" style={{ fontSize: bodyFontSize }}>{settings?.aboutHeroSubtitle || 'Learn more about our journey'}</p>
      </div>

      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="font-bold text-gray-800 text-center mb-4" style={{ fontSize: headingFontSize }}>{settings?.aboutStoryTitle || 'Our Story'}</h2>
        <p className="text-gray-600 text-center leading-relaxed" style={{ fontSize: bodyFontSize }}>{settings?.aboutStoryContent || 'We are passionate about bringing beauty to everyone...'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
            <Target className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2" style={{ fontSize: bodyFontSize }}>Our Mission</h3>
          <p className="text-gray-600" style={{ fontSize: bodyFontSize }}>{settings?.aboutMission || ''}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
            <Eye className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2" style={{ fontSize: bodyFontSize }}>Our Vision</h3>
          <p className="text-gray-600" style={{ fontSize: bodyFontSize }}>{settings?.aboutVision || ''}</p>
        </div>
      </div>

      {Array.isArray(settings?.aboutTeam) && settings!.aboutTeam.length > 0 && (
        <div className="mb-16">
          <h2 className="font-bold text-gray-800 text-center mb-8" style={{ fontSize: headingFontSize }}>{settings?.aboutTeamTitle || 'Meet Our Team'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {settings!.aboutTeam.map((member: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-2" style={{ borderColor: primaryColor }} />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold" style={{ backgroundColor: primaryColor }}>
                    {member.name?.charAt(0) || 'T'}
                  </div>
                )}
                <h4 className="font-semibold text-gray-800" style={{ fontSize: bodyFontSize }}>{member.name}</h4>
                <p className="text-gray-500" style={{ fontSize: smallFontSize }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[
          { value: '500+', label: 'Happy Customers' },
          { value: '50+', label: 'Products' },
          { value: '20+', label: 'Services' },
          { value: '5+', label: 'Years Experience' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="font-bold" style={{ color: primaryColor, fontSize: headingFontSize }}>{stat.value}</p>
            <p className="text-gray-500" style={{ fontSize: smallFontSize }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-10 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
        <h2 className="font-bold text-white mb-3" style={{ fontSize: headingFontSize }}>Ready to Glow?</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto" style={{ fontSize: bodyFontSize }}>Book your appointment today and experience the best beauty services</p>
        <Link href="/booking" className="inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95" style={{ fontSize: bodyFontSize }}>Book Now</Link>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#c4367b' }} />
      </div>
    }>
      <AboutContent />
    </Suspense>
  )
}