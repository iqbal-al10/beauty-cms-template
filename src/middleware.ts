import { NextRequest, NextResponse } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/public',
  '/api/test',
  '/_next',
  '/favicon.ico',
  '/images',
  '/login',
  '/products',
  '/booking',
  '/about',
  '/contact',
  '/',
]

// Admin paths that require authentication
const ADMIN_PATHS = ['/admin', '/api/admin']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip static files
  if (path.match(/\.(svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next()
  }

  // Check if path is public
  const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))

  // Check if path requires admin access
  const isAdmin = ADMIN_PATHS.some(p => path.startsWith(p))

  // If public, allow
  if (isPublic) {
    return NextResponse.next()
  }

  // If admin, check authentication
  if (isAdmin) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}
