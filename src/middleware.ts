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
]

// Admin paths that require authentication
const ADMIN_PATHS = ['/admin', '/api/admin']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if path is public
  const isPublic = PUBLIC_PATHS.some(p => path.startsWith(p))

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
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Allow if token exists
    return NextResponse.next()
  }

  // Allow all other paths
  return NextResponse.next()
}

// Configure matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
