import { prisma } from './prisma'

/**
 * Mendapatkan nama cookie dari database berdasarkan prefix
 * @returns Nama cookie yang dinamis (contoh: beauty_token)
 */
export async function getCookieName(): Promise<string> {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
      select: { cookiePrefix: true }
    })
    const prefix = settings?.cookiePrefix || 'beauty'
    return `${prefix}_token`
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
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
      select: { sessionDuration: true }
    })
    return settings?.sessionDuration || 7
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