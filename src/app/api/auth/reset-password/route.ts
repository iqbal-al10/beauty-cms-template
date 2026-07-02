import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations'
import { rateLimitMemory } from '@/lib/rate-limit-memory'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const key = `reset_password_${ip}`
    const { success } = rateLimitMemory(key, 5, 60 * 60 * 1000)

    if (!success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 jam.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    try {
      const validated = resetPasswordSchema.parse(body)
      const { token, newPassword } = validated

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Token tidak valid atau sudah kadaluarsa' },
          { status: 400 }
        )
      }

      const passwordHash = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Password berhasil direset. Silakan login dengan password baru.',
      })
    } catch (error: any) {
      if (error.name === 'ZodError' && error.errors) {
        const errors = error.errors.map((e: any) => e.message).join(', ')
        return NextResponse.json(
          { error: errors },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Gagal mereset password' },
      { status: 500 }
    )
  }
}
