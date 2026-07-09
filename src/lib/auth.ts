import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { getCookieName } from './cookies'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface Session {
  userId: string
  email: string
  name: string
  role: string
}

export interface TokenPayload {
  userId: string
  email: string
  name: string
  role: string
  iat?: number
  exp?: number
}

export async function getServerSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const cookieName = await getCookieName()
    const token = cookieStore.get(cookieName)?.value

    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Error verifying access token:', error)
    return null
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function getCurrentUser(request?: NextRequest) {
  try {
    let token: string | undefined

    const cookieName = await getCookieName()

    if (request) {
      token = request.cookies.get(cookieName)?.value
    } else {
      const cookieStore = await cookies()
      token = cookieStore.get(cookieName)?.value
    }

    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<Session | null> {
  try {
    const cookieName = await getCookieName()
    const token = request.cookies.get(cookieName)?.value

    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch (error) {
    console.error('Error verifying token from request:', error)
    return null
  }
}