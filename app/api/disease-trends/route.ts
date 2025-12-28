import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createDiseaseTrackingSchema, paginationSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError, handleAIError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { predictDiseaseTrends } from '@/lib/ai'
import { UserRole } from '@prisma/client'

// GET /api/disease-trends - Get disease tracking data with filtering
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filters
    const diseaseName = searchParams.get('diseaseName')
    const region = searchParams.get('region')
    const riskLevel = searchParams.get('riskLevel')
    const trendDirection = searchParams.get('trendDirection')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    // Build where clause
    const where: any = {}
    
    if (diseaseName) {
      where.diseaseName = {
        contains: diseaseName,
        mode: 'insensitive'
      }
    }
    
    if (region) {
      where.region = {
        contains: region,
        mode: 'insensitive'
      }
    }
    
    if (riskLevel) {
      where.riskLevel = riskLevel
    }
    
    if (trendDirection) {
      where.trendDirection = trendDirection
    }
    
    if (dateFrom || dateTo) {
      where.reportedDate = {}
      if (dateFrom) {
        where.reportedDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.reportedDate.lte = new Date(dateTo)
      }
    }
    
    // Get disease tracking data with pagination
    const [tracking, total] = await Promise.all([
      prisma.diseaseTracking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportedDate: 'desc' },
      }),
      prisma.diseaseTracking.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        tracking,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          diseaseName,
          region,
          riskLevel,
          trendDirection,
          dateFrom,
          dateTo,
        },
      }, 'Disease tracking data retrieved successfully')
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

// POST /api/disease-trends - Create disease tracking record (Admin/Healthcare Worker only)
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER])
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createDiseaseTrackingSchema.parse(body)
    
    // Check if tracking record for same disease, region and date already exists
    const existingRecord = await prisma.diseaseTracking.findFirst({
      where: {
        diseaseName: {
          equals: validatedData.diseaseName,
          mode: 'insensitive'
        },
        region: {
          equals: validatedData.region,
          mode: 'insensitive'
        },
        reportedDate: {
          gte: new Date(validatedData.reportedDate),
          lt: new Date(new Date(validatedData.reportedDate).getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      }
    })
    
    if (existingRecord) {
      return NextResponse.json(
        { success: false, message: 'Disease tracking record for this disease, region and date already exists' },
        { status: 409 }
      )
    }
    
    // Create disease tracking record
    const tracking = await prisma.diseaseTracking.create({
      data: {
        ...validatedData,
        reportedDate: new Date(validatedData.reportedDate),
      },
    })
    
    return NextResponse.json(
      formatApiResponse(tracking, 'Disease tracking record created successfully'),
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