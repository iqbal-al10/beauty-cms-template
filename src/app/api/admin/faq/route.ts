import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logUserAction } from '@/middleware/activityLogger'

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(faqs || [])
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, sortOrder, isActive } = body

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    await logUserAction('CREATE', 'FAQ', faq.id, {
      question: faq.question,
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}
