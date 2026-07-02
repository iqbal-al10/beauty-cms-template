'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  fontFamily: string
  logoUrl: string | null
  navbarBackground: string
  navbarTextColor: string
  navbarHoverColor: string
  navbarActiveColor: string
  enableCart: boolean
  navStyle: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
}

interface HeaderProps {
  settings: Settings | null
}

export default function Header({ settings }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const primaryColor = settings?.colorPrimary || '#c4367b'
  const navbarBg = settings?.navbarBackground || '#ffffff'
  const navbarText = settings?.navbarTextColor || '#4b5563'
  const navbarHover = settings?.navbarHoverColor || '#c4367b'
  const enableCart = settings?.enableCart !== undefined ? settings.enableCart : true
  const siteName = settings?.siteName || 'Beauty Studio'
  const logoUrl = settings?.logoUrl || null
  const bodyFontSize = settings?.bodyFontSize || '16px'
  const smallFontSize = settings?.smallFontSize || '14px'
  const fontFamily = settings?.fontFamily || 'Inter'

  useEffect(() => {
    updateCartCount()

    const handleCartUpdate = () => updateCartCount()
    window.addEventListener('cartUpdate', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate)
    }
  }, [])

  const updateCartCount = () => {
    try {
      const saved = localStorage.getItem('beauty_cart')
      if (saved) {
        const items = JSON.parse(saved)
        const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(total)
      } else {
        setCartCount(0)
      }
    } catch (e) {
      setCartCount(0)
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/booking', label: 'Booking' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header 
      className="sticky top-0 z-50 shadow-sm"
      style={{ 
        backgroundColor: navbarBg,
        fontFamily: fontFamily,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
            ) : (
              <span 
                className="text-xl font-bold"
                style={{ 
                  color: primaryColor,
                  fontSize: bodyFontSize,
                }}
              >
                {siteName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:opacity-70"
                style={{ 
                  color: navbarText,
                  fontSize: smallFontSize,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = navbarHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = navbarText
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {enableCart && (
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: navbarText }}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                    style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: navbarText }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            className="md:hidden py-4 border-t"
            style={{ borderColor: `${navbarText}20` }}
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="transition-colors hover:opacity-70"
                  style={{ 
                    color: navbarText,
                    fontSize: bodyFontSize,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = navbarHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = navbarText
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
