import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const applications = await prisma.job_applications.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        job: {
          select: {
            title: true,
          },
        },
      },
    })
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ message: 'Error fetching applications' }, { status: 500 })
  }
}
