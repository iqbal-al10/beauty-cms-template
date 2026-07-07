'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface HeaderProps {
  settings: Settings | null
}

export default function Header({ settings }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  // 🔥 Cek status login
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

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

  // 🔥 Handler logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setIsDropdownOpen(false)
      toast.success('Logout berhasil')
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Gagal logout')
    }
  }

  // 🔥 Cek apakah user bisa akses dashboard (SUPER_ADMIN atau ADMIN)
  const canAccessDashboard = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')

  // 🔥 TAMBAHKAN FAQ DI SINI
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/booking', label: 'Booking' },
    { href: '/blog', label: 'Blog' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/faq', label: 'FAQ' }, // 🔥 TAMBAHKAN INI
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

          {/* Desktop Navigation - TANPA Dashboard di sini */}
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

            {/* 🔥 User Avatar + Dropdown (jika login) */}
            {!loading && user && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors border-2"
                  style={{ borderColor: primaryColor }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800" style={{ fontSize: smallFontSize }}>
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontSize: smallFontSize }}>
                        {user.email}
                      </p>
                      <span 
                        className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {user.role}
                      </span>
                    </div>

                    {/* 🔥 Dashboard ONLY di dropdown (bukan di header nav) */}
                    {canAccessDashboard && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        style={{ fontSize: smallFontSize }}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="font-medium" style={{ color: primaryColor }}>Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      style={{ fontSize: smallFontSize }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
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

              {/* 🔥 Mobile: Dashboard di sini (bukan di nav utama) */}
              {!loading && user && canAccessDashboard && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 font-semibold transition-colors"
                  style={{ 
                    color: primaryColor,
                    fontSize: bodyFontSize,
                  }}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              )}

              {/* Mobile User Info & Logout */}
              {!loading && user && (
                <div className="pt-3 mt-3 border-t" style={{ borderColor: `${navbarText}20` }}>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: navbarText, fontSize: bodyFontSize }}>
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500" style={{ fontSize: smallFontSize }}>
                        {user.email}
                      </p>
                      <span 
                        className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full mt-1"
                    style={{ fontSize: bodyFontSize }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}