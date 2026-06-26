import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/validations'
import { rateLimitMemory } from '@/lib/rate-limit-memory'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: 'Date and serviceId required' },
        { status: 400 }
      )
    }

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: new Date(date),
          lt: new Date(date + 'T23:59:59'),
        },
        serviceId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    })

    const allSlots = []
    for (let hour = 9; hour <= 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    const bookedSlots = bookings.map(b => b.bookingTime)
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot))

    return NextResponse.json({ slots: availableSlots })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMIT
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const key = `booking_${ip}`
    const { success, resetTime } = rateLimitMemory(key, 5, 60 * 60 * 1000)

    if (!success) {
      const resetDate = new Date(resetTime)
      return NextResponse.json(
        { 
          error: 'Terlalu banyak booking. Coba lagi dalam 1 jam.',
          resetAt: resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    // 2. ZOD VALIDATION
    const body = await request.json()
    
    try {
      const validated = bookingSchema.parse(body)
      const { customerName, whatsapp, email, bookingDate, bookingTime, serviceId, notes } = validated

      const existing = await prisma.booking.findFirst({
        where: {
          bookingDate: new Date(bookingDate),
          bookingTime,
          serviceId,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Slot sudah dibooking oleh orang lain' },
          { status: 409 }
        )
      }

      const booking = await prisma.booking.create({
        data: {
          customerName,
          whatsapp,
          email,
          bookingDate: new Date(bookingDate),
          bookingTime,
          serviceId,
          notes,
          status: 'PENDING',
        },
        include: { service: true },
      })

      return NextResponse.json(booking, { status: 201 })
    } catch (error: any) {
      // Zod error handling with type assertion
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
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
