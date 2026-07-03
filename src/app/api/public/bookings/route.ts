import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper untuk generate slot waktu berdasarkan operating hours
function generateTimeSlots(open: string, close: string, intervalMinutes: number = 60): string[] {
  const slots: string[] = []
  const [openHour, openMinute] = open.split(':').map(Number)
  const [closeHour, closeMinute] = close.split(':').map(Number)
  
  let currentHour = openHour
  let currentMinute = openMinute
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    slots.push(timeStr)
    
    currentMinute += intervalMinutes
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
  }
  
  return slots
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: 'Date and serviceId are required' },
        { status: 400 }
      )
    }

    // Get service duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get settings untuk operating hours
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    // Parse operating hours
    let operatingHours: any = {}
    try {
      operatingHours = settings?.operatingHours || {}
    } catch (e) {
      operatingHours = {}
    }

    // Get day of week from date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const daySchedule = operatingHours[dayOfWeek]

    // Jika tidak ada jadwal untuk hari itu
    if (!daySchedule || daySchedule.open === 'closed' || daySchedule.close === 'closed') {
      return NextResponse.json({ slots: [] })
    }

    // Generate slots berdasarkan operating hours (interval 1 jam)
    const allSlots = generateTimeSlots(daySchedule.open, daySchedule.close, 60)

    // Get existing bookings for that date
    const existingBookings = await prisma.booking.findMany({
      where: {
        bookingDate: new Date(date),
        status: { not: 'REJECTED' },
      },
      select: { bookingTime: true },
    })

    const bookedSlots = new Set(existingBookings.map(b => b.bookingTime))

    // Filter slots yang masih available
    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot))

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
    const body = await request.json()
    const {
      serviceId,
      bookingDate,
      bookingTime,
      customerName,
      whatsapp,
      email,
      notes,
      voucherCode,
      paymentMethod,
    } = body

    // Validasi
    if (!serviceId || !bookingDate || !bookingTime || !customerName || !whatsapp) {
      return NextResponse.json(
        { error: 'Service, date, time, customer name, and WhatsApp are required' },
        { status: 400 }
      )
    }

    // Get service untuk harga
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { price: true, name: true, duration: true },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    let totalPrice = service.price
    let discountAmount = 0
    let appliedVoucherCode = null

    // Apply voucher jika ada
    if (voucherCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: voucherCode.toUpperCase() },
      })

      if (promo && promo.isActive && new Date() >= promo.startDate && new Date() <= promo.endDate) {
        discountAmount = promo.discount
        totalPrice = Math.max(0, service.price - promo.discount)
        appliedVoucherCode = promo.code
      }
    }

    // Cek apakah slot sudah di-book
    const existingBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: new Date(bookingDate),
        bookingTime,
        status: { not: 'REJECTED' },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Slot already booked' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        bookingDate: new Date(bookingDate),
        bookingTime,
        customerName,
        whatsapp,
        email: email || null,
        notes: notes || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      booking,
      service: {
        name: service.name,
        price: service.price,
        duration: service.duration,
      },
      totalPrice,
      discountAmount,
      voucherCode: appliedVoucherCode,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
