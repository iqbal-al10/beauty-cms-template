import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Get available slots for a date
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

    // Get all bookings for that date and service
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

    // Available slots (09:00 - 18:00)
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

// POST: Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, whatsapp, email, bookingDate, bookingTime, serviceId, notes } = body

    // Check if slot is available
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
        { error: 'Slot is already booked' },
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
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
