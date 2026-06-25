import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const faq = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { question, answer, sortOrder, isActive } = body

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    await logUserAction('UPDATE', 'FAQ', faq.id, {
      question: faq.question,
      isActive: faq.isActive,
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const faq = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    await prisma.fAQ.delete({
      where: { id },
    })

    await logUserAction('DELETE', 'FAQ', id, {
      question: faq.question,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    )
  }
}
