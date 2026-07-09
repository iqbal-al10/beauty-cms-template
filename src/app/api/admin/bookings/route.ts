import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    // 🔥 KHUSUS UNTUK NOTIFIKASI PENDING (status=PENDING)
    // Hanya tampilkan yang paymentStatus = 'PAID' ATAU status = 'ON_PROGRESS'
    if (status && status !== 'ALL') {
      where.status = status
      // Jika status PENDING, hanya tampilkan yang sudah PAID
      if (status === 'PENDING') {
        where.paymentStatus = 'PAID'
      }
    }
    
    if (date) {
      where.bookingDate = {
        gte: new Date(date),
        lt: new Date(date + 'T23:59:59'),
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { 
        service: true,
        approvedUser: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // 🔥 TRANSFORM DENGAN DATA LENGKAP
    const transformed = bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customerName,
      whatsapp: booking.whatsapp,
      email: booking.email,
      address: booking.address,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
      completedAt: booking.completedAt,
      approvedAt: booking.approvedAt,
      approvedBy: booking.approvedUser,
      service: booking.service ? {
        name: booking.service.name,
        price: booking.service.price,
        duration: booking.service.duration,
      } : null,
      originalPrice: booking.service?.price || 0,
      // 🔥 TAMBAHKAN FIELD VOUCHER
      discountAmount: booking.discountAmount || 0,
      voucherCode: booking.voucherCode || null,
      totalPaid: booking.totalPaid || booking.service?.price || 0,
    }))

    return NextResponse.json(transformed || [])
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      customerName, 
      whatsapp, 
      email, 
      address,
      bookingDate, 
      bookingTime, 
      serviceId, 
      notes 
    } = body

    // Validasi
    if (!customerName || !whatsapp || !bookingDate || !bookingTime || !serviceId) {
      return NextResponse.json(
        { error: 'Nama, WhatsApp, tanggal, waktu, dan layanan wajib diisi' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        customerName,
        whatsapp,
        email: email || null,
        address: address || null,
        bookingDate: new Date(bookingDate),
        bookingTime,
        serviceId,
        notes: notes || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: { service: true },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking: ' + (error as Error).message },
      { status: 500 }
    )
  }
}