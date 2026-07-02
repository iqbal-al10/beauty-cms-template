import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginSchema } from '@/lib/validations'
import { rateLimitMemory } from '@/lib/rate-limit-memory'
import { headers } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  console.log('🔐 Login API called')
  
  try {
    // 1. RATE LIMIT
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const key = `login_${ip}`
    const { success } = rateLimitMemory(key, 10, 15 * 60 * 1000)

    if (!success) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
        { status: 429 }
      )
    }

    // 2. ZOD VALIDATION
    const body = await request.json()
    console.log('📧 Request body:', body)
    
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      const errors = result.error.errors.map((e: any) => e.message).join(', ')
      console.log('❌ Validation error:', errors)
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    console.log('📧 Email:', email)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      console.log('❌ User tidak ditemukan:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('✅ User ditemukan:', user.email, 'Role:', user.role)

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      console.log('❌ Password salah untuk:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('✅ Password valid untuk:', email)

    if (!user.isActive) {
      console.log('❌ User tidak aktif:', email)
      return NextResponse.json(
        { error: 'Akun Anda dinonaktifkan' },
        { status: 401 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Token generated untuk:', email)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    console.log('✅ Cookie set untuk:', email)

    return response
  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
