'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Settings {
  whatsappNumber: string | null
  siteName: string
  colorButton: string
  whatsappQuickReplies?: Array<{ label: string; message: string }> | null
  whatsappAutoMessage?: string | null
  whatsappFloatPosition?: string | null
  operatingHours?: any
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

// Helper: cek apakah sekarang dalam jam operasional
function isWithinOperatingHours(operatingHours: any): boolean {
  if (!operatingHours) return true // kalau tidak ada data, anggap selalu buka

  let hours = operatingHours
  if (typeof hours === 'string') {
    try { hours = JSON.parse(hours) } catch { return true }
  }
  if (typeof hours !== 'object' || Array.isArray(hours)) return true

  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const todaySchedule = hours[dayOfWeek] || hours[dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)]

  if (!todaySchedule) return true

  let scheduleStr = ''
  if (typeof todaySchedule === 'string') {
    scheduleStr = todaySchedule
  } else if (typeof todaySchedule === 'object' && todaySchedule !== null) {
    const open = (todaySchedule as any).open
    const close = (todaySchedule as any).close
    if (open && close) scheduleStr = `${open}-${close}`
  }

  if (!scheduleStr || scheduleStr.toLowerCase() === 'closed') return false

  const parts = scheduleStr.split('-').map(s => s.trim())
  if (parts.length !== 2) return true

  const [openTime, closeTime] = parts

  // Handle jadwal yang melewati tengah malam (misal 22:00-02:00)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime
  }

  return currentTime >= openTime && currentTime <= closeTime
}

// Helper: format operating hours untuk hari ini
function getTodayOperatingHours(operatingHours: any): string | null {
  if (!operatingHours) return null

  let hours = operatingHours
  if (typeof hours === 'string') {
    try { hours = JSON.parse(hours) } catch { return null }
  }
  if (typeof hours !== 'object' || Array.isArray(hours)) return null

  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todaySchedule = hours[dayOfWeek] || hours[dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)]

  if (!todaySchedule) return null

  if (typeof todaySchedule === 'string') return todaySchedule
  if (typeof todaySchedule === 'object' && todaySchedule !== null) {
    return `${(todaySchedule as any).open} - ${(todaySchedule as any).close}`
  }
  return null
}

export default function WhatsAppFloat({ settings }: WhatsAppFloatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [hasBounced, setHasBounced] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const phoneNumber = settings?.whatsappNumber || ''
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  const buttonColor = settings?.colorButton || '#c4367b'
  const siteName = settings?.siteName || 'Beauty Studio'
  const operatingHours = settings?.operatingHours || null

  const quickReplies = settings?.whatsappQuickReplies || DEFAULT_QUICK_REPLIES
  const autoMessage = settings?.whatsappAutoMessage || DEFAULT_AUTO_MESSAGE
  const position = settings?.whatsappFloatPosition || 'bottom-right'

  const positionClasses = position === 'bottom-left'
    ? 'bottom-6 left-6'
    : 'bottom-6 right-6'
  const popupPosition = position === 'bottom-left'
    ? 'bottom-20 left-0'
    : 'bottom-20 right-0'
  const tooltipPosition = position === 'bottom-left'
    ? 'left-16 bottom-2'
    : 'right-16 bottom-2'

  const isOnline = isWithinOperatingHours(operatingHours)
  const todayHours = getTodayOperatingHours(operatingHours)

  // 🔥 FITUR 1: Tooltip otomatis hilang setelah 8 detik
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [showTooltip])

  // 🔥 FITUR 2: Animasi bounce pertama kali
  useEffect(() => {
    if (!hasBounced) {
      const timer = setTimeout(() => setHasBounced(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [hasBounced])

  // 🔥 FITUR 3: Klik di luar popup untuk menutup
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // 🔥 FITUR 4: Tombol ESC untuk menutup popup
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  // 🔥 FITUR 5: Scroll lock di mobile saat popup terbuka
  useEffect(() => {
    if (!isOpen) return

    const isMobile = window.innerWidth < 640
    if (!isMobile) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // 🔥 EFFECT: Blinking (dari kode original, tidak diubah)
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      return
    }

    let timeoutId: NodeJS.Timeout

    const blink = () => {
      setIsVisible(true)

      timeoutId = setTimeout(() => {
        setIsVisible(false)

        timeoutId = setTimeout(() => {
          blink()
        }, 3000)
      }, 7000)
    }

    blink()

    return () => clearTimeout(timeoutId)
  }, [isOpen])

  if (!cleanNumber) return null

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(autoMessage)}`

  const handleToggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        setIsVisible(true)
        setShowTooltip(false) // 🔥 Sembunyikan tooltip saat popup dibuka
      }
      return !prev
    })
  }, [])

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* 🔥 FITUR 1: Tooltip */}
      {!isOpen && isVisible && showTooltip && (
        <div
          className={`absolute ${tooltipPosition} bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          💬 Chat with us!
          <div
            className={`absolute bottom-0 ${position === 'bottom-left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} translate-y-full`}
          >
            <div className="w-2 h-2 bg-gray-800 rotate-45" />
          </div>
        </div>
      )}

      {isOpen && (
        <div
          ref={popupRef}
          className={`absolute ${popupPosition} w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300`}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3 text-white"
            style={{ backgroundColor: buttonColor }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              {/* 🔥 FITUR 6: Online/Offline indicator */}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`}
              />
            </div>
            <div>
              <p className="font-semibold text-sm">{siteName}</p>
              <p className="text-xs opacity-90">
                {isOnline ? '🟢 Online' : '⚫ Offline'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* 🔥 FITUR 7: Jam operasional hari ini */}
          {todayHours && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500">
                🕐 Hari ini: <span className="font-medium text-gray-700">{todayHours}</span>
              </p>
            </div>
          )}

          {/* 🔥 FITUR 8: Greeting message */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">💬</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  {isOnline
                    ? 'Halo! Ada yang bisa kami bantu? 😊'
                    : 'Halo! Saat ini kami sedang offline. Silakan tinggalkan pesan, kami akan membalas secepatnya.'}
                </p>
              </div>
            </div>
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
              {isOnline ? 'Send Message' : 'Leave a Message'}
            </a>
          </div>
        </div>
      )}

      {/* Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'scale-90'
            : hasBounced
            ? 'hover:scale-110'
            : 'animate-bounce hover:scale-110'
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