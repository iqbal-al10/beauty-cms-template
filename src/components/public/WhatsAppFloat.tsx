'use client'

import { useState, useEffect } from 'react'

interface Settings {
  whatsappNumber: string | null
  siteName: string
  colorButton: string
}

interface WhatsAppFloatProps {
  settings?: Settings | null
}

export default function WhatsAppFloat({ settings }: WhatsAppFloatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const phoneNumber = settings?.whatsappNumber || ''
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  const buttonColor = settings?.colorButton || '#c4367b'
  const siteName = settings?.siteName || 'Beauty Studio'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setIsVisible(false)
    }, 10000)
    return () => clearTimeout(timer)
  }, [isOpen])

  if (!cleanNumber) return null

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Halo%20${encodeURIComponent(siteName)}%2C%20saya%20ingin%20bertanya%20tentang%20layanan%20Anda.`

  const quickReplies = [
    { label: '💆‍♀️ Booking', message: 'Saya ingin booking layanan' },
    { label: '📦 Product', message: 'Saya ingin tanya tentang produk' },
    { label: '💰 Price', message: 'Berapa harga layanannya?' },
    { label: '📅 Schedule', message: 'Saya ingin cek jadwal' },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className="px-4 py-3 flex items-center gap-3 text-white"
            style={{ backgroundColor: buttonColor }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">{siteName}</p>
              <p className="text-xs opacity-90">Usually replies in minutes</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="p-3 space-y-2">
            <p className="text-xs text-gray-400 font-medium">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <a
                  key={reply.label}
                  href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(reply.message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  {reply.label}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 p-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white text-center py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: buttonColor }}
            >
              Send Message
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (!isOpen) setIsVisible(true)
          setIsOpen(!isOpen)
        }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'scale-90' : 'hover:scale-110'
        } ${!isVisible && !isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ backgroundColor: buttonColor }}
        aria-label="WhatsApp chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        )}
      </button>

      {!isOpen && isVisible && (
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
      )}
    </div>
  )
}
