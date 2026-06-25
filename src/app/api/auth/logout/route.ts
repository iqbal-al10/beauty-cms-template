import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { logActivity } from '@/middleware/activityLogger'

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
  
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
  response.cookies.delete('token')
  
  response.cookies.set('accessToken', '', {
    maxAge: -1,
    path: '/',
  })
  response.cookies.set('token', '', {
    maxAge: -1,
    path: '/',
  })

  return response
}
