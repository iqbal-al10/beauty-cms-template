import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/public/',
  '/products',
  '/blog',
  '/contact',
  '/about',
  '/booking',
  '/testimonials',
  '/faq',
  '/gallery',
  '/promo',
]

const STATIC_ROUTES = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/_next',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔍 Middleware - Path:', pathname)

  // Izinkan static routes
  if (STATIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Izinkan public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Public route allowed:', pathname)
    return NextResponse.next()
  }

  // Cek token untuk protected routes
  const token = request.cookies.get('token')?.value
  console.log('🍪 Token found:', token ? 'Yes' : 'No')

  // Jika tidak ada token, redirect ke login
  if (!token) {
    console.log('❌ No token, redirect to login')
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Verifikasi token
  const payload = verifyToken(token)
  if (!payload) {
    console.log('❌ Invalid token, redirect to login')
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  console.log('✅ Token valid, user:', payload.email, 'Role:', payload.role)

  // Untuk admin routes, cek role
  if (pathname.startsWith('/admin') && payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN') {
    console.log('❌ Unauthorized role for admin:', payload.role)
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log('✅ Access granted for:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
