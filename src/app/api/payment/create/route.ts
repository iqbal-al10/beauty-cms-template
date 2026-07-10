import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import midtransClient from 'midtrans-client'

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
})

// 🔥 Helper: ekstrak info pembayaran dari Midtrans response
function extractPaymentInfo(transaction: any): { methodName: string; accountNumber: string } {
  let methodName = 'Midtrans'
  let accountNumber = ''

  if (transaction.va_numbers && transaction.va_numbers.length > 0) {
    const va = transaction.va_numbers[0]
    methodName = `${va.bank?.toUpperCase() || ''} Virtual Account`
    accountNumber = va.va_number || ''
  } else if (transaction.permata_va_number) {
    methodName = 'Permata Virtual Account'
    accountNumber = transaction.permata_va_number
  } else if (transaction.bill_key) {
    methodName = 'Mandiri Bill Payment'
    accountNumber = transaction.bill_key
  } else if (transaction.payment_code) {
    methodName = 'Indomaret / Alfamart'
    accountNumber = transaction.payment_code
  } else if (transaction.qr_string) {
    methodName = 'QRIS'
    accountNumber = transaction.qr_string
  } else if (transaction.actions && transaction.actions.length > 0) {
    const paymentAction = transaction.actions.find((a: any) => a.name === 'generate-qr-code')
    if (paymentAction) {
      methodName = 'QRIS'
      accountNumber = paymentAction.url || 'Scan QR untuk membayar'
    }
  }

  return { methodName, accountNumber }
}

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
      order = await prisma.booking.findUnique({
        where: { id: orderId },
        include: { service: true },
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      grossAmount = Math.round(order.totalPaid || order.service?.price || 0)

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
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

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

      itemDetails = order.items.map((item: any) => ({
        id: item.productId,
        name: item.productName || 'Produk',
        price: Math.round(item.price || 0),
        quantity: item.quantity || 1,
      }))

      if (order.shippingCost && order.shippingCost > 0) {
        itemDetails.push({
          id: 'shipping',
          name: 'Ongkos Kirim',
          price: Math.round(order.shippingCost),
          quantity: 1,
        })
      }

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

      const calculatedTotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      grossAmount = Math.round(calculatedTotal)
    }

    if (grossAmount <= 0) {
      return NextResponse.json(
        { error: 'Total pembayaran harus lebih dari 0' },
        { status: 400 }
      )
    }

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

    const sumItems = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    if (Math.abs(sumItems - grossAmount) > 1) {
      if (itemDetails.length > 0) {
        const diff = grossAmount - sumItems
        itemDetails[itemDetails.length - 1].price += diff
        parameter.item_details = itemDetails
      }
    }

    try {
      const transaction = await snap.createTransaction(parameter)
      const transactionToken = transaction.token

      // 🔥 Ekstrak info pembayaran
      const paymentInfo = extractPaymentInfo(transaction)

      // 🔥 Simpan midtransOrderId & detail pembayaran
      if (isBooking) {
        await prisma.booking.update({
          where: { id: orderId },
          data: {
            midtransOrderId: uniqueOrderId,
            paymentMethodName: paymentInfo.methodName,
            paymentAccountNumber: paymentInfo.accountNumber || null,
          },
        })
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            midtransOrderId: uniqueOrderId,
            paymentMethodName: paymentInfo.methodName,
            paymentAccountNumber: paymentInfo.accountNumber || null,
          },
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