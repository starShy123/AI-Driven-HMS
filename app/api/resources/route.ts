import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createMedicalResourceSchema, paginationSchema, locationQuerySchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError } from '@/utils/errors'
import { formatApiResponse, calculateDistance } from '@/utils/helpers'
import { UserRole, ResourceType } from '@prisma/client'

// GET /api/resources - Get all medical resources with filtering and pagination
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filters
    const type = searchParams.get('type') as ResourceType
    const district = searchParams.get('district')
    const division = searchParams.get('division')
    const isActive = searchParams.get('isActive') !== 'false' // Default to true
    const search = searchParams.get('search')
    
    // Location-based filtering
    const latitude = parseFloat(searchParams.get('latitude') || '')
    const longitude = parseFloat(searchParams.get('longitude') || '')
    const radius = parseFloat(searchParams.get('radius') || '')
    
    // Build where clause
    const where: any = {
      isActive: isActive,
    }
    
    if (type) {
      where.type = type
    }
    
    if (district) {
      where.district = {
        contains: district,
        mode: 'insensitive'
      }
    }
    
    if (division) {
      where.division = {
        contains: division,
        mode: 'insensitive'
      }
    }
    
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          address: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }
    
    // Get resources with pagination
    const [resources, total] = await Promise.all([
      prisma.medicalResource.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { averageRating: 'desc' },
          { createdAt: 'desc' }
        ],
      }),
      prisma.medicalResource.count({ where }),
    ])
    
    // If location-based filtering is requested, calculate distances
    let resourcesWithDistance = resources
    if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(radius)) {
      resourcesWithDistance = resources
        .map(resource => ({
          ...resource,
          distance: calculateDistance(latitude, longitude, resource.latitude, resource.longitude),
        }))
        .filter(resource => resource.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
    }
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        resources: resourcesWithDistance,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          type,
          district,
          division,
          search,
          location: !isNaN(latitude) && !isNaN(longitude) ? { latitude, longitude, radius } : null,
        },
      }, 'Medical resources retrieved successfully')
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

// POST /api/resources - Create new medical resource (Admin/Healthcare Worker only)
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER])
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createMedicalResourceSchema.parse(body)
    
    // Check if resource with same name and location already exists
    const existingResource = await prisma.medicalResource.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        },
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      }
    })
    
    if (existingResource) {
      return NextResponse.json(
        { success: false, message: 'Medical resource with this name and location already exists' },
        { status: 409 }
      )
    }
    
    // Create medical resource
    const resource = await prisma.medicalResource.create({
      data: {
        ...validatedData,
        operatingHours: validatedData.operatingHours ? JSON.stringify(validatedData.operatingHours) : null,
        services: validatedData.services ? JSON.stringify(validatedData.services) : null,
      },
    })
    
    return NextResponse.json(
      formatApiResponse(resource, 'Medical resource created successfully'),
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