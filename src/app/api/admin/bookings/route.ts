import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (date) {
      where.bookingDate = {
        gte: new Date(date),
        lt: new Date(date + 'T23:59:59'),
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    })

    // Pastikan mengembalikan array
    return NextResponse.json(bookings || [])
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error)
    // Kembalikan array kosong jika error
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, whatsapp, email, bookingDate, bookingTime, serviceId, notes } = body

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
