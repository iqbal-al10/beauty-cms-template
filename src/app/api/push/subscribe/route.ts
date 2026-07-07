// src/app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { subscription } = await request.json()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription is required' },
        { status: 400 }
      )
    }

    // Simpan atau update subscription
    await prisma.pushSubscription.upsert({
      where: { userId: session.userId },
      update: {
        subscription: JSON.stringify(subscription),
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        subscription: JSON.stringify(subscription),
      },
    })

    console.log(`✅ Push subscription saved for user: ${session.userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.pushSubscription.delete({
      where: { userId: session.userId },
    })

    console.log(`✅ Push subscription deleted for user: ${session.userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId: session.userId },
    })

    return NextResponse.json({
      subscribed: !!subscription,
      subscription: subscription ? JSON.parse(subscription.subscription) : null,
    })
  } catch (error) {
    console.error('Error getting push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    )
  }
}