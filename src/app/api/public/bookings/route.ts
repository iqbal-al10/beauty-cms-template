import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingNotification } from '@/lib/push/server'

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

// Parse operating hours dari berbagai format
function parseOperatingHours(operatingHours: any): Record<string, { open: string; close: string; isClosed: boolean }> {
  const result: Record<string, { open: string; close: string; isClosed: boolean }> = {}
  
  if (!operatingHours) return result
  
  if (typeof operatingHours === 'string') {
    try {
      operatingHours = JSON.parse(operatingHours)
    } catch {
      return result
    }
  }
  
  if (typeof operatingHours !== 'object' || Array.isArray(operatingHours)) {
    return result
  }
  
  const dayMapping: Record<string, string> = {
    'sunday': 'sunday',
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
  }
  
  for (const [day, value] of Object.entries(operatingHours)) {
    const normalizedDay = day.toLowerCase().trim()
    const dayKey = dayMapping[normalizedDay]
    if (!dayKey) continue
    
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.toLowerCase() === 'closed' || trimmed === '') {
        result[dayKey] = { open: 'closed', close: 'closed', isClosed: true }
      } else {
        const parts = trimmed.split('-').map(s => s.trim())
        if (parts.length === 2) {
          const open = parts[0]
          const close = parts[1]
          if (/^\d{1,2}:\d{2}$/.test(open) && /^\d{1,2}:\d{2}$/.test(close)) {
            result[dayKey] = { open, close, isClosed: false }
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      const open = (value as any).open
      const close = (value as any).close
      if (open && close) {
        result[dayKey] = { 
          open, 
          close, 
          isClosed: open.toLowerCase() === 'closed' || close.toLowerCase() === 'closed' 
        }
      }
    }
  }
  
  return result
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

    const operatingHours = settings?.operatingHours || {}
    const parsedHours = parseOperatingHours(operatingHours)

    // Get day of week from date (lowercase)
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    const daySchedule = parsedHours[dayOfWeek]
    
    // Jika hari itu tutup
    if (!daySchedule || daySchedule.isClosed || daySchedule.open === 'closed' || daySchedule.close === 'closed') {
      return NextResponse.json({ 
        slots: [],
        isClosed: true,
        message: `Sorry, We are closed on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}`
      })
    }

    // Generate semua slots
    const intervalMinutes = Math.max(30, service.duration || 60)
    const allSlots = generateTimeSlots(daySchedule.open, daySchedule.close, intervalMinutes)

    // Ambil semua booking dengan status aktif (hanya yang sudah PAID atau COMPLETED/ON_PROGRESS)
    const existingBookings = await prisma.booking.findMany({
      where: {
        bookingDate: new Date(date),
        AND: [
          {
            OR: [
              { paymentStatus: 'PAID' },
              { status: { in: ['COMPLETED', 'ON_PROGRESS'] } },
            ],
          },
        ],
      },
      select: { bookingTime: true },
    })

    const bookedSlots = new Set(existingBookings.map(b => b.bookingTime))

    // Kirim semua slot dengan status booked
    const slotsWithStatus = allSlots.map((slot) => ({
      time: slot,
      isBooked: bookedSlots.has(slot),
    }))

    return NextResponse.json({ 
      slots: slotsWithStatus,
      isClosed: false,
      message: null
    })
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
      address,
      notes,
      voucherCode,
      paymentMethod,
    } = body

    if (!serviceId || !bookingDate || !bookingTime || !customerName || !whatsapp) {
      return NextResponse.json(
        { error: 'Service, date, time, customer name, and WhatsApp are required' },
        { status: 400 }
      )
    }

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
        status: { 
          in: ['PENDING', 'APPROVED', 'RESCHEDULED', 'COMPLETED', 'ON_PROGRESS']
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Slot already booked' },
        { status: 400 }
      )
    }

    // 🔥 CREATE BOOKING DENGAN VOUCHER
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        bookingDate: new Date(bookingDate),
        bookingTime,
        customerName,
        whatsapp,
        email: email || null,
        address: address || null,
        notes: notes || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        // 🔥 TAMBAHKAN FIELD VOUCHER
        voucherCode: appliedVoucherCode,
        discountAmount: discountAmount,
        totalPaid: totalPrice,
      },
    })

    // 🔥 KIRIM PUSH NOTIFICATION KE ADMIN - PANGGIL LANGSUNG FUNGSI
    try {
      await sendBookingNotification(
        booking.id,
        booking.customerName,
        service.name,
        new Date(booking.bookingDate).toLocaleDateString('id-ID'),
        booking.bookingTime
      )
      console.log('✅ Push notification sent for booking:', booking.id)
    } catch (pushError) {
      // Jangan gagalkan booking jika notifikasi gagal
      console.error('❌ Error sending push notification:', pushError)
    }

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