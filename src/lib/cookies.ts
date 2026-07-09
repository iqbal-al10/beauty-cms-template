import { prisma } from './prisma'

// 🔥 IN-MEMORY CACHE
let cachedCookieName: string | null = null
let cachedSessionDuration: number | null = null
let cacheExpiry = 0
const CACHE_TTL = 60 * 1000 // 1 menit

function isCacheValid(): boolean {
  return Date.now() < cacheExpiry
}

function setCache(cookieName: string, sessionDuration: number) {
  cachedCookieName = cookieName
  cachedSessionDuration = sessionDuration
  cacheExpiry = Date.now() + CACHE_TTL
}

async function fetchSettings(): Promise<{ cookiePrefix: string | null; sessionDuration: number | null }> {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
      select: { cookiePrefix: true, sessionDuration: true }
    })
    return {
      cookiePrefix: settings?.cookiePrefix || null,
      sessionDuration: settings?.sessionDuration || null,
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { cookiePrefix: null, sessionDuration: null }
  }
}

/**
 * Mendapatkan nama cookie dari database berdasarkan prefix
 * @returns Nama cookie yang dinamis (contoh: beauty_token)
 */
export async function getCookieName(): Promise<string> {
  try {
    // 🔥 GUNAKAN CACHE JIKA MASIH VALID
    if (isCacheValid() && cachedCookieName) {
      return cachedCookieName
    }

    const settings = await fetchSettings()
    const prefix = settings.cookiePrefix || 'beauty'
    const cookieName = `${prefix}_token`

    // 🔥 SIMPAN KE CACHE
    cachedCookieName = cookieName

    return cookieName
  } catch (error) {
    console.error('Error getting cookie name:', error)
    return 'beauty_token'
  }
}

/**
 * Mendapatkan durasi session dari database
 * @returns Durasi session dalam hari (default: 7)
 */
export async function getSessionDuration(): Promise<number> {
  try {
    // 🔥 GUNAKAN CACHE JIKA MASIH VALID
    if (isCacheValid() && cachedSessionDuration !== null) {
      return cachedSessionDuration
    }

    const settings = await fetchSettings()
    const duration = settings.sessionDuration || 7

    // 🔥 SIMPAN KE CACHE
    cachedSessionDuration = duration

    return duration
  } catch (error) {
    console.error('Error getting session duration:', error)
    return 7
  }
}

/**
 * Mendapatkan opsi cookie untuk digunakan di response
 * @returns Object cookie options
 */
export async function getCookieOptions() {
  const sessionDays = await getSessionDuration()
  const isProduction = process.env.NODE_ENV === 'production'
  const domain = process.env.COOKIE_DOMAIN || undefined

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    domain: domain,
    path: '/',
    maxAge: sessionDays * 24 * 60 * 60, // dalam detik
  }
}