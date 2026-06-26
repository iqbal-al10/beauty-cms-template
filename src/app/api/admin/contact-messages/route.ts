import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validations'
import { rateLimitMemory } from '@/lib/rate-limit-memory'
import { headers } from 'next/headers'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'ALL') where.status = status

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMIT
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const key = `contact_${ip}`
    const { success, resetTime } = rateLimitMemory(key, 3, 60 * 60 * 1000)

    if (!success) {
      const resetDate = new Date(resetTime)
      return NextResponse.json(
        { 
          error: 'Terlalu banyak pesan. Coba lagi dalam 1 jam.',
          resetAt: resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    // 2. ZOD VALIDATION
    const body = await request.json()
    
    try {
      const validated = contactSchema.parse(body)
      
      const { name, email, whatsapp, message } = validated

      const contactMessage = await prisma.contactMessage.create({
        data: {
          name,
          email,
          whatsapp,
          message,
          status: 'NEW',
        },
      })

      return NextResponse.json(contactMessage, { status: 201 })
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => e.message).join(', ')
        return NextResponse.json(
          { error: errors },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
