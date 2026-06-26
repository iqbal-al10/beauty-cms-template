import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { logActivity } from '@/middleware/activityLogger'
import { loginSchema } from '@/lib/validations'
import { rateLimitMemory } from '@/lib/rate-limit-memory'
import { headers } from 'next/headers'
import { ZodError } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMIT
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const key = `login_${ip}`
    const { success, resetTime } = rateLimitMemory(key, 5, 5 * 60 * 1000)

    if (!success) {
      const resetDate = new Date(resetTime)
      return NextResponse.json(
        { 
          error: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.',
          resetAt: resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    // 2. ZOD VALIDATION
    const body = await request.json()
    
    try {
      const validated = loginSchema.parse(body)
      const { email, password } = validated

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Email atau password salah' },
          { status: 401 }
        )
      }

      const isValid = await bcrypt.compare(password, user.passwordHash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Email atau password salah' },
          { status: 401 }
        )
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      await logActivity(user.id, 'LOGIN', 'User', user.id, {
        email: user.email,
        timestamp: new Date().toISOString(),
      })

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      const { passwordHash, ...userWithoutPassword } = user

      const response = NextResponse.json({
        success: true,
        user: userWithoutPassword,
        token,
      })

      response.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })

      return response
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => e.message).join(', ')
        return NextResponse.json(
          { error: errors },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
