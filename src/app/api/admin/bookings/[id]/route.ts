import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, bookingDate, bookingTime } = body

    // 🔥 VALIDASI STATUS YANG VALID
    const validStatuses = ['PENDING', 'ON_PROGRESS', 'COMPLETED', 'REJECTED', 'RESCHEDULED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // 🔥 Cek booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // 🔥 Siapkan data update
    const updateData: any = {
      status,
      bookingDate: bookingDate ? new Date(bookingDate) : undefined,
      bookingTime: bookingTime || undefined,
    }

    // 🔥 Jika status ON_PROGRESS, set approvedBy dan approvedAt
    if (status === 'ON_PROGRESS') {
      updateData.approvedBy = session.userId
      updateData.approvedAt = new Date()
    }

    // 🔥 Jika status COMPLETED, set completedAt
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
      
      // 🔥 Jika booking COMPLETED, buat transaksi pendapatan
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          bookingId: id,
          type: 'BOOKING',
        },
      })

      if (!existingTransaction && existingBooking.service) {
        await prisma.transaction.create({
          data: {
            type: 'BOOKING',
            category: 'PENDAPATAN',
            amount: existingBooking.service.price || 0,
            description: `Booking ${existingBooking.service.name} - ${existingBooking.customerName}`,
            bookingId: existingBooking.id,
            date: new Date(),
          },
        })
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { 
        service: true,
        approvedUser: {
          select: { name: true }
        }
      },
    })

    await logUserAction('UPDATE', 'Booking', booking.id, {
      customerName: booking.customerName,
      status: booking.status,
      service: booking.service?.name,
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}