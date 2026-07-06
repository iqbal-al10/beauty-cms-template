import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { getCookieName, getCookieOptions } from '@/lib/cookies'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Login API called')
    console.log('📧 Request body:', { email: body.email, password: '***' })

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.issues.map((e: any) => e.message).join(', ')
      console.log('❌ Validation error:', errors)
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    console.log('📧 Email:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('❌ User tidak ditemukan:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      console.log('❌ Password salah untuk:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User tidak aktif:', email)
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Silakan hubungi admin.' },
        { status: 403 }
      )
    }

    // 🔥 PASTIKAN JWT_SECRET ADA
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not defined in environment variables')
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        metadata: { email: user.email },
      },
    })

    console.log('✅ Login berhasil:', email)

    // 🔥 DAPATKAN COOKIE NAME DARI DATABASE
    const cookieName = await getCookieName()
    const cookieOptions = await getCookieOptions()

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // 🔥 SET COOKIE DENGAN NAMA DINAMIS
    response.cookies.set(cookieName, token, cookieOptions)

    return response
  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}