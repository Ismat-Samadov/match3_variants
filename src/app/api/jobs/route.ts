import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all jobs (or active jobs only for public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const jobs = await prisma.jobs.findMany({
      where: activeOnly ? { status: 'active' } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// Create a new job (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authCookie = request.cookies.get('admin_auth')
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const job = await prisma.jobs.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        employment_type: data.employment_type || 'full_time',
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        status: data.status || 'active',
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
