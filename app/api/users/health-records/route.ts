import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createHealthRecordSchema, paginationSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'

// GET /api/users/health-records - Get user's health records
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const recordType = searchParams.get('recordType')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = { userId: user.id }
    
    if (recordType) {
      where.recordType = recordType
    }
    
    // Get health records with pagination
    const [records, total] = await Promise.all([
      prisma.healthRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.healthRecord.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          recordType,
        },
      }, 'Health records retrieved successfully')
    )
    
  } catch (error) {
    try {
      handleDatabaseError(error)
    } catch (dbError) {
      const apiError = handleApiError(dbError)
      return NextResponse.json(apiError, { status: 500 })
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: 500 })
  }
})

// POST /api/users/health-records - Create health record
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createHealthRecordSchema.parse(body)
    
    // Create health record
    const record = await prisma.healthRecord.create({
      data: {
        ...validatedData,
        userId: user.id,
        recordedAt: validatedData.recordedAt ? new Date(validatedData.recordedAt) : new Date(),
      },
    })
    
    return NextResponse.json(
      formatApiResponse(record, 'Health record created successfully'),
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, error: { code: error.code, details: error.details } },
        { status: 400 }
      )
    }
    
    try {
      handleDatabaseError(error)
    } catch (dbError) {
      const apiError = handleApiError(dbError)
      return NextResponse.json(apiError, { status: 500 })
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: 500 })
  }
})