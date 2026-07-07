'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

interface Settings {
  siteName: string
  colorPrimary: string
  colorSecondary: string
  fontFamily: string
  headingFontSize: string
  bodyFontSize: string
  smallFontSize: string
  secondaryBackground: string
  headingColor: string
  bodyTextColor: string
}

export default function PublicFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  
  // 🔥 TAMBAHKAN STATE UNTUK PENCARIAN
  const [searchQuery, setSearchQuery] = useState('')

  const primaryColor = '#c4367b'
  const headingFontSize = '32px'
  const bodyFontSize = '16px'
  const smallFontSize = '14px'
  const fontFamily = 'Inter'

  useEffect(() => {
    fetchFaqs()
    fetchSettings()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/public/faq')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFaqs(data || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // 🔥 FILTER FAQ BERDASARKAN SEARCH QUERY
  const activeFaqs = faqs
    .filter(faq => faq.isActive)
    .filter(faq => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase().trim()
      return faq.question.toLowerCase().includes(query) ||
             faq.answer.toLowerCase().includes(query)
    })
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  // 🔥 HITUNG JUMLAH HASIL PENCARIAN
  const totalResults = activeFaqs.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: fontFamily }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" style={{ fontSize: smallFontSize }}>
        <Link href="/" className="hover:text-[#c4367b] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-800">FAQ</span>
      </nav>

      {/* Hero */}
      <div 
        className="rounded-2xl p-10 text-center mb-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${settings?.colorSecondary || '#f5dbe8'} 100%)`,
        }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="font-bold text-white" style={{ fontSize: headingFontSize }}>
          Frequently Asked Questions
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto" style={{ fontSize: bodyFontSize }}>
          Temukan jawaban atas pertanyaan yang paling sering diajukan
        </p>
      </div>

      {/* 🔥 SEARCH BOX */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search question here..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            style={{ fontSize: bodyFontSize }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2" style={{ fontSize: smallFontSize }}>
            Menampilkan <span className="font-medium text-pink-500">{totalResults}</span> hasil untuk "{searchQuery}"
          </p>
        )}
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto">
        {activeFaqs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500" style={{ fontSize: bodyFontSize }}>
              {searchQuery ? 'Tidak ada pertanyaan yang sesuai dengan pencarian Anda.' : 'Belum ada pertanyaan yang sering diajukan.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Hapus filter
              </button>
            )}
            <p className="text-sm text-gray-400 mt-1" style={{ fontSize: smallFontSize }}>
              {!searchQuery && 'Silakan hubungi kami jika ada pertanyaan.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeFaqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                  style={{ borderColor: isOpen ? primaryColor : undefined }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800" style={{ fontSize: bodyFontSize }}>
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 ml-4">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" style={{ color: primaryColor }} />
                      ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: primaryColor }} />
                      )}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed" style={{ fontSize: bodyFontSize }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Still have questions? */}
        <div className="mt-8 text-center">
          <p className="text-gray-500" style={{ fontSize: bodyFontSize }}>
            Masih ada pertanyaan?
          </p>
          <Link
            href="/contact"
            className="inline-block mt-2 px-6 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontSize: smallFontSize }}
          >
            Hubungi Kami
          </Link>
        </div>
      </div>

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