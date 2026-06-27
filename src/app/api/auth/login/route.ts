import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  console.log('🔐 Login API called')
  
  try {
    const { email, password } = await request.json()
    console.log('📧 Email:', email)

    if (!email || !password) {
      console.log('❌ Email atau password kosong')
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Cari user
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

    // Cek password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      console.log('❌ Password salah untuk:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('✅ Password valid untuk:', email)

    // Cek user aktif
    if (!user.isActive) {
      console.log('❌ User tidak aktif:', email)
      return NextResponse.json(
        { error: 'Akun Anda dinonaktifkan' },
        { status: 401 }
      )
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate token
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

    // Response dengan cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    console.log('✅ Cookie set untuk:', email)
    console.log('🍪 Cookie header:', response.cookies.toString())

    return response
  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
