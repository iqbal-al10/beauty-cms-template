'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  fontFamily: string
  address: string | null
  whatsappNumber: string | null
  email: string | null
  socialLinks: any
  bodyFontSize: string
  smallFontSize: string
  headingFontSize: string
  secondaryBackground: string
  headingColor: string
  bodyTextColor: string
  copyrightText: string
  footerLinks: any
  primaryBackground: string
  contactHeroTitle: string
  contactHeroSubtitle: string
  contactFormTitle: string
  contactSuccessMessage: string
  googleMapsEmbedUrl: string
  operatingHours: any
}

const CONTACT_STORAGE_KEY = 'beauty_contact_data'

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const primaryColor = '#c4367b'
  const headingFontSize = '32px'
  const bodyFontSize = '16px'
  const smallFontSize = '14px'
  const fontFamily = 'Inter'

  useEffect(() => {
    const savedData = localStorage.getItem(CONTACT_STORAGE_KEY)
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
        }))
      } catch (e) {
        console.error('Error loading contact data:', e)
      }
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    if (!form.email.trim()) {
      toast.error('Email wajib diisi')
      return
    }
    if (!form.whatsapp.trim()) {
      toast.error('Nomor WhatsApp wajib diisi')
      return
    }
    if (!form.message.trim()) {
      toast.error('Pesan wajib diisi')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Format email tidak valid')
      return
    }

    const whatsappClean = form.whatsapp.replace(/[^0-9]/g, '')
    if (whatsappClean.length < 10) {
      toast.error('Nomor WhatsApp tidak valid (minimal 10 digit)')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          whatsapp: whatsappClean,
          message: form.message.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: whatsappClean,
      }))

      const successMsg = settings?.contactSuccessMessage || '✅ Pesan Anda telah terkirim! Kami akan segera merespon.'
      toast.success(successMsg)
      
      setSubmitted(true)
      
      setForm({ name: '', email: '', whatsapp: '', message: '' })

    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Gagal mengirim pesan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendAnother = () => {
    setSubmitted(false)
    const savedData = localStorage.getItem(CONTACT_STORAGE_KEY)
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
        }))
      } catch (e) {
        console.error('Error loading contact data:', e)
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse" style={{ fontFamily }}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
        <div className="rounded-2xl p-10 mb-12 bg-gray-200 h-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-32 bg-gray-200 rounded w-full" />
                <div className="h-12 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const siteName = settings?.siteName || 'Beauty Studio'
  const address = settings?.address || null
  const whatsappNumber = settings?.whatsappNumber || null
  const email = settings?.email || null
  const operatingHours = settings?.operatingHours || null
  const googleMapsEmbedUrl = settings?.googleMapsEmbedUrl || null

  const contactHeroTitle = settings?.contactHeroTitle || 'Contact Us'
  const contactHeroSubtitle = settings?.contactHeroSubtitle || "We'd love to hear from you"
  const contactFormTitle = settings?.contactFormTitle || 'Send Us a Message'

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">Contact</span>
      </nav>

      <div 
        className="rounded-2xl p-10 text-center mb-12"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${settings?.colorSecondary || '#f5dbe8'} 100%)`,
        }}
      >
        <h1 className="font-bold text-white" style={{ fontSize: headingFontSize }}>
          {contactHeroTitle}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto" style={{ fontSize: bodyFontSize }}>
          {contactHeroSubtitle}
        </p>
      </div>

      {submitted && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-green-800">✅ Pesan Terkirim!</h3>
          <p className="text-green-600 text-sm mt-1">
            {settings?.contactSuccessMessage || 'Terima kasih! Kami akan segera merespon pesan Anda.'}
          </p>
          <button
            onClick={handleSendAnother}
            className="mt-4 px-6 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Kirim Pesan Lain
          </button>
        </div>
      )}

      {!submitted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4" style={{ fontSize: bodyFontSize }}>Get in Touch</h3>
              {address && (
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <p className="text-gray-600" style={{ fontSize: smallFontSize }}>{address}</p>
                </div>
              )}
              {whatsappNumber && (
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} className="text-gray-600 hover:opacity-70" style={{ fontSize: smallFontSize }}>
                    {whatsappNumber}
                  </a>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  <a href={`mailto:${email}`} className="text-gray-600 hover:opacity-70" style={{ fontSize: smallFontSize }}>
                    {email}
                  </a>
                </div>
              )}
              {operatingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <div>
                    {typeof operatingHours === 'object' && !Array.isArray(operatingHours) ? (
                      Object.entries(operatingHours).map(([day, hours]) => (
                        <p key={day} className="text-gray-600" style={{ fontSize: smallFontSize }}>
                          {day}: {String(hours)}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-600" style={{ fontSize: smallFontSize }}>{String(operatingHours)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4" style={{ fontSize: bodyFontSize }}>{contactFormTitle}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    placeholder="email@example.com"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email diperlukan untuk membalas pesan Anda</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>
                    WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    placeholder="6281234567890"
                  />
                  <p className="text-xs text-gray-400 mt-1">Nomor WhatsApp yang bisa dihubungi</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>
                    Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all resize-none"
                    placeholder="Tulis pesan Anda..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor, fontSize: bodyFontSize }}
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {googleMapsEmbedUrl && (
        <div className="mt-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <iframe
            src={googleMapsEmbedUrl}
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
          />
        </div>
      )}

      <div 
        className="rounded-2xl p-10 text-center mt-12"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${settings?.colorSecondary || '#f5dbe8'} 100%)`,
        }}
      >
        <h2 className="font-bold text-white mb-3" style={{ fontSize: headingFontSize }}>
          Ready to Glow?
        </h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto" style={{ fontSize: bodyFontSize }}>
          Book your appointment today and experience the best beauty services
        </p>
        <Link
          href="/booking"
          className="inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          style={{ fontSize: bodyFontSize }}
        >
          Book Now
        </Link>
      </div>
    </div>
  )
}