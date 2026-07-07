'use client'

import { useState, useEffect } from 'react'

interface Settings {
  whatsappNumber: string | null
  siteName: string
  colorButton: string
  whatsappQuickReplies?: Array<{ label: string; message: string }> | null
  whatsappAutoMessage?: string | null
  whatsappFloatPosition?: string | null
}

interface WhatsAppFloatProps {
  settings?: Settings | null
}

const DEFAULT_QUICK_REPLIES = [
  { label: '💆‍♀️ Booking', message: 'Saya ingin booking layanan' },
  { label: '📦 Product', message: 'Saya ingin tanya tentang produk' },
  { label: '💰 Price', message: 'Berapa harga layanannya?' },
  { label: '📅 Schedule', message: 'Saya ingin cek jadwal' },
]

const DEFAULT_AUTO_MESSAGE = 'Halo, saya ingin bertanya tentang layanan Anda.'

export default function WhatsAppFloat({ settings }: WhatsAppFloatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const phoneNumber = settings?.whatsappNumber || ''
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  const buttonColor = settings?.colorButton || '#c4367b'
  const siteName = settings?.siteName || 'Beauty Studio'
  
  const quickReplies = settings?.whatsappQuickReplies || DEFAULT_QUICK_REPLIES
  const autoMessage = settings?.whatsappAutoMessage || DEFAULT_AUTO_MESSAGE
  const position = settings?.whatsappFloatPosition || 'bottom-right'
  
  const positionClasses = position === 'bottom-left' 
    ? 'bottom-6 left-6' 
    : 'bottom-6 right-6'
  const popupPosition = position === 'bottom-left'
    ? 'bottom-20 left-0'
    : 'bottom-20 right-0'

  // 🔥 EFFECT: BLINKING - muncul 3 detik, hilang 10 detik, berulang
  useEffect(() => {
    // Jangan jalankan efek jika popup sedang terbuka
    if (isOpen) {
      setIsVisible(true)
      return
    }

    let timeoutId: NodeJS.Timeout

    const blink = () => {
      // Muncul selama 3 detik
      setIsVisible(true)
      
      // Setelah 3 detik, hilang selama 10 detik
      timeoutId = setTimeout(() => {
        setIsVisible(false)
        
        // Setelah 10 detik, muncul lagi (loop)
        timeoutId = setTimeout(() => {
          blink()
        }, 10000) // 10 detik hilang
      }, 3000) // 3 detik muncul
    }

    // Mulai blinking
    blink()

    return () => clearTimeout(timeoutId)
  }, [isOpen])

  if (!cleanNumber) return null

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(autoMessage)}`

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {isOpen && (
        <div className={`absolute ${popupPosition} w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          {/* Header */}
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

          {/* Quick Replies */}
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

          {/* Send Button */}
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

      {/* Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setIsVisible(true)
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

      {/* Notification Dot */}
      {!isOpen && isVisible && (
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
      )}
    </div>
  )
}