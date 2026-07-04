import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, whatsapp, message } = body

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      )
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email || null,
        whatsapp: whatsapp || null,
        message: message.trim(),
        status: 'NEW',
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Contact message sent successfully',
      data: contactMessage 
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending contact message:', error)
    return NextResponse.json(
      { error: 'Failed to send contact message' },
      { status: 500 }
    )
  }
}