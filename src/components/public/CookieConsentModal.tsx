'use client'

import { useState, useEffect } from 'react'
import { X, Check, Shield, Cookie, ChevronDown, ChevronUp } from 'lucide-react'

interface CookieConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (preferences: CookiePreferences) => void
  primaryColor: string
  secondaryBackground: string
  primaryBackground: string
  headingColor: string
  bodyTextColor: string
}

export interface CookiePreferences {
  essential: boolean // selalu true, tidak bisa dimatikan
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
}

export default function CookieConsentModal({
  isOpen,
  onClose,
  onSave,
  primaryColor,
  secondaryBackground,
  primaryBackground,
  headingColor,
  bodyTextColor,
}: CookieConsentModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Load existing preferences from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('cookie_preferences')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPreferences({
            essential: true,
            analytics: parsed.analytics || false,
            marketing: parsed.marketing || false,
            preferences: parsed.preferences || false,
          })
        } catch (e) {
          setPreferences(DEFAULT_PREFERENCES)
        }
      } else {
        setPreferences(DEFAULT_PREFERENCES)
      }
    }
  }, [isOpen])

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return // Essential tidak bisa dimatikan
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = () => {
    onSave(preferences)
    onClose()
  }

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    onSave(allAccepted)
    onClose()
  }

  if (!isOpen) return null

  const cookieOptions = [
    {
      key: 'essential' as const,
      label: 'Essential (Wajib)',
      description: 'Cookie yang diperlukan untuk fungsi dasar website seperti login, keamanan, dan keranjang belanja.',
      icon: '🔒',
      required: true,
    },
    {
      key: 'analytics' as const,
      label: 'Analytics',
      description: 'Cookie untuk menganalisis perilaku pengunjung dan meningkatkan performa website (Google Analytics).',
      icon: '📊',
      required: false,
    },
    {
      key: 'marketing' as const,
      label: 'Marketing',
      description: 'Cookie untuk menampilkan iklan yang relevan dan mengukur efektivitas kampanye pemasaran.',
      icon: '📢',
      required: false,
    },
    {
      key: 'preferences' as const,
      label: 'Preferences',
      description: 'Cookie untuk menyimpan preferensi Anda seperti tema gelap/terang, bahasa, dan pengaturan lainnya.',
      icon: '⚙️',
      required: false,
    },
  ]

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ 
          backgroundColor: primaryBackground || '#ffffff',
          color: bodyTextColor || '#4b5563',
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ 
            borderColor: `${primaryColor}20`,
            backgroundColor: secondaryBackground || '#f9fafb',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Shield className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: headingColor || '#111827' }}>
                Pengaturan Cookie
              </h2>
              <p className="text-xs" style={{ color: bodyTextColor || '#4b5563', opacity: 0.7 }}>
                Pilih cookie yang ingin Anda izinkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: bodyTextColor || '#4b5563' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {cookieOptions.map((option) => {
            const isChecked = preferences[option.key]
            const isExpanded = expanded === option.key

            return (
              <div
                key={option.key}
                className="rounded-xl border p-4 transition-all"
                style={{ 
                  borderColor: isChecked ? primaryColor : `${primaryColor}20`,
                  backgroundColor: isChecked ? `${primaryColor}05` : 'transparent',
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(option.key)}
                    disabled={option.required}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                      isChecked ? 'bg-pink-500' : 'bg-gray-300'
                    } ${option.required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: isChecked ? primaryColor : '#d1d5db' }}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  {/* Label & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-sm" style={{ color: headingColor || '#111827' }}>
                        {option.label}
                      </span>
                      {option.required && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                        }}>
                          Wajib
                        </span>
                      )}
                    </div>
                    
                    {/* Deskripsi (collapsible) */}
                    <div className="mt-1">
                      <p 
                        className={`text-xs transition-all ${
                          isExpanded ? 'block' : 'line-clamp-1'
                        }`}
                        style={{ color: bodyTextColor || '#4b5563', opacity: 0.7 }}
                      >
                        {option.description}
                      </p>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : option.key)}
                        className="text-xs font-medium mt-0.5 hover:underline"
                        style={{ color: primaryColor }}
                      >
                        {isExpanded ? 'Sembunyikan' : 'Baca selengkapnya'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Info tambahan */}
          <div 
            className="text-xs p-3 rounded-lg text-center"
            style={{ 
              backgroundColor: `${primaryColor}08`,
              color: bodyTextColor || '#4b5563',
              opacity: 0.7,
            }}
          >
            <Cookie className="w-4 h-4 inline mr-1" style={{ color: primaryColor }} />
            Anda dapat mengubah pengaturan ini kapan saja melalui link "Pengaturan Cookie" di footer
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex flex-col sm:flex-row gap-3 flex-shrink-0"
          style={{ 
            borderColor: `${primaryColor}20`,
            backgroundColor: secondaryBackground || '#f9fafb',
          }}
        >
          <button
            onClick={handleAcceptAll}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 flex-1"
            style={{ backgroundColor: primaryColor }}
          >
            Accept All
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 flex-1"
            style={{ 
              color: headingColor || '#111827',
              backgroundColor: secondaryBackground || '#f9fafb',
              border: `1px solid ${primaryColor}30`,
            }}
          >
            Simpan Preferensi
          </button>
        </div>
      </div>
    </div>
  )
}