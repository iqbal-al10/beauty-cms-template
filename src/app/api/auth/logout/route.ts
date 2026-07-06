import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { logActivity } from '@/middleware/activityLogger'
import { getCookieName } from '@/lib/cookies'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (user) {
      await logActivity(user.id, 'LOGOUT', 'User', user.id, {
        email: user.email,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Logout activity error:', error)
  }

  const response = NextResponse.json({ success: true })
  
  // 🔥 HAPUS COOKIE LAMA
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
  response.cookies.delete('token')
  
  // 🔥 HAPUS COOKIE WHITE-LABEL (dinamis)
  const cookieName = await getCookieName()
  response.cookies.delete(cookieName)
  
  // 🔥 SET COOKIE KADALUARSA UNTUK YANG LAMA
  response.cookies.set('accessToken', '', {
    maxAge: -1,
    path: '/',
  })
  response.cookies.set('token', '', {
    maxAge: -1,
    path: '/',
  })
  
  // 🔥 SET COOKIE KADALUARSA UNTUK WHITE-LABEL
  response.cookies.set(cookieName, '', {
    maxAge: -1,
    path: '/',
  })

  return response
}