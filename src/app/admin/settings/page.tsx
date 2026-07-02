'use client'

import { useEffect, useState } from 'react'
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [social, setSocial] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    linkedin: '',
    pinterest: '',
    threads: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data && data.id) {
        setSettings({
          siteName: data.siteName || 'Beauty Studio',
          colorPrimary: data.colorPrimary || '#c4367b',
          colorSecondary: data.colorSecondary || '#f5dbe8',
          colorButton: data.colorButton || '#aa1d68',
          fontFamily: data.fontFamily || 'Inter',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          heroBannerUrl: data.heroBannerUrl || '',
          whatsappNumber: data.whatsappNumber || '',
          email: data.email || '',
          address: data.address || '',
          footerContent: data.footerContent ? JSON.stringify(data.footerContent, null, 2) : '',
          operatingHours: data.operatingHours ? JSON.stringify(data.operatingHours, null, 2) : '',
          googleMapsEmbedUrl: data.googleMapsEmbedUrl || '',
          socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks, null, 2) : '',
          gaTrackingId: data.gaTrackingId || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          defaultOgImage: data.defaultOgImage || '',
          primaryBackground: data.primaryBackground || '#ffffff',
          secondaryBackground: data.secondaryBackground || '#f9fafb',
          headingColor: data.headingColor || '#111827',
          bodyTextColor: data.bodyTextColor || '#4b5563',
          linkHoverColor: data.linkHoverColor || '#c4367b',
          borderRadius: data.borderRadius || 'medium',
          buttonStyle: data.buttonStyle || 'rounded',
          layoutStyle: data.layoutStyle || 'full-width',
          navStyle: data.navStyle || 'sticky',
          navbarBackground: data.navbarBackground || '#ffffff',
          navbarTextColor: data.navbarTextColor || '#4b5563',
          navbarHoverColor: data.navbarHoverColor || '#c4367b',
          navbarActiveColor: data.navbarActiveColor || '#c4367b',
          headingFontSize: data.headingFontSize || '32px',
          bodyFontSize: data.bodyFontSize || '16px',
          smallFontSize: data.smallFontSize || '14px',
          enableCart: data.enableCart !== undefined ? data.enableCart : true,
          enableWhatsAppOrder: data.enableWhatsAppOrder !== undefined ? data.enableWhatsAppOrder : true,
          enableGuestCheckout: data.enableGuestCheckout !== undefined ? data.enableGuestCheckout : true,
          enableReviews: data.enableReviews !== undefined ? data.enableReviews : true,
          enableTestimonials: data.enableTestimonials !== undefined ? data.enableTestimonials : true,
          enableBlog: data.enableBlog !== undefined ? data.enableBlog : true,
          enableGallery: data.enableGallery !== undefined ? data.enableGallery : true,
          enableFaq: data.enableFaq !== undefined ? data.enableFaq : true,
          minOrderAmount: data.minOrderAmount || 0,
          maxOrderQuantity: data.maxOrderQuantity || 99,
          cartExpiryDays: data.cartExpiryDays || 7,
          siteDescription: data.siteDescription || '',
          siteKeywords: data.siteKeywords || '',
        })

        if (data.socialLinks) {
          try {
            const parsed = typeof data.socialLinks === 'string' ? JSON.parse(data.socialLinks) : data.socialLinks
            setSocial({
              instagram: parsed.instagram || '',
              facebook: parsed.facebook || '',
              tiktok: parsed.tiktok || '',
              youtube: parsed.youtube || '',
              twitter: parsed.twitter || '',
              linkedin: parsed.linkedin || '',
              pinterest: parsed.pinterest || '',
              threads: parsed.threads || '',
            })
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
    setSocial({
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      twitter: '',
      linkedin: '',
      pinterest: '',
      threads: '',
    })
    toast.success('✅ Pengaturan direset ke default')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const socialLinks = {
        instagram: social.instagram || '',
        facebook: social.facebook || '',
        tiktok: social.tiktok || '',
        youtube: social.youtube || '',
        twitter: social.twitter || '',
        linkedin: social.linkedin || '',
        pinterest: social.pinterest || '',
        threads: social.threads || '',
      }

      const payload = {
        ...settings,
        footerContent: settings.footerContent ? JSON.parse(settings.footerContent) : null,
        operatingHours: settings.operatingHours ? JSON.parse(settings.operatingHours) : null,
        socialLinks: socialLinks,
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

      toast.success('✅ Pengaturan berhasil disimpan!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('❌ Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialChange = (platform: keyof typeof social, value: string) => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Setting Management</h1>
        <button
          onClick={handleReset}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Reset ke Default
        </button>
      </div>

      {/* ===== STICKY LIVE PREVIEW - COMPACT ===== */}
      <div className="sticky top-[-20px] z-10 -mx-6 px-6 bg-gray-50/95 backdrop-blur-sm py-2">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-full">
          <div className="bg-pink-500 px-4 py-0.5 text-white text-xs font-medium flex items-center justify-between">
            <span>👁️ Live Preview (Real-time)</span>
            <span className="text-white/70 text-[10px]">● Perubahan langsung terlihat</span>
          </div>

          <div className="p-2" style={{ 
            backgroundColor: settings.primaryBackground,
            fontFamily: settings.fontFamily 
          }}>
            {/* HEADER - MIRIP NAVBAR */}
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100" style={{ backgroundColor: settings.navbarBackground }}>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[9px]" style={{ backgroundColor: settings.colorPrimary }}>
                  {settings.siteName.charAt(0)}
                </div>
                <span className="font-bold text-[10px]" style={{ color: settings.colorPrimary, fontSize: settings.smallFontSize }}>
                  {settings.siteName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Home</span>
                <span className="text-[9px]" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Products</span>
                <span className="text-[9px]" style={{ color: settings.navbarTextColor, fontSize: settings.smallFontSize }}>Blog</span>
                <button className="px-1.5 py-0.5 rounded-full text-white text-[8px] font-medium" style={{ backgroundColor: settings.colorButton }}>
                  Book
                </button>
              </div>
            </div>

            {/* HERO - MIRIP HOME */}
            <div className="mt-1.5 p-2 rounded-lg text-center" style={{ 
              background: `linear-gradient(135deg, ${settings.colorPrimary} 0%, ${settings.colorSecondary} 100%)`,
              minHeight: '45px'
            }}>
              <h2 className="font-bold text-white text-[11px]" style={{ fontSize: settings.smallFontSize }}>
                Selamat Datang di {settings.siteName}
              </h2>
              <p className="text-white/80 text-[9px] mt-0.5" style={{ fontSize: settings.smallFontSize }}>
                Premium beauty services
              </p>
              <button className="mt-0.5 px-3 py-0.5 rounded-full text-white text-[9px] font-semibold shadow-md hover:opacity-90" style={{ 
                backgroundColor: settings.colorButton,
                fontSize: settings.smallFontSize,
                borderRadius: getButtonStyle()
              }}>
                Mulai
              </button>
            </div>

            {/* FEATURED PRODUCTS - HEIGHT 50% LEBIH KECIL */}
            <div className="mt-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-[9px]" style={{ fontSize: settings.smallFontSize, color: settings.headingColor }}>Featured Products</h3>
                <span className="text-[8px]" style={{ color: settings.colorPrimary, fontSize: settings.smallFontSize }}>View All →</span>
              </div>
              <div className="grid grid-cols-4 gap-1 mt-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-1 border border-gray-100">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '28px' }}>
                      <span className="text-sm">🧴</span>
                    </div>
                    <p className="text-[7px] font-semibold text-gray-800 mt-0.5 truncate" style={{ fontSize: settings.smallFontSize }}>Product {i}</p>
                    <p className="text-[7px] font-bold" style={{ color: settings.colorPrimary, fontSize: settings.smallFontSize }}>Rp 100K</p>
                    <button className="w-full mt-0.5 py-0.5 rounded-full text-white text-[6px] font-medium" style={{ backgroundColor: settings.colorButton }}>
                      Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLOR INDICATORS - COMPACT */}
            <div className="mt-1 pt-1 border-t border-gray-100 flex flex-wrap items-center gap-1">
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">P:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.colorPrimary }}></div>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">S:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.colorSecondary }}></div>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">B:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.colorButton }}></div>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">NB:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.navbarBackground }}></div>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">NT:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.navbarTextColor }}></div>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">H:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.headingColor }}></div>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[7px] text-gray-500">Body:</span>
                <div className="w-2.5 h-2.5 rounded border border-gray-200" style={{ backgroundColor: settings.bodyTextColor }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        {/* Brand Identity */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Brand Identity</h2>
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

        {/* Colors */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎨 Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary</label>
              <input
                type="color"
                value={settings.colorPrimary}
                onChange={(e) => handleChange('colorPrimary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #c4367b</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary</label>
              <input
                type="color"
                value={settings.colorSecondary}
                onChange={(e) => handleChange('colorSecondary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #f5dbe8</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button</label>
              <input
                type="color"
                value={settings.colorButton}
                onChange={(e) => handleChange('colorButton', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #aa1d68</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link Hover</label>
              <input
                type="color"
                value={settings.linkHoverColor}
                onChange={(e) => handleChange('linkHoverColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #c4367b</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BG Utama</label>
              <input
                type="color"
                value={settings.primaryBackground}
                onChange={(e) => handleChange('primaryBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #ffffff</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BG Sekunder</label>
              <input
                type="color"
                value={settings.secondaryBackground}
                onChange={(e) => handleChange('secondaryBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #f9fafb</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Heading Color</label>
              <input
                type="color"
                value={settings.headingColor}
                onChange={(e) => handleChange('headingColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #111827</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Body Text Color</label>
              <input
                type="color"
                value={settings.bodyTextColor}
                onChange={(e) => handleChange('bodyTextColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #4b5563</p>
            </div>
          </div>
        </div>

        {/* Navbar Settings */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🧭 Navbar Settings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Background</label>
              <input
                type="color"
                value={settings.navbarBackground}
                onChange={(e) => handleChange('navbarBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #ffffff</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Text Color</label>
              <input
                type="color"
                value={settings.navbarTextColor}
                onChange={(e) => handleChange('navbarTextColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #4b5563</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Hover Color</label>
              <input
                type="color"
                value={settings.navbarHoverColor}
                onChange={(e) => handleChange('navbarHoverColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #c4367b</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Active Color</label>
              <input
                type="color"
                value={settings.navbarActiveColor}
                onChange={(e) => handleChange('navbarActiveColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Default: #c4367b</p>
            </div>
          </div>
        </div>

        {/* Font Size Settings */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔤 Font Size Settings</h2>
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
              <p className="text-xs text-gray-400 mt-1">Default: 32px</p>
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
              <p className="text-xs text-gray-400 mt-1">Default: 16px</p>
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
              <p className="text-xs text-gray-400 mt-1">Default: 14px</p>
            </div>
          </div>
        </div>

        {/* Style */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🖌️ Style</h2>
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

        {/* Images */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🖼️ Images</h2>
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

        {/* Contact */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📞 Contact</h2>
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

        {/* Social Media */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📱 Social Media</h2>
          <p className="text-sm text-gray-500 mb-3">Masukkan URL lengkap profile sosial media Anda</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">📸 Instagram</label>
              <input
                type="text"
                value={social.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">📘 Facebook</label>
              <input
                type="text"
                value={social.facebook}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">🎵 TikTok</label>
              <input
                type="text"
                value={social.tiktok}
                onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://tiktok.com/@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">▶️ YouTube</label>
              <input
                type="text"
                value={social.youtube}
                onChange={(e) => handleSocialChange('youtube', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://youtube.com/@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">🐦 Twitter / X</label>
              <input
                type="text"
                value={social.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">🔗 LinkedIn</label>
              <input
                type="text"
                value={social.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">📌 Pinterest</label>
              <input
                type="text"
                value={social.pinterest}
                onChange={(e) => handleSocialChange('pinterest', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://pinterest.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">🧵 Threads</label>
              <input
                type="text"
                value={social.threads}
                onChange={(e) => handleSocialChange('threads', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://threads.net/@username"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Feature Toggles</h2>
          <p className="text-sm text-gray-500 mb-3">Aktifkan atau nonaktifkan fitur website</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableCart}
                onChange={(e) => handleChange('enableCart', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">🛒 Keranjang</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableWhatsAppOrder}
                onChange={(e) => handleChange('enableWhatsAppOrder', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">💬 WhatsApp Order</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableGuestCheckout}
                onChange={(e) => handleChange('enableGuestCheckout', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">👤 Guest Checkout</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableReviews}
                onChange={(e) => handleChange('enableReviews', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">⭐ Reviews</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableTestimonials}
                onChange={(e) => handleChange('enableTestimonials', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">💬 Testimonials</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableBlog}
                onChange={(e) => handleChange('enableBlog', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">📝 Blog</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableGallery}
                onChange={(e) => handleChange('enableGallery', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">🖼️ Gallery</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableFaq}
                onChange={(e) => handleChange('enableFaq', e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">❓ FAQ</label>
            </div>
          </div>
        </div>

        {/* Cart Settings */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🛒 Cart Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Order Amount</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
              <p className="text-xs text-gray-400 mt-1">0 = tidak ada batas</p>
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

        {/* SEO */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 SEO</h2>
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
                placeholder="Beauty Studio - Skincare & Beauty Products"
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

        {/* JSON Config */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 JSON Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Content</label>
              <textarea
                rows={3}
                value={settings.footerContent}
                onChange={(e) => handleChange('footerContent', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"copyright": "© 2024 Beauty Studio", "links": [{"label": "Privacy Policy", "href": "/privacy"}]}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
              <textarea
                rows={3}
                value={settings.operatingHours}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}}'
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  )
}
