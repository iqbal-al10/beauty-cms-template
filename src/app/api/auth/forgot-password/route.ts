import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Jangan kasih tahu email tidak ditemukan (security)
      return NextResponse.json(
        { message: 'If an account exists, a reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Simpan token ke database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Buat reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    // ===== KIRIM EMAIL (SEMENTARA LOGGING) =====
    console.log('📧 RESET LINK:', resetLink)
    console.log('📧 Untuk: ', email)

    // TODO: Integrasi dengan email service (Nodemailer, SendGrid, Resend, dll)

    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent.',
      // Hanya untuk development
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
