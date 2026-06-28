'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Settings {
  siteName: string
  logoUrl: string | null
  colorPrimary: string
  colorButton: string
  whatsappNumber: string | null
}

interface HeaderProps {
  settings?: Settings | null
}

export default function Header({ settings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const primaryColor = '#c4367b'
  const buttonColor = '#c4367b'
  const siteName = settings?.siteName || 'Beauty Studio'

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Promo', href: '/promo' },
    { label: 'Blog', href: '/blog' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white/80 backdrop-blur-sm shadow-sm'
      }`}
    >
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-gray-600 hover:text-[#c4367b] transition-colors rounded-lg hover:bg-[#f5dbe8]/30"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="ml-2 px-5 py-2 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md active:scale-95"
            style={{ backgroundColor: buttonColor }}
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden border-t border-gray-100 animate-in">
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2.5 text-gray-600 hover:text-[#c4367b] hover:bg-[#f5dbe8]/30 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/booking"
                className="mt-2 px-4 py-2.5 rounded-lg text-white text-center font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: buttonColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
