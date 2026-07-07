import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import midtransClient from 'midtrans-client'

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, isBooking } = body

    console.log('📥 Received request:', { orderId, isBooking })

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    let order: any
    let customerDetails: any
    let itemDetails: any[] = []
    let grossAmount = 0

    if (isBooking) {
      // Ambil data booking
      order = await prisma.booking.findUnique({
        where: { id: orderId },
        include: { service: true },
      })

      console.log('📦 Booking data:', order)

      if (!order) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      grossAmount = Math.round(order.service?.price || 0)

      if (grossAmount <= 0) {
        return NextResponse.json(
          { error: 'Total pembayaran harus lebih dari 0' },
          { status: 400 }
        )
      }

      const customerEmail = order.email?.trim() || `${order.customerName.toLowerCase().replace(/\s/g, '')}@customer.com`

      customerDetails = {
        first_name: order.customerName || 'Customer',
        phone: order.whatsapp || '081234567890',
        email: customerEmail,
      }

      itemDetails = [
        {
          id: order.serviceId || 'service',
          name: order.service?.name || 'Layanan',
          price: grossAmount,
          quantity: 1,
        },
      ]
    } else {
      // Ambil data order produk
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      console.log('📦 Order data:', order)

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      grossAmount = Math.round(order.total || 0)

      if (grossAmount <= 0) {
        return NextResponse.json(
          { error: 'Total pembayaran harus lebih dari 0' },
          { status: 400 }
        )
      }

      const customerEmail = order.email?.trim() || `${order.customerName.toLowerCase().replace(/\s/g, '')}@customer.com`

      customerDetails = {
        first_name: order.customerName || 'Customer',
        phone: order.customerWhatsapp || '081234567890',
        email: customerEmail,
      }

      // Buat item details dari produk
      itemDetails = order.items.map((item: any) => ({
        id: item.productId,
        name: item.productName || 'Produk',
        price: Math.round(item.price || 0),
        quantity: item.quantity || 1,
      }))

      // Tambahkan shipping sebagai item terpisah
      if (order.shippingCost && order.shippingCost > 0) {
        itemDetails.push({
          id: 'shipping',
          name: 'Ongkos Kirim',
          price: Math.round(order.shippingCost),
          quantity: 1,
        })
      }

      // Jika itemDetails kosong, tambahkan dummy item
      if (itemDetails.length === 0) {
        itemDetails = [
          {
            id: 'dummy',
            name: 'Pesanan',
            price: grossAmount,
            quantity: 1,
          },
        ]
      }

      // Rekalkulasi gross_amount dari item_details
      const calculatedTotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      grossAmount = Math.round(calculatedTotal)
      
      console.log('📊 Recalculated total from items:', { calculatedTotal, grossAmount })
    }

    // 🔥 VALIDASI FINAL
    if (grossAmount <= 0) {
      return NextResponse.json(
        { error: 'Total pembayaran harus lebih dari 0' },
        { status: 400 }
      )
    }

    // 🔥 BUAT ORDER_ID YANG LEBIH PENDEK
    const shortId = orderId.slice(-8)
    const timestamp = Date.now().toString().slice(-6)
    const uniqueOrderId = `${isBooking ? 'B' : 'O'}-${shortId}-${timestamp}`

    const parameter = {
      transaction_details: {
        order_id: uniqueOrderId,
        gross_amount: grossAmount,
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
    }

    console.log('📤 Midtrans Parameter:', JSON.stringify(parameter, null, 2))

    // 🔥 VALIDASI: Pastikan gross_amount sama dengan sum item_details
    const sumItems = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    if (Math.abs(sumItems - grossAmount) > 1) {
      console.warn('⚠️ Sum items does not match gross_amount:', { sumItems, grossAmount })
      if (itemDetails.length > 0) {
        const diff = grossAmount - sumItems
        itemDetails[itemDetails.length - 1].price += diff
        parameter.item_details = itemDetails
        console.log('📤 Adjusted items:', JSON.stringify(itemDetails, null, 2))
      }
    }

    // Buat transaksi di Midtrans
    try {
      const transaction = await snap.createTransaction(parameter)
      const transactionToken = transaction.token

      console.log('✅ Midtrans transaction created:')
      console.log('📝 Token:', transactionToken.substring(0, 20) + '...')
      console.log('📝 Order ID:', uniqueOrderId)
      console.log('📝 Redirect URL:', transaction.redirect_url)

      // Simpan midtransOrderId di database
      if (isBooking) {
        await prisma.booking.update({
          where: { id: orderId },
          data: { midtransOrderId: uniqueOrderId },
        })
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: { midtransOrderId: uniqueOrderId },
        })
      }

      return NextResponse.json({
        token: transactionToken,
        orderId: uniqueOrderId,
        redirectUrl: transaction.redirect_url,
      })
    } catch (midtransError: any) {
      console.error('❌ Midtrans API Error:', midtransError)
      
      let errorMessage = 'Gagal memproses pembayaran'
      if (midtransError.response) {
        console.error('Midtrans Response:', JSON.stringify(midtransError.response, null, 2))
        errorMessage = midtransError.response?.error_messages?.join(', ') || midtransError.message
      } else if (midtransError.message) {
        errorMessage = midtransError.message
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Error creating Midtrans transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pembayaran' },
      { status: 500 }
    )
  }
}