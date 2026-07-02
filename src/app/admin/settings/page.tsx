'use client'

import { useEffect, useState } from 'react'
import {
  Camera, Share2, CircleUser, Video, MessageCircle,
  BriefcaseBusiness, Pin, MessageSquare, MapPin, Phone, Mail,
  Menu, ShoppingCart, Home, Package, Calendar,
  FileText, Users, Star, Settings as SettingsIcon,
  Eye, Palette, Type, Image, CreditCard, Search,
  Globe, Lock, Bell, ChevronDown, ChevronRight,
  Plus, Trash2, Edit, Save, X, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Settings {
  id?: string
  siteName: string
  colorPrimary: string
  colorSecondary: string
  colorButton: string
  fontFamily: string
  logoUrl: string
  faviconUrl: string
  heroBannerUrl: string
  whatsappNumber: string
  email: string
  address: string
  footerContent: string
  operatingHours: string
  googleMapsEmbedUrl: string
  socialLinks: string
  gaTrackingId: string
  metaTitle: string
  metaDescription: string
  defaultOgImage: string
  primaryBackground: string
  secondaryBackground: string
  headingColor: string
  bodyTextColor: string
  linkHoverColor: string
  borderRadius: string
  buttonStyle: string
  layoutStyle: string
  navStyle: string
  navbarBackground: string
  navbarTextColor: string
  navbarHoverColor: string
  navbarActiveColor: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  enableCart: boolean
  enableWhatsAppOrder: boolean
  enableGuestCheckout: boolean
  enableReviews: boolean
  enableTestimonials: boolean
  enableBlog: boolean
  enableGallery: boolean
  enableFaq: boolean
  minOrderAmount: number
  maxOrderQuantity: number
  cartExpiryDays: number
  siteDescription: string
  siteKeywords: string
  copyrightText: string
  footerLinks: string
}

const DEFAULT_SETTINGS: Settings = {
  siteName: 'Beauty Studio',
  colorPrimary: '#c4367b',
  colorSecondary: '#f5dbe8',
  colorButton: '#aa1d68',
  fontFamily: 'Inter',
  logoUrl: '',
  faviconUrl: '',
  heroBannerUrl: '',
  whatsappNumber: '',
  email: '',
  address: '',
  footerContent: '',
  operatingHours: '',
  googleMapsEmbedUrl: '',
  socialLinks: '',
  gaTrackingId: '',
  metaTitle: '',
  metaDescription: '',
  defaultOgImage: '',
  primaryBackground: '#ffffff',
  secondaryBackground: '#f9fafb',
  headingColor: '#111827',
  bodyTextColor: '#4b5563',
  linkHoverColor: '#c4367b',
  borderRadius: 'medium',
  buttonStyle: 'rounded',
  layoutStyle: 'full-width',
  navStyle: 'sticky',
  navbarBackground: '#ffffff',
  navbarTextColor: '#4b5563',
  navbarHoverColor: '#c4367b',
  navbarActiveColor: '#c4367b',
  headingFontSize: '32px',
  bodyFontSize: '16px',
  smallFontSize: '14px',
  enableCart: true,
  enableWhatsAppOrder: true,
  enableGuestCheckout: true,
  enableReviews: true,
  enableTestimonials: true,
  enableBlog: true,
  enableGallery: true,
  enableFaq: true,
  minOrderAmount: 0,
  maxOrderQuantity: 99,
  cartExpiryDays: 7,
  siteDescription: '',
  siteKeywords: '',
  copyrightText: '',
  footerLinks: '',
}

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat']
const BORDER_RADIUS_OPTIONS = [
  { value: 'small', label: 'Small (4px)' },
  { value: 'medium', label: 'Medium (8px)' },
  { value: 'large', label: 'Large (12px)' },
]
const BUTTON_STYLE_OPTIONS = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'square', label: 'Square' },
]
const LAYOUT_STYLE_OPTIONS = [
  { value: 'full-width', label: 'Full Width' },
  { value: 'boxed', label: 'Boxed' },
]
const NAV_STYLE_OPTIONS = [
  { value: 'sticky', label: 'Sticky' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'static', label: 'Static' },
]
const FONT_SIZE_OPTIONS = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
  { value: '36px', label: '36px' },
  { value: '40px', label: '40px' },
  { value: '48px', label: '48px' },
]

