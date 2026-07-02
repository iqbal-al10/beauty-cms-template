'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Cart from '@/components/public/Cart'

interface Settings {
  siteName: string
  logoUrl: string | null
  colorPrimary: string
  colorButton: string
  whatsappNumber: string | null
  enableCart: boolean
  navbarBackground: string
  navbarTextColor: string
  navbarHoverColor: string
  navbarActiveColor: string
  fontFamily: string
}

interface HeaderProps {
  settings?: Settings | null
}

export default function Header({ settings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setIsLoggedIn(true)
          setUserRole(data.role || '')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }
    checkAuth()
  }, [])

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const buttonColor = settings?.colorButton || '#c4367b'
  const siteName = settings?.siteName || 'Beauty Studio'
  const enableCart = settings?.enableCart !== undefined ? settings.enableCart : true
  const navbarBg = settings?.navbarBackground || '#ffffff'
  const navbarText = settings?.navbarTextColor || '#4b5563'
  const navbarHover = settings?.navbarHoverColor || '#c4367b'
  const navbarActive = settings?.navbarActiveColor || '#c4367b'
  const fontFamily = settings?.fontFamily || 'Inter'

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Booking', href: '/booking' },
    { label: 'Blog', href: '/blog' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md shadow-md'
          : 'shadow-sm'
      }`}
      style={{
        backgroundColor: scrolled ? navbarBg : navbarBg,
        fontFamily: fontFamily,
      }}
    >
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings?.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={siteName}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {siteName.charAt(0)}
            </div>
          )}
          <span
            className="text-xl font-bold hidden sm:block"
            style={{ color: primaryColor }}
          >
            {siteName}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm transition-colors rounded-lg"
              style={{
                color: navbarText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = navbarHover
                e.currentTarget.style.backgroundColor = `${navbarHover}15`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = navbarText
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {item.label}
            </Link>
          ))}
          
          {enableCart && <Cart primaryColor={primaryColor} enableCart={enableCart} />}

          {isLoggedIn && (
            <Link
              href="/admin"
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
              }}
            >
              ⚙️ Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {enableCart && <Cart primaryColor={primaryColor} enableCart={enableCart} />}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" style={{ color: navbarText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" style={{ color: navbarText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 shadow-lg md:hidden border-t border-gray-100 animate-in" style={{ backgroundColor: navbarBg }}>
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2.5 rounded-lg transition-colors"
                  style={{ color: navbarText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = navbarHover
                    e.currentTarget.style.backgroundColor = `${navbarHover}15`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = navbarText
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {isLoggedIn && (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⚙️ Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
