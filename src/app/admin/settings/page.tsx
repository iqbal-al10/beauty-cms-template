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
}

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat']

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Beauty Studio',
    colorPrimary: '#e88ea7',
    colorSecondary: '#9b4d6e',
    colorButton: '#e88ea7',
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
          colorPrimary: data.colorPrimary || '#e88ea7',
          colorSecondary: data.colorSecondary || '#9b4d6e',
          colorButton: data.colorButton || '#e88ea7',
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
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Gagal memuat pengaturan')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const payload = {
        ...settings,
        footerContent: settings.footerContent ? JSON.parse(settings.footerContent) : null,
        operatingHours: settings.operatingHours ? JSON.parse(settings.operatingHours) : null,
        socialLinks: settings.socialLinks ? JSON.parse(settings.socialLinks) : null,
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

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value || '' }))
  }

  const handleReset = async () => {
    if (!confirm('Yakin ingin mereset ke default?')) return
    
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data && data.id) {
        setSettings({
          siteName: data.siteName || 'Beauty Studio',
          colorPrimary: data.colorPrimary || '#e88ea7',
          colorSecondary: data.colorSecondary || '#9b4d6e',
          colorButton: data.colorButton || '#e88ea7',
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
        })
        toast.success('🔄 Pengaturan direset ke default!')
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error('❌ Gagal mereset pengaturan')
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Setting Management</h1>

      {/* ===== LIVE PREVIEW (SEPERTI YANG ANDA INGINKAN) ===== */}
      <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gray-100 px-4 py-0.5 border-b border-gray-200 text-xs text-gray-500 font-medium flex items-center gap-2">
          <span>👁️ Live Preview Website</span>
        </div>

        {/* Header / Navbar */}
        <div className="bg-white px-5 py-1 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo - PRIMARY */}
            <div 
              className="w-1.5 h-6 rounded-lg shadow-sm" 
              style={{ backgroundColor: settings.colorPrimary }}
            ></div>
            {/* Nama Website - PRIMARY */}
            <span 
              className="font-bold tracking-tight text-2xl"
              style={{ color: settings.colorPrimary }}
            >
              {settings.siteName || "Nama Website"}
            </span>
          </div>
          
          <div className="hidden sm:flex gap-3">
            <div className="w-10 h-1.5 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-1.5 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-1.5 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="p-2 text-center flex flex-col items-center justify-center">
          {/* Judul - PRIMARY */}
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: settings.colorPrimary }}
          >
            Selamat Datang di {settings.siteName || "Website Kami"}
          </h3>

          {/* Deskripsi - SECONDARY */}
          <p 
            className="text-sm mb-3 max-w-sm mx-auto"
            style={{ color: settings.colorSecondary }}
          >
            Ini adalah gambaran bagaimana perpaduan warna dan identitas website Anda akan terlihat oleh pengunjung.
          </p>

          {/* Garis aksen - SECONDARY */}
          <div 
            className="w-16 h-0.5 rounded-full mb-3"
            style={{ backgroundColor: settings.colorSecondary }}
          ></div>

          {/* Tombol - BUTTON */}
          <button
            className="px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md active:scale-95 flex items-center gap-2"
            style={{ backgroundColor: settings.colorButton }}
          >
            Mulai Sekarang
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          {/* Indikator Warna */}
          <div className="flex items-center gap-6 mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Primary:</span>
              <div 
                className="w-5 h-5 rounded border border-gray-200"
                style={{ backgroundColor: settings.colorPrimary }}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Secondary:</span>
              <div 
                className="w-5 h-5 rounded border border-gray-200"
                style={{ backgroundColor: settings.colorSecondary }}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Button:</span>
              <div 
                className="w-5 h-5 rounded border border-gray-200"
                style={{ backgroundColor: settings.colorButton }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FORM SETTINGS ===== */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        {/* Nama Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Website</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleChange('siteName', e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
          />
          <p className="text-xs text-gray-400 mt-1">Warna <span className="font-medium">Primary</span> akan mengubah warna nama website</p>
        </div>

        {/* Email & WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
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
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Warna */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎨 Warna</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary</label>
              <input
                type="color"
                value={settings.colorPrimary}
                onChange={(e) => handleChange('colorPrimary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Nama website & judul</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary</label>
              <input
                type="color"
                value={settings.colorSecondary}
                onChange={(e) => handleChange('colorSecondary', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Deskripsi & aksen</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button</label>
              <input
                type="color"
                value={settings.colorButton}
                onChange={(e) => handleChange('colorButton', e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Tombol CTA</p>
            </div>
          </div>
        </div>

        {/* Font & GA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* URL Gambar */}
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

        {/* JSON Fields */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 JSON Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Content (JSON)</label>
              <textarea
                rows={3}
                value={settings.footerContent}
                onChange={(e) => handleChange('footerContent', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"copyright": "© 2024", "links": [...]}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Operating Hours (JSON)</label>
              <textarea
                rows={3}
                value={settings.operatingHours}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                placeholder='{"monday": {"open": "09:00", "close": "18:00"}}'
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Social Links (JSON)</label>
            <textarea
              rows={2}
              value={settings.socialLinks}
              onChange={(e) => handleChange('socialLinks', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 font-mono text-sm"
              placeholder='{"instagram": "https://instagram.com/", "facebook": "https://facebook.com/"}'
            />
          </div>
          <div className="mt-4">
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

        {/* SEO Default OG Image */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">🔍 SEO (Default)</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default OG Image URL</label>
            <input
              type="text"
              value={settings.defaultOgImage || ''}
              onChange={(e) => handleChange('defaultOgImage', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              placeholder="https://example.com/default-og-image.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Gambar ini akan digunakan sebagai fallback jika produk/blog tidak memiliki OG Image sendiri.
            </p>
          </div>
        </div>

        {/* GA & SEO */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">📊 Google Analytics & SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Judul untuk SEO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <input
                type="text"
                value={settings.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                placeholder="Deskripsi untuk SEO"
              />
            </div>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
