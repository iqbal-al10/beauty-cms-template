import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/validate-reset-token',
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
  '/api/orders',
]

const STATIC_ROUTES = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/_next',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔍 Proxy - Path:', pathname)

  // REDIRECT /login KE /auth/login
  if (pathname === '/login') {
    console.log('🔄 Redirect /login to /auth/login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (STATIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Public route allowed:', pathname)
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  console.log('🍪 Token found:', token ? 'Yes' : 'No')

  if (!token) {
    console.log('❌ No token, redirect to login')
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const payload = verifyToken(token)
  if (!payload) {
    console.log('❌ Invalid token, redirect to login')
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  console.log('✅ Token valid, user:', payload.email, 'Role:', payload.role)

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
