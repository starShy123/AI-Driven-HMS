import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createEmergencyAlertSchema, paginationSchema, locationQuerySchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { calculateDistance, getRecommendedResources } from '@/utils/helpers'
import { UserRole, UrgencyLevel } from '@prisma/client'

// GET /api/emergency - Get user's emergency alerts
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // 'active', 'resolved', 'all'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    // If user is not admin/healthcare worker, only show their own alerts
    const allowedRoles = ['ADMIN', 'HEALTHCARE_WORKER', 'COMMUNITY_HEALTH_WORKER']
    if (!allowedRoles.includes(user.role)) {
      where.consultation = {
        userId: user.id
      }
    }
    
    if (status === 'active') {
      where.isResolved = false
    } else if (status === 'resolved') {
      where.isResolved = true
    }
    
    // Get emergency alerts with pagination
    const [alerts, total] = await Promise.all([
      prisma.emergencyAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          consultation: {
            select: {
              id: true,
              symptoms: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  village: true,
                  upazila: true,
                  district: true,
                  division: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      }),
      prisma.emergencyAlert.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        alerts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }, 'Emergency alerts retrieved successfully')
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

// PATCH /api/emergency/[id]/resolve - Resolve emergency alert
interface RouteParams {
  params: {
    id: string
  }
}

export const PATCH = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER, UserRole.COMMUNITY_HEALTH_WORKER])
    
    const { id } = params
    const body = await request.json()
    
    // Validate resolution data
    const { resolutionNotes, resolvedBy } = body
    
    if (!resolutionNotes) {
      return NextResponse.json(
        { success: false, message: 'Resolution notes are required' },
        { status: 400 }
      )
    }
    
    // Update emergency alert as resolved
    const updatedAlert = await prisma.emergencyAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy || user.id,
      },
      include: {
        consultation: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    })
    
    return NextResponse.json(
      formatApiResponse(updatedAlert, 'Emergency alert resolved successfully')
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

// POST /api/emergency - Create emergency alert (Admin/Healthcare Worker only)
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER, UserRole.COMMUNITY_HEALTH_WORKER])
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createEmergencyAlertSchema.parse(body)
    
    // Verify consultation exists
    const consultation = await prisma.consultation.findUnique({
      where: { id: validatedData.consultationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            village: true,
            upazila: true,
            district: true,
            division: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    })
    
    if (!consultation) {
      return NextResponse.json(
        { success: false, message: 'Consultation not found' },
        { status: 404 }
      )
    }
    
    // Create emergency alert
    const emergencyAlert = await prisma.emergencyAlert.create({
      data: {
        consultationId: validatedData.consultationId,
        emergencyType: validatedData.emergencyType,
        urgencyLevel: validatedData.urgencyLevel || UrgencyLevel.EMERGENCY,
        alertMessage: validatedData.alertMessage,
        recommendedAction: validatedData.recommendedAction,
        latitude: validatedData.latitude || consultation.user.latitude,
        longitude: validatedData.longitude || consultation.user.longitude,
      },
      include: {
        consultation: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                village: true,
                upazila: true,
                district: true,
                division: true,
              },
            },
          },
        },
      },
    })
    
    return NextResponse.json(
      formatApiResponse(emergencyAlert, 'Emergency alert created successfully'),
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