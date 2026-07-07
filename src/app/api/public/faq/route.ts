import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
        isActive: true,
      },
    })

    return NextResponse.json(faqs || [])
  } catch (error) {
    console.error('Error fetching public FAQs:', error)
    return NextResponse.json([], { status: 200 })
  }
}