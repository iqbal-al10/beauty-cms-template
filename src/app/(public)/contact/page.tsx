'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react'
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

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
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
    
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('Nama dan pesan harus diisi')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      const successMsg = settings?.contactSuccessMessage || 'Thank you for your message! We will get back to you soon.'
      toast.success(successMsg)
      setForm({ name: '', email: '', whatsapp: '', message: '' })
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Gagal mengirim pesan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
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
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">Contact</span>
      </nav>

      {/* Hero */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
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

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4" style={{ fontSize: bodyFontSize }}>{contactFormTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>Nama *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>WhatsApp</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  placeholder="6281234567890"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: smallFontSize }}>Pesan *</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none resize-none"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
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

      {/* Google Maps */}
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

      {/* CTA */}
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