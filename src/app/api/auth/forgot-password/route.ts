import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { forgotPasswordSchema } from '@/lib/validations'
import { rateLimitMemory } from '@/lib/rate-limit-memory'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMIT: 3 requests per hour
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const key = `forgot_password_${ip}`
    const { success, resetTime } = rateLimitMemory(key, 3, 60 * 60 * 1000)

    if (!success) {
      const resetDate = new Date(resetTime)
      return NextResponse.json(
        { 
          error: 'Terlalu banyak permintaan. Coba lagi dalam 1 jam.',
          resetAt: resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    // 2. ZOD VALIDATION
    const body = await request.json()
    const validated = forgotPasswordSchema.safeParse(body)

    if (!validated.success) {
      const errors = validated.error.errors.map(e => e.message).join(', ')
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      )
    }

    const { email } = validated.data

    // 3. Cari user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Jika akun terdaftar, link reset akan dikirim.' },
        { status: 200 }
      )
    }

    // 4. Generate token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    // Log untuk development
    console.log('📧 RESET LINK:', resetLink)
    console.log('📧 Untuk: ', email)

    return NextResponse.json({
      message: 'Jika akun terdaftar, link reset telah dikirim.',
      devLink: resetLink,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