const SOCIAL_PLATFORMS = [
  { key: 'instagram', icon: Camera, label: 'Instagram', color: '#E4405F', placeholder: 'https://instagram.com/username' },
  { key: 'facebook', icon: Share2, label: 'Facebook', color: '#1877F2', placeholder: 'https://facebook.com/username' },
  { key: 'tiktok', icon: CircleUser, label: 'TikTok', color: '#000000', placeholder: 'https://tiktok.com/@username' },
  { key: 'youtube', icon: Video, label: 'YouTube', color: '#FF0000', placeholder: 'https://youtube.com/@username' },
  { key: 'twitter', icon: MessageCircle, label: 'Twitter / X', color: '#000000', placeholder: 'https://twitter.com/username' },
  { key: 'linkedin', icon: BriefcaseBusiness, label: 'LinkedIn', color: '#0A66C2', placeholder: 'https://linkedin.com/in/username' },
  { key: 'pinterest', icon: Pin, label: 'Pinterest', color: '#E60023', placeholder: 'https://pinterest.com/username' },
  { key: 'threads', icon: MessageSquare, label: 'Threads', color: '#000000', placeholder: 'https://threads.net/@username' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [social, setSocial] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data && data.id) {
        const loadedSettings = { ...DEFAULT_SETTINGS, ...data }
        setSettings(loadedSettings)

        if (data.socialLinks) {
          try {
            const parsed = typeof data.socialLinks === 'string' ? JSON.parse(data.socialLinks) : data.socialLinks
            setSocial(parsed || {})
          } catch (e) {
            console.error('Error parsing social links:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Gagal memuat pengaturan')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (!confirm('Yakin ingin mereset semua pengaturan ke default?')) return
    setSettings(DEFAULT_SETTINGS)
    setSocial({})
    toast.success('Pengaturan direset ke default')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const socialLinks = { ...social }
      const payload = {
        ...settings,
        footerContent: settings.footerContent ? JSON.parse(settings.footerContent) : null,
        operatingHours: settings.operatingHours ? JSON.parse(settings.operatingHours) : null,
        socialLinks: socialLinks,
        footerLinks: settings.footerLinks ? JSON.parse(settings.footerLinks) : null,
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      toast.success('Pengaturan berhasil disimpan!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialChange = (platform: string, value: string) => {
    setSocial(prev => ({ ...prev, [platform]: value }))
  }

  const getBorderRadius = () => {
    switch (settings.borderRadius) {
      case 'small': return '4px'
      case 'large': return '12px'
      default: return '8px'
    }
  }

  const getButtonStyle = () => {
    switch (settings.buttonStyle) {
      case 'pill': return '9999px'
      case 'square': return '0px'
      default: return getBorderRadius()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const hasSocial = (key: string) => social[key] && social[key].trim() !== ''

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-pink-500" />
          Setting Management
        </h1>
        <button
          onClick={handleReset}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset ke Default
        </button>
      </div>

      {/* STICKY LIVE PREVIEW */}
      <div className="sticky top-[-20px] z-10 -mx-6 px-6 bg-gray-50/95 backdrop-blur-sm py-2">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-full">
          <div className="bg-pink-500 px-4 py-0.5 text-white text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Live Preview (Real-time)
            </span>
            <span className="text-white/70 text-[10px]">Perubahan langsung terlihat</span>
          </div>

          <div className="p-3" style={{
            backgroundColor: settings.primaryBackground,
            fontFamily: settings.fontFamily
          }}>
            {/* NAVBAR */}
            <div className="rounded-lg overflow-hidden border border-gray-200" style={{ backgroundColor: settings.navbarBackground }}>
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: settings.colorPrimary }}>
                    {settings.siteName.charAt(0)}
                  </div>
                  <span className="font-bold text-xs truncate max-w-[100px]" style={{ color: settings.colorPrimary, fontSize: settings.smallFontSize }}>
                    {settings.siteName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] hidden sm:inline" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Home</span>
                  <span className="text-[9px] hidden sm:inline" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Products</span>
                  <span className="text-[9px] hidden sm:inline" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Booking</span>
                  <span className="text-[9px] hidden sm:inline" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Blog</span>
                  <ShoppingCart className="w-3.5 h-3.5" style={{ color: settings.navbarTextColor }} />
                  <button className="px-2 py-0.5 rounded-full text-white text-[8px] font-medium" style={{ backgroundColor: settings.colorButton, borderRadius: getButtonStyle() }}>
                    Book
                  </button>
                </div>
              </div>
            </div>

            {/* HERO */}
            <div className="mt-2 p-3 rounded-lg text-center" style={{
              background: `linear-gradient(135deg, ${settings.colorPrimary} 0%, ${settings.colorSecondary} 100%)`,
              minHeight: '60px'
            }}>
              <h2 className="font-bold text-white text-sm" style={{ fontSize: settings.headingFontSize }}>
                Selamat Datang di {settings.siteName}
              </h2>
              <p className="text-white/80 text-xs mt-0.5" style={{ fontSize: settings.bodyFontSize }}>
                Premium beauty services and products for your perfect look
              </p>
              <button className="mt-1 px-4 py-1 rounded-full text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity" style={{
                backgroundColor: settings.colorButton,
                fontSize: settings.smallFontSize,
                borderRadius: getButtonStyle()
              }}>
                Mulai Sekarang
              </button>
            </div>

            {/* FEATURED PRODUCTS */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-gray-800 text-xs" style={{ fontSize: settings.smallFontSize, color: settings.headingColor }}>Featured Products</h3>
                <span className="text-[8px]" style={{ color: settings.colorPrimary, fontSize: settings.smallFontSize }}>View All</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-1.5 border border-gray-100" style={{ borderRadius: getBorderRadius() }}>
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '35px', borderRadius: getBorderRadius() }}>
                      <span className="text-lg">🧴</span>
                    </div>
                    <p className="text-[8px] font-semibold text-gray-800 mt-0.5 truncate" style={{ fontSize: settings.smallFontSize, color: settings.headingColor }}>Product {i}</p>
                    <p className="text-[8px] font-bold" style={{ color: settings.colorPrimary, fontSize: settings.smallFontSize }}>Rp 100K</p>
                    <button className="w-full mt-0.5 py-0.5 rounded-full text-white text-[7px] font-medium transition-opacity hover:opacity-80" style={{ backgroundColor: settings.colorButton, borderRadius: getButtonStyle() }}>
                      Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLOR PALETTE */}
            <div className="mt-2 pt-1.5 border-t border-gray-200">
              <p className="text-[7px] text-gray-400 mb-1">Color Palette</p>
              <div className="flex flex-wrap gap-1">
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">P:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.colorPrimary, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">S:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.colorSecondary, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">B:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.colorButton, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">NB:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.navbarBackground, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">NT:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.navbarTextColor, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">H:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.headingColor, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">Body:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.bodyTextColor, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">BG:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.primaryBackground, borderRadius: '2px' }}></div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] text-gray-500">BG2:</span>
                  <div className="w-3 h-3 rounded border border-gray-200" style={{ backgroundColor: settings.secondaryBackground, borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>

            {/* FOOTER PREVIEW */}
            <div className="mt-2 pt-1.5 border-t border-gray-200" style={{ backgroundColor: settings.secondaryBackground }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold" style={{ color: settings.headingColor, fontSize: settings.smallFontSize }}>
                    {settings.siteName}
                  </span>
                  <p className="text-[7px] text-gray-400 mt-0.5" style={{ fontSize: settings.smallFontSize }}>
                    {settings.copyrightText || `2024 ${settings.siteName}. All rights reserved.`}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {SOCIAL_PLATFORMS.filter(p => hasSocial(p.key)).map((platform) => {
                    const Icon = platform.icon
                    return (
                      <div
                        key={platform.key}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${settings.colorPrimary}15` }}
                      >
                        <Icon className="w-2.5 h-2.5" style={{ color: settings.colorPrimary }} />
                      </div>
                    )
                  })}
                  {SOCIAL_PLATFORMS.filter(p => hasSocial(p.key)).length === 0 && (
                    <span className="text-[7px] text-gray-400">No social links set</span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-0.5 text-[7px] text-gray-400" style={{ fontSize: settings.smallFontSize }}>
                <span>Home</span>
                <span>Products</span>
                <span>Booking</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </div>

            {/* STYLE INDICATORS */}
            <div className="mt-1 pt-1 border-t border-gray-200 flex flex-wrap items-center gap-2">
              <span className="text-[7px] text-gray-400">Style:</span>
              <span className="text-[7px] text-gray-600" style={{ fontSize: settings.smallFontSize }}>
                {settings.fontFamily} / {settings.borderRadius} / {settings.buttonStyle}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 mt-4">
        {/* BRAND IDENTITY */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-pink-500" />
            Brand Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Website</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Beauty Studio"
              />
              <p className="text-xs text-gray-400 mt-1">Akan muncul di header, footer, dan title</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Family</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* COLORS */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary</label>
              <input
                type="color"
                value={settings.colorPrimary}
                onChange={(e) => handleChange('colorPrimary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary</label>
              <input
                type="color"
                value={settings.colorSecondary}
                onChange={(e) => handleChange('colorSecondary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button</label>
              <input
                type="color"
                value={settings.colorButton}
                onChange={(e) => handleChange('colorButton', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link Hover</label>
              <input
                type="color"
                value={settings.linkHoverColor}
                onChange={(e) => handleChange('linkHoverColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BG Utama</label>
              <input
                type="color"
                value={settings.primaryBackground}
                onChange={(e) => handleChange('primaryBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BG Sekunder</label>
              <input
                type="color"
                value={settings.secondaryBackground}
                onChange={(e) => handleChange('secondaryBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Heading Color</label>
              <input
                type="color"
                value={settings.headingColor}
                onChange={(e) => handleChange('headingColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Body Text Color</label>
              <input
                type="color"
                value={settings.bodyTextColor}
                onChange={(e) => handleChange('bodyTextColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* NAVBAR SETTINGS */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Menu className="w-5 h-5 text-pink-500" />
            Navbar Settings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Background</label>
              <input
                type="color"
                value={settings.navbarBackground}
                onChange={(e) => handleChange('navbarBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Text Color</label>
              <input
                type="color"
                value={settings.navbarTextColor}
                onChange={(e) => handleChange('navbarTextColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Hover Color</label>
              <input
                type="color"
                value={settings.navbarHoverColor}
                onChange={(e) => handleChange('navbarHoverColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Active Color</label>
              <input
                type="color"
                value={settings.navbarActiveColor}
                onChange={(e) => handleChange('navbarActiveColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* FONT SIZE */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-pink-500" />
            Font Size Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Heading Font Size</label>
              <select
                value={settings.headingFontSize}
                onChange={(e) => handleChange('headingFontSize', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Body Font Size</label>
              <select
                value={settings.bodyFontSize}
                onChange={(e) => handleChange('bodyFontSize', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Small Font Size</label>
              <select
                value={settings.smallFontSize}
                onChange={(e) => handleChange('smallFontSize', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STYLE SETTINGS */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-pink-500" />
            Style Settings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Radius</label>
              <select
                value={settings.borderRadius}
                onChange={(e) => handleChange('borderRadius', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {BORDER_RADIUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Style</label>
              <select
                value={settings.buttonStyle}
                onChange={(e) => handleChange('buttonStyle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {BUTTON_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Layout Style</label>
              <select
                value={settings.layoutStyle}
                onChange={(e) => handleChange('layoutStyle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {LAYOUT_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navigation Style</label>
              <select
                value={settings.navStyle}
                onChange={(e) => handleChange('navStyle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {NAV_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-pink-500" />
            Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Favicon URL</label>
              <input
                type="text"
                value={settings.faviconUrl}
                onChange={(e) => handleChange('faviconUrl', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero Banner URL</label>
              <input
                type="text"
                value={settings.heroBannerUrl}
                onChange={(e) => handleChange('heroBannerUrl', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-pink-500" />
            Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="admin@beautystudio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="6281234567890"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Jl. Contoh No. 123, Jakarta"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Google Maps Embed URL</label>
              <input
                type="text"
                value={settings.googleMapsEmbedUrl}
                onChange={(e) => handleChange('googleMapsEmbedUrl', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
          </div>
        </div>

        {/* SOCIAL MEDIA */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const Icon = platform.icon
              return (
                <div key={platform.key}>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: platform.color }} />
                    {platform.label}
                  </label>
                  <input
                    type="text"
                    value={social[platform.key] || ''}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder={platform.placeholder}
                  />
                  {social[platform.key] && (
                    <p className="text-xs text-green-500 mt-1">Terisi</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* FEATURE TOGGLES */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-pink-500" />
            Feature Toggles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableCart}
                onChange={(e) => handleChange('enableCart', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Keranjang</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableWhatsAppOrder}
                onChange={(e) => handleChange('enableWhatsAppOrder', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">WhatsApp Order</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableGuestCheckout}
                onChange={(e) => handleChange('enableGuestCheckout', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Guest Checkout</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableReviews}
                onChange={(e) => handleChange('enableReviews', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Reviews</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableTestimonials}
                onChange={(e) => handleChange('enableTestimonials', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Testimonials</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableBlog}
                onChange={(e) => handleChange('enableBlog', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Blog</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableGallery}
                onChange={(e) => handleChange('enableGallery', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Gallery</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableFaq}
                onChange={(e) => handleChange('enableFaq', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">FAQ</label>
            </div>
          </div>
        </div>

        {/* CART SETTINGS */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-pink-500" />
            Cart Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Order Amount</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Order Quantity</label>
              <input
                type="number"
                value={settings.maxOrderQuantity}
                onChange={(e) => handleChange('maxOrderQuantity', parseInt(e.target.value) || 99)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cart Expiry (days)</label>
              <input
                type="number"
                value={settings.cartExpiryDays}
                onChange={(e) => handleChange('cartExpiryDays', parseInt(e.target.value) || 7)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>
        </div>

        {/* FOOTER SETTINGS */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            Footer Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Copyright Text</label>
              <input
                type="text"
                value={settings.copyrightText}
                onChange={(e) => handleChange('copyrightText', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="2024 Beauty Studio. All rights reserved."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Links (JSON)</label>
              <textarea
                rows={3}
                value={settings.footerLinks}
                onChange={(e) => handleChange('footerLinks', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='[{"label": "Privacy Policy", "href": "/privacy"}]'
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-pink-500" />
            SEO Settings
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Description</label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Deskripsi website untuk SEO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Keywords</label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => handleChange('siteKeywords', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="beauty, skincare, treatment, spa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Beauty Studio - Skincare and Beauty Products"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <input
                type="text"
                value={settings.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Temukan produk skincare dan kecantikan terbaik di Beauty Studio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default OG Image URL</label>
              <input
                type="text"
                value={settings.defaultOgImage}
                onChange={(e) => handleChange('defaultOgImage', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://example.com/default-og-image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GA Tracking ID</label>
              <input
                type="text"
                value={settings.gaTrackingId}
                onChange={(e) => handleChange('gaTrackingId', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* JSON CONFIGURATION */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            JSON Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Content</label>
              <textarea
                rows={3}
                value={settings.footerContent}
                onChange={(e) => handleChange('footerContent', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"copyright": "2024 Beauty Studio"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
              <textarea
                rows={3}
                value={settings.operatingHours}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"monday": {"open": "09:00", "close": "18:00"}}'
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
