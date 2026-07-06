/**
 * Utility untuk mengelola cookie consent
 */

const CONSENT_KEY = 'cookie_consent'
const TIMESTAMP_KEY = 'cookie_consent_timestamp'
const PREFERENCES_KEY = 'cookie_preferences'
const CONSENT_DURATION_DAYS = 30

export interface CookieConsent {
  status: 'accepted' | 'rejected' | null
  timestamp: number | null
}

export interface CookiePreferences {
  essential: boolean
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

/**
 * Mendapatkan status consent user
 */
export function getCookieConsent(): CookieConsent {
  if (typeof window === 'undefined') {
    return { status: null, timestamp: null }
  }

  const status = localStorage.getItem(CONSENT_KEY) as 'accepted' | 'rejected' | null
  const timestamp = localStorage.getItem(TIMESTAMP_KEY)
  
  return {
    status: status || null,
    timestamp: timestamp ? parseInt(timestamp) : null,
  }
}

/**
 * Cek apakah user sudah memberikan consent
 */
export function hasCookieConsent(): boolean {
  const { status, timestamp } = getCookieConsent()
  
  if (!status || !timestamp) return false
  
  const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
  return daysSince < CONSENT_DURATION_DAYS
}

/**
 * Cek apakah user menerima cookie
 */
export function isCookieAccepted(): boolean {
  const { status, timestamp } = getCookieConsent()
  
  if (!status || !timestamp) return false
  
  const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
  return status === 'accepted' && daysSince < CONSENT_DURATION_DAYS
}

/**
 * Set consent ke localStorage
 */
export function setCookieConsent(status: 'accepted' | 'rejected'): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(CONSENT_KEY, status)
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString())
}

/**
 * 🔥 BARU: Mendapatkan preferensi cookie user
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES
  }

  const saved = localStorage.getItem(PREFERENCES_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return {
        essential: true,
        analytics: parsed.analytics || false,
        marketing: parsed.marketing || false,
        preferences: parsed.preferences || false,
      }
    } catch (e) {
      return DEFAULT_PREFERENCES
    }
  }
  return DEFAULT_PREFERENCES
}

/**
 * 🔥 BARU: Set preferensi cookie
 */
export function setCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}

/**
 * 🔥 BARU: Cek apakah jenis cookie tertentu diizinkan
 */
export function isCookieTypeAllowed(type: 'analytics' | 'marketing' | 'preferences'): boolean {
  const prefs = getCookiePreferences()
  return prefs[type] || false
}

/**
 * Hapus consent (reset)
 */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(CONSENT_KEY)
  localStorage.removeItem(TIMESTAMP_KEY)
  localStorage.removeItem(PREFERENCES_KEY)
}

/**
 * Dapatkan durasi consent dalam hari
 */
export function getConsentDuration(): number {
  return CONSENT_DURATION_DAYS
}