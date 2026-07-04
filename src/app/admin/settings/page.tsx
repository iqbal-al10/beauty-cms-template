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
  footerContent: any
  operatingHours: any
  googleMapsEmbedUrl: string
  socialLinks: any
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
  footerLinks: any
  footerServices: any
  // Hero Content
  heroBadge: string
  heroSubtitle: string
  heroShopButtonText: string
  heroShopButtonLink: string
  heroBookButtonText: string
  heroBookButtonLink: string
  // Hero Slide 1
  heroSlide1Icon: string
  heroSlide1Label: string
  heroSlide1Title: string
  heroSlide1Desc: string
  heroSlide1Button: string
  heroSlide1Link: string
  heroSlide1BgStart: string
  heroSlide1BgEnd: string
  // Hero Slide 2
  heroSlide2Icon: string
  heroSlide2Label: string
  heroSlide2Title: string
  heroSlide2Desc: string
  heroSlide2Button: string
  heroSlide2Link: string
  heroSlide2BgStart: string
  heroSlide2BgEnd: string
  // About Page
  aboutHeroTitle: string
  aboutHeroSubtitle: string
  aboutStoryTitle: string
  aboutStoryContent: string
  aboutMission: string
  aboutVision: string
  aboutTeamTitle: string
  aboutTeam: any
  // Contact Page
  contactHeroTitle: string
  contactHeroSubtitle: string
  contactFormTitle: string
  contactSuccessMessage: string
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
  footerContent: null,
  operatingHours: {
    Monday: '09:00 - 21:00',
    Tuesday: '09:00 - 21:00',
    Wednesday: '09:00 - 21:00',
    Thursday: '09:00 - 21:00',
    Friday: '09:00 - 21:00',
    Saturday: '09:00 - 21:00',
    Sunday: '10:00 - 18:00',
  },
  googleMapsEmbedUrl: '',
  socialLinks: null,
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
  footerLinks: null,
  footerServices: ['Facial Treatment', 'Body Care', 'Hair Care', 'Nail Art', 'Makeup'],
  heroBadge: '⭐ Premium Beauty Services',
  heroSubtitle: 'Discover premium beauty services and products for your perfect look',
  heroShopButtonText: 'Shop Now',
  heroShopButtonLink: '/products',
  heroBookButtonText: 'Book Now',
  heroBookButtonLink: '/booking',
  heroSlide1Icon: '🔥',
  heroSlide1Label: 'Limited Time Offer',
  heroSlide1Title: 'FLASH SALE 50% OFF',
  heroSlide1Desc: 'Grab your favorite products at unbeatable prices',
  heroSlide1Button: 'Grab Now',
  heroSlide1Link: '/products',
  heroSlide1BgStart: '#f97316',
  heroSlide1BgEnd: '#db2777',
  heroSlide2Icon: '📅',
  heroSlide2Label: 'Book Now & Get Special Offer',
  heroSlide2Title: 'FREE Consultation',
  heroSlide2Desc: 'Book your appointment today and get free consultation',
  heroSlide2Button: 'Book Now',
  heroSlide2Link: '/booking',
  heroSlide2BgStart: '#8b5cf6',
  heroSlide2BgEnd: '#ec4899',
  // About
  aboutHeroTitle: 'About Us',
  aboutHeroSubtitle: 'Learn more about our journey',
  aboutStoryTitle: 'Our Story',
  aboutStoryContent: 'We are passionate about bringing beauty to everyone...',
  aboutMission: 'To bring beauty and confidence to every individual',
  aboutVision: 'To be the leading beauty destination in the region',
  aboutTeamTitle: 'Meet Our Team',
  aboutTeam: null,
  // Contact
  contactHeroTitle: 'Contact Us',
  contactHeroSubtitle: "We'd love to hear from you",
  contactFormTitle: 'Send Us a Message',
  contactSuccessMessage: 'Thank you for your message! We will get back to you soon.',
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Build slides from settings for preview
  const slides = [
    {
      id: 'slide1',
      icon: settings.heroSlide1Icon || '🔥',
      label: settings.heroSlide1Label || 'Limited Time Offer',
      title: settings.heroSlide1Title || 'FLASH SALE 50% OFF',
      description: settings.heroSlide1Desc || 'Grab your favorite products at unbeatable prices',
      buttonText: settings.heroSlide1Button || 'Grab Now',
      buttonLink: settings.heroSlide1Link || '/products',
      bgStart: settings.heroSlide1BgStart || '#f97316',
      bgEnd: settings.heroSlide1BgEnd || '#db2777',
    },
    {
      id: 'slide2',
      icon: settings.heroSlide2Icon || '📅',
      label: settings.heroSlide2Label || 'Book Now & Get Special Offer',
      title: settings.heroSlide2Title || 'FREE Consultation',
      description: settings.heroSlide2Desc || 'Book your appointment today and get free consultation',
      buttonText: settings.heroSlide2Button || 'Book Now',
      buttonLink: settings.heroSlide2Link || '/booking',
      bgStart: settings.heroSlide2BgStart || '#8b5cf6',
      bgEnd: settings.heroSlide2BgEnd || '#ec4899',
    },
  ]

  // Auto-slide for preview modal
  useEffect(() => {
    if (!isPreviewOpen) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPreviewOpen, slides.length])

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

  const safeParseJSON = (value: any): any => {
    if (value === null || value === undefined) return null
    if (typeof value !== 'string') return value
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const socialLinks = { ...social }
      
      const footerContent = safeParseJSON(settings.footerContent)
      const operatingHours = safeParseJSON(settings.operatingHours)
      const footerLinks = safeParseJSON(settings.footerLinks)
      const footerServices = safeParseJSON(settings.footerServices)

      const payload = {
        ...settings,
        footerContent,
        operatingHours,
        socialLinks: socialLinks,
        footerLinks,
        footerServices: footerServices || ['Facial Treatment', 'Body Care', 'Hair Care', 'Nail Art', 'Makeup'],
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
      toast.error(error.message || 'Gagal menyimpan pengaturan')
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const safeValue = (val: any): string => {
    if (val === null || val === undefined) return ''
    return String(val)
  }

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const hasSocial = (key: string) => social[key] && social[key].trim() !== ''
  const currentSlideData = slides[currentSlide]

  const socialLinksForPreview = SOCIAL_PLATFORMS.filter(p => hasSocial(p.key))

  return (
    <div>
      {/* ===== HEADER FIXED ===== */}
      <div className="sticky top-[-20.5px] z-20 bg-gray-50/95 backdrop-blur-sm -mx-6 px-6 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-pink-500" />
            Setting Management
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Preview Homepage
            </button>
            <button
              onClick={handleReset}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset ke Default
            </button>
          </div>
        </div>
      </div>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 mt-4">
        {/* ===== BRAND IDENTITY ===== */}
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
                value={safeValue(settings.siteName)}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Beauty Studio"
              />
              <p className="text-xs text-gray-400 mt-1">Akan muncul di header, footer, dan title</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Family</label>
              <select
                value={safeValue(settings.fontFamily)}
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

        {/* ===== COLORS ===== */}
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
                value={safeValue(settings.colorPrimary)}
                onChange={(e) => handleChange('colorPrimary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary</label>
              <input
                type="color"
                value={safeValue(settings.colorSecondary)}
                onChange={(e) => handleChange('colorSecondary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button</label>
              <input
                type="color"
                value={safeValue(settings.colorButton)}
                onChange={(e) => handleChange('colorButton', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link Hover</label>
              <input
                type="color"
                value={safeValue(settings.linkHoverColor)}
                onChange={(e) => handleChange('linkHoverColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BG Utama</label>
              <input
                type="color"
                value={safeValue(settings.primaryBackground)}
                onChange={(e) => handleChange('primaryBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BG Sekunder</label>
              <input
                type="color"
                value={safeValue(settings.secondaryBackground)}
                onChange={(e) => handleChange('secondaryBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Heading Color</label>
              <input
                type="color"
                value={safeValue(settings.headingColor)}
                onChange={(e) => handleChange('headingColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Body Text Color</label>
              <input
                type="color"
                value={safeValue(settings.bodyTextColor)}
                onChange={(e) => handleChange('bodyTextColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ===== HERO CONTENT ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-pink-500" />
            Hero Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero Badge</label>
              <input
                type="text"
                value={safeValue(settings.heroBadge)}
                onChange={(e) => handleChange('heroBadge', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="⭐ Premium Beauty Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
              <input
                type="text"
                value={safeValue(settings.heroSubtitle)}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Discover premium beauty services..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shop Button Text</label>
              <input
                type="text"
                value={safeValue(settings.heroShopButtonText)}
                onChange={(e) => handleChange('heroShopButtonText', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shop Button Link</label>
              <input
                type="text"
                value={safeValue(settings.heroShopButtonLink)}
                onChange={(e) => handleChange('heroShopButtonLink', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="/products"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Book Button Text</label>
              <input
                type="text"
                value={safeValue(settings.heroBookButtonText)}
                onChange={(e) => handleChange('heroBookButtonText', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Book Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Book Button Link</label>
              <input
                type="text"
                value={safeValue(settings.heroBookButtonLink)}
                onChange={(e) => handleChange('heroBookButtonLink', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="/booking"
              />
            </div>
          </div>
        </div>

        {/* ===== HERO SLIDE 1 ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            Hero Slide 1 - Flash Sale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide1Icon)}
                onChange={(e) => handleChange('heroSlide1Icon', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="🔥"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide1Label)}
                onChange={(e) => handleChange('heroSlide1Label', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Limited Time Offer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide1Title)}
                onChange={(e) => handleChange('heroSlide1Title', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="FLASH SALE 50% OFF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide1Desc)}
                onChange={(e) => handleChange('heroSlide1Desc', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Grab your favorite products..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Text</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide1Button)}
                onChange={(e) => handleChange('heroSlide1Button', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Grab Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Link</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide1Link)}
                onChange={(e) => handleChange('heroSlide1Link', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="/products"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Start Color</label>
              <input
                type="color"
                value={safeValue(settings.heroSlide1BgStart)}
                onChange={(e) => handleChange('heroSlide1BgStart', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background End Color</label>
              <input
                type="color"
                value={safeValue(settings.heroSlide1BgEnd)}
                onChange={(e) => handleChange('heroSlide1BgEnd', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ===== HERO SLIDE 2 ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Hero Slide 2 - Booking Promo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide2Icon)}
                onChange={(e) => handleChange('heroSlide2Icon', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="📅"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide2Label)}
                onChange={(e) => handleChange('heroSlide2Label', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Book Now & Get Special Offer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide2Title)}
                onChange={(e) => handleChange('heroSlide2Title', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="FREE Consultation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide2Desc)}
                onChange={(e) => handleChange('heroSlide2Desc', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Book your appointment today..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Text</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide2Button)}
                onChange={(e) => handleChange('heroSlide2Button', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Book Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Link</label>
              <input
                type="text"
                value={safeValue(settings.heroSlide2Link)}
                onChange={(e) => handleChange('heroSlide2Link', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="/booking"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Start Color</label>
              <input
                type="color"
                value={safeValue(settings.heroSlide2BgStart)}
                onChange={(e) => handleChange('heroSlide2BgStart', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background End Color</label>
              <input
                type="color"
                value={safeValue(settings.heroSlide2BgEnd)}
                onChange={(e) => handleChange('heroSlide2BgEnd', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ===== ABOUT PAGE SETTINGS ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            About Page Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hero Title</label>
                <input
                  type="text"
                  value={safeValue(settings.aboutHeroTitle)}
                  onChange={(e) => handleChange('aboutHeroTitle', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="About Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
                <input
                  type="text"
                  value={safeValue(settings.aboutHeroSubtitle)}
                  onChange={(e) => handleChange('aboutHeroSubtitle', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="Learn more about our journey"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Story Title</label>
              <input
                type="text"
                value={safeValue(settings.aboutStoryTitle)}
                onChange={(e) => handleChange('aboutStoryTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Our Story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Story Content</label>
              <textarea
                rows={4}
                value={safeValue(settings.aboutStoryContent)}
                onChange={(e) => handleChange('aboutStoryContent', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="We are passionate about bringing beauty to everyone..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mission</label>
                <textarea
                  rows={2}
                  value={safeValue(settings.aboutMission)}
                  onChange={(e) => handleChange('aboutMission', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="To bring beauty and confidence to every individual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vision</label>
                <textarea
                  rows={2}
                  value={safeValue(settings.aboutVision)}
                  onChange={(e) => handleChange('aboutVision', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="To be the leading beauty destination in the region"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Title</label>
              <input
                type="text"
                value={safeValue(settings.aboutTeamTitle)}
                onChange={(e) => handleChange('aboutTeamTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Meet Our Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Members (JSON)</label>
              <textarea
                rows={4}
                value={safeValue(settings.aboutTeam ? JSON.stringify(settings.aboutTeam, null, 2) : '')}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange('aboutTeam', parsed)
                  } catch {
                    handleChange('aboutTeam', e.target.value)
                  }
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='[{"name":"John Doe","role":"Founder","image":"https://..."}]'
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: {`[{"name":"John Doe","role":"Founder","image":"https://..."}]`}
              </p>
            </div>
          </div>
        </div>

        {/* ===== CONTACT PAGE SETTINGS ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-pink-500" />
            Contact Page Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hero Title</label>
                <input
                  type="text"
                  value={safeValue(settings.contactHeroTitle)}
                  onChange={(e) => handleChange('contactHeroTitle', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="Contact Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
                <input
                  type="text"
                  value={safeValue(settings.contactHeroSubtitle)}
                  onChange={(e) => handleChange('contactHeroSubtitle', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="We&apos;d love to hear from you"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Form Title</label>
              <input
                type="text"
                value={safeValue(settings.contactFormTitle)}
                onChange={(e) => handleChange('contactFormTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Send Us a Message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Success Message</label>
              <input
                type="text"
                value={safeValue(settings.contactSuccessMessage)}
                onChange={(e) => handleChange('contactSuccessMessage', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Thank you for your message!"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  type="text"
                  value={safeValue(settings.whatsappNumber)}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="6281234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={safeValue(settings.email)}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                  placeholder="info@beautystudio.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={safeValue(settings.address)}
                onChange={(e) => handleChange('address', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Jl. Contoh No. 123, Kota"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Google Maps Embed URL</label>
              <input
                type="url"
                value={safeValue(settings.googleMapsEmbedUrl)}
                onChange={(e) => handleChange('googleMapsEmbedUrl', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Operating Hours (JSON)</label>
              <textarea
                rows={8}
                value={safeValue(settings.operatingHours ? JSON.stringify(settings.operatingHours, null, 2) : '')}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange('operatingHours', parsed)
                  } catch {
                    handleChange('operatingHours', e.target.value)
                  }
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"Monday":"09:00 - 21:00","Tuesday":"09:00 - 21:00","Wednesday":"09:00 - 21:00","Thursday":"09:00 - 21:00","Friday":"09:00 - 21:00","Saturday":"09:00 - 21:00","Sunday":"10:00 - 18:00"}'
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: {`{ "Monday": "09:00 - 21:00", "Tuesday": "09:00 - 21:00" }`}
              </p>
            </div>
          </div>
        </div>

        {/* ===== FOOTER SETTINGS ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            Footer Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Copyright Text</label>
              <input
                type="text"
                value={safeValue(settings.copyrightText)}
                onChange={(e) => handleChange('copyrightText', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="© 2024 Beauty Studio. All rights reserved."
              />
              <p className="text-xs text-gray-400 mt-1">Akan muncul di footer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Services (JSON Array)</label>
              <textarea
                rows={6}
                value={safeValue(settings.footerServices ? JSON.stringify(settings.footerServices, null, 2) : '')}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange('footerServices', parsed)
                  } catch {
                    handleChange('footerServices', e.target.value)
                  }
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='["Facial Treatment", "Body Care", "Hair Care", "Nail Art", "Makeup"]'
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: {`["Service 1", "Service 2", "Service 3"]`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Links (JSON)</label>
              <textarea
                rows={4}
                value={safeValue(settings.footerLinks ? JSON.stringify(settings.footerLinks, null, 2) : '')}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange('footerLinks', parsed)
                  } catch {
                    handleChange('footerLinks', e.target.value)
                  }
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='[{"label":"Privacy Policy","href":"/privacy"},{"label":"Terms","href":"/terms"}]'
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: {`[{"label":"Privacy","href":"/privacy"}]`}
              </p>
            </div>
          </div>
        </div>

        {/* ===== NAVBAR SETTINGS ===== */}
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
                value={safeValue(settings.navbarBackground)}
                onChange={(e) => handleChange('navbarBackground', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Text Color</label>
              <input
                type="color"
                value={safeValue(settings.navbarTextColor)}
                onChange={(e) => handleChange('navbarTextColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Hover Color</label>
              <input
                type="color"
                value={safeValue(settings.navbarHoverColor)}
                onChange={(e) => handleChange('navbarHoverColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Active Color</label>
              <input
                type="color"
                value={safeValue(settings.navbarActiveColor)}
                onChange={(e) => handleChange('navbarActiveColor', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ===== LAYOUT SETTINGS ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-pink-500" />
            Layout Settings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Radius</label>
              <select
                value={safeValue(settings.borderRadius)}
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
                value={safeValue(settings.buttonStyle)}
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
                value={safeValue(settings.layoutStyle)}
                onChange={(e) => handleChange('layoutStyle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                {LAYOUT_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Style</label>
              <select
                value={safeValue(settings.navStyle)}
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

        {/* ===== FONT SIZES ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-pink-500" />
            Font Sizes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Heading Font Size</label>
              <select
                value={safeValue(settings.headingFontSize)}
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
                value={safeValue(settings.bodyFontSize)}
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
                value={safeValue(settings.smallFontSize)}
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

        {/* ===== SOCIAL LINKS ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            Social Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const Icon = platform.icon
              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${platform.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: platform.color }} />
                  </div>
                  <input
                    type="url"
                    value={safeValue(social[platform.key])}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 text-sm"
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== SEO ===== */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-pink-500" />
            SEO Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={safeValue(settings.metaTitle)}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Beauty Studio - Premium Beauty Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <input
                type="text"
                value={safeValue(settings.metaDescription)}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Your beauty destination for premium services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Description</label>
              <input
                type="text"
                value={safeValue(settings.siteDescription)}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Your beauty destination for premium services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Keywords</label>
              <input
                type="text"
                value={safeValue(settings.siteKeywords)}
                onChange={(e) => handleChange('siteKeywords', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="beauty, skincare, makeup, salon"
              />
            </div>
          </div>
        </div>

        {/* ===== SAVE BUTTON ===== */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      {/* ===== MODAL PREVIEW HOMEPAGE ===== */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false)
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-semibold text-gray-800">Preview Homepage</h2>
                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Real-time</span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ fontFamily: settings.fontFamily || 'Inter' }}>
              {/* ===== HERO SECTION ===== */}
              <section 
                className="relative min-h-[60vh] flex items-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${settings.colorPrimary || '#c4367b'} 0%, ${settings.colorSecondary || '#f5dbe8'} 100%)`,
                }}
              >
                {settings.heroBannerUrl && (
                  <div className="absolute inset-0 opacity-40">
                    <img 
                      src={settings.heroBannerUrl} 
                      alt={settings.siteName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20" />
                
                <div className="container mx-auto px-4 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
                        <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-white text-sm font-medium" style={{ fontSize: settings.smallFontSize || '14px' }}>
                          {settings.heroBadge || '⭐ Premium Beauty Services'}
                        </span>
                      </div>
                      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg" style={{ fontSize: settings.headingFontSize || '32px' }}>
                        {settings.siteName || 'Beauty Studio'}
                      </h1>
                      <p className="text-xl text-white/90 mb-8 drop-shadow-md max-w-lg mx-auto lg:mx-0" style={{ fontSize: settings.bodyFontSize || '16px' }}>
                        {settings.heroSubtitle || 'Discover premium beauty services and products for your perfect look'}
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <a
                          href={settings.heroShopButtonLink || '/products'}
                          className="px-8 py-3 rounded-full text-white font-semibold text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg active:scale-95 inline-block"
                          style={{ backgroundColor: settings.colorButton || '#aa1d68', fontSize: settings.bodyFontSize || '16px' }}
                        >
                          {settings.heroShopButtonText || 'Shop Now'}
                        </a>
                        <a
                          href={settings.heroBookButtonLink || '/booking'}
                          className="px-8 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all inline-block"
                          style={{ fontSize: settings.bodyFontSize || '16px' }}
                        >
                          {settings.heroBookButtonText || 'Book Now'}
                        </a>
                      </div>
                    </div>

                    <div className="relative w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto">
                      <div className="relative overflow-hidden rounded-2xl">
                        <div 
                          className="transition-transform duration-700 ease-in-out"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          <div className="flex">
                            {slides.map((slide) => (
                              <div
                                key={slide.id}
                                className="w-full flex-shrink-0 p-10 min-h-[380px] flex flex-col justify-center items-center text-center text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${slide.bgStart} 0%, ${slide.bgEnd} 100%)`,
                                }}
                              >
                                <span className="text-7xl mb-4">{slide.icon}</span>
                                <span className="inline-block px-4 py-1 text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full mb-3">
                                  {slide.label}
                                </span>
                                <h3 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontSize: settings.headingFontSize || '32px' }}>
                                  {slide.title}
                                </h3>
                                <p className="text-white/80 text-lg mb-6" style={{ fontSize: settings.bodyFontSize || '16px' }}>
                                  {slide.description}
                                </p>
                                <a
                                  href={slide.buttonLink}
                                  className="inline-block px-10 py-3.5 rounded-full bg-white text-gray-900 font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                                  style={{ fontSize: settings.bodyFontSize || '16px' }}
                                >
                                  {slide.buttonText} →
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {slides.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToSlide(index)}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? 'bg-white w-10' : 'bg-white/50 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800" style={{ fontSize: settings.headingFontSize || '32px' }}>
                        Featured Products
                      </h2>
                      <p className="text-gray-500" style={{ fontSize: settings.bodyFontSize || '16px' }}>Our best picks just for you</p>
                    </div>
                    <span className="text-sm font-medium" style={{ color: settings.colorPrimary || '#c4367b' }}>View All →</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                        <div className="text-6xl mb-2">🧴</div>
                        <p className="font-semibold text-gray-800 text-sm">Product {i}</p>
                        <p className="text-sm font-bold" style={{ color: settings.colorPrimary || '#c4367b' }}>Rp 99.000</p>
                        <button 
                          className="mt-2 px-4 py-1.5 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: settings.colorButton || '#aa1d68' }}
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section 
                className="py-12"
                style={{
                  background: `linear-gradient(135deg, ${settings.colorPrimary || '#c4367b'} 0%, ${settings.colorSecondary || '#f5dbe8'} 100%)`,
                }}
              >
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4" style={{ fontSize: settings.headingFontSize || '32px' }}>
                    Ready to Glow?
                  </h2>
                  <p className="text-white/80 mb-6 max-w-md mx-auto" style={{ fontSize: settings.bodyFontSize || '16px' }}>
                    Book your appointment today and experience the best beauty services
                  </p>
                  <a
                    href="/booking"
                    className="inline-block px-10 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg"
                    style={{ fontSize: settings.bodyFontSize || '16px' }}
                  >
                    Book Now
                  </a>
                </div>
              </section>

              <footer 
                className="border-t"
                style={{ 
                  backgroundColor: settings.secondaryBackground || '#f9fafb',
                  borderColor: `${settings.colorPrimary || '#c4367b'}20`
                }}
              >
                <div className="container mx-auto px-4 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: settings.headingColor || '#111827', fontSize: settings.headingFontSize || '32px' }}>
                        {settings.siteName || 'Beauty Studio'}
                      </h3>
                      <p className="text-sm" style={{ color: settings.bodyTextColor || '#4b5563', fontSize: settings.bodyFontSize || '16px' }}>
                        {settings.address || 'Premium beauty services for your perfect look'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: settings.headingColor || '#111827', fontSize: settings.bodyFontSize || '16px' }}>
                        Contact
                      </h4>
                      {settings.whatsappNumber && (
                        <p className="text-sm" style={{ color: settings.bodyTextColor || '#4b5563', fontSize: settings.smallFontSize || '14px' }}>
                          📱 {settings.whatsappNumber}
                        </p>
                      )}
                      {settings.email && (
                        <p className="text-sm" style={{ color: settings.bodyTextColor || '#4b5563', fontSize: settings.smallFontSize || '14px' }}>
                          ✉️ {settings.email}
                        </p>
                      )}
                    </div>
                    <div>
                      {socialLinksForPreview.length > 0 && (
                        <>
                          <h4 className="font-semibold mb-2" style={{ color: settings.headingColor || '#111827', fontSize: settings.bodyFontSize || '16px' }}>
                            Follow Us
                          </h4>
                          <div className="flex gap-3">
                            {socialLinksForPreview.map((platform) => {
                              const Icon = platform.icon
                              return (
                                <a
                                  key={platform.key}
                                  href={social[platform.key]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                  style={{ backgroundColor: `${settings.colorPrimary || '#c4367b'}15`, color: settings.colorPrimary || '#c4367b' }}
                                >
                                  <Icon className="w-4 h-4" />
                                </a>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="border-t mt-6 pt-4 text-center text-sm" style={{ borderColor: `${settings.colorPrimary || '#c4367b'}20`, color: settings.bodyTextColor || '#4b5563', fontSize: settings.smallFontSize || '14px' }}>
                    {settings.copyrightText || `© ${new Date().getFullYear()} ${settings.siteName || 'Beauty Studio'}. All rights reserved.`}
                  </div>
                </div>
              </footer>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50/80 flex-shrink-0">
              <p className="text-xs text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                Real-time preview - perubahan langsung terlihat
              </p>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}