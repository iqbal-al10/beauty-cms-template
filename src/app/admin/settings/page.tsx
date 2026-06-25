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
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('❌ Gagal memuat pengaturan')
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

      toast.success('Pengaturan berhasil disimpan!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan')
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Website</h1>

      {/* ===== PREVIEW LED / LAYAR ELEGAN ===== */}
      <div 
        className="rounded-xl p-5 mb-6 border border-pink-100 shadow-lg relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fdf2f8 30%, #fce7f3 60%, #f7def2 100%)',
        }}
      >
        {/* Efek kaca/glare tipis */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.6) 0%, transparent 70%)',
          }}
        ></div>
        
        <div className="flex items-center gap-6 flex-wrap relative z-10">
          {/* Nama Website - Efek LED */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">🏷️ Nama Website:</span>
            <span 
              className="text-xl font-bold tracking-wide"
              style={{
                color: settings.colorPrimary,
                textShadow: `0 0 6px ${settings.colorPrimary}66, 0 0 12px ${settings.colorPrimary}33`,
              }}
            >
              {settings.siteName}
            </span>
          </div>
          
          {/* Primary - Kotak warna */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Primary:</span>
            <div 
              className="w-8 h-8 rounded-lg border border-gray-200 shadow-md"
              style={{ 
                backgroundColor: settings.colorPrimary,
                boxShadow: `0 0 10px ${settings.colorPrimary}40`,
              }}
            ></div>
          </div>

          {/* Secondary - Kotak warna */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Secondary:</span>
            <div 
              className="w-8 h-8 rounded-lg border border-gray-200 shadow-md"
              style={{ 
                backgroundColor: settings.colorSecondary,
                boxShadow: `0 0 10px ${settings.colorSecondary}40`,
              }}
            ></div>
          </div>

          {/* Button - Tombol */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Button:</span>
            <button
              className="px-5 py-1.5 rounded-lg text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: settings.colorButton,
                boxShadow: `0 2px 8px ${settings.colorButton}60`,
              }}
            >
              Tombol
            </button>
          </div>
        </div>
      </div>

      {/* ===== FORM LENGKAP ===== */}
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

        {/* Alamat */}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
            <input
              type="color"
              value={settings.colorPrimary}
              onChange={(e) => handleChange('colorPrimary', e.target.value)}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
            <input
              type="color"
              value={settings.colorSecondary}
              onChange={(e) => handleChange('colorSecondary', e.target.value)}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Button Color</label>
            <input
              type="color"
              value={settings.colorButton}
              onChange={(e) => handleChange('colorButton', e.target.value)}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
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
          <h3 className="font-semibold text-gray-800 mb-2">JSON Configuration</h3>
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

        {/* SEO */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <input
                type="text"
                value={settings.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
