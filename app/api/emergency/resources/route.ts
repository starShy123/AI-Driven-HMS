import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { locationQuerySchema, paginationSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError } from '@/utils/errors'
import { formatApiResponse, calculateDistance, getRecommendedResources } from '@/utils/helpers'
import { ResourceType } from '@prisma/client'

// GET /api/emergency/resources - Find emergency medical resources near user
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    
    // Parse location parameters
    const latitude = parseFloat(searchParams.get('latitude') || '')
    const longitude = parseFloat(searchParams.get('longitude') || '')
    const radius = parseFloat(searchParams.get('radius') || '50') // Default 50km radius
    const resourceType = searchParams.get('type') as ResourceType
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // If user coordinates are not provided, try to get them from user profile
    let userLat = latitude
    let userLng = longitude
    
    if (!userLat || !userLng) {
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { latitude: true, longitude: true }
      })
      
      if (!userProfile?.latitude || !userProfile?.longitude) {
        return NextResponse.json(
          { success: false, message: 'User location coordinates required. Please update your profile with location.' },
          { status: 400 }
        )
      }
      
      userLat = userProfile.latitude
      userLng = userProfile.longitude
    }
    
    // Validate coordinates
    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates provided' },
        { status: 400 }
      )
    }
    
    const skip = (page - 1) * limit
    
    // Build where clause for resources
    const where: any = {
      isActive: true,
      // For emergency resources, we prioritize hospitals, clinics, and pharmacies
      type: resourceType ? resourceType : {
        in: ['HOSPITAL', 'GOVERNMENT_CLINIC', 'NGO_CLINIC', 'PHARMACY', 'COMMUNITY_HEALTH_CENTER']
      }
    }
    
    // Get all active resources within approximate area
    // Note: For production, you'd want to use PostGIS for proper geospatial queries
    const resources = await prisma.medicalResource.findMany({
      where,
      skip,
      take: limit * 3, // Get more to filter by distance
      orderBy: { averageRating: 'desc' },
    })
    
    // Calculate distances and filter by radius
    const resourcesWithDistance = resources
      .map(resource => ({
        ...resource,
        distance: calculateDistance(userLat, userLng, resource.latitude, resource.longitude),
      }))
      .filter(resource => resource.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
    
    // Get recommended resources based on urgency (emergency gets priority)
    const recommended = getRecommendedResources(
      resourcesWithDistance,
      'EMERGENCY', // Always treat as emergency for emergency resources
      userLat,
      userLng
    )
    
    // Apply pagination to filtered results
    const total = resourcesWithDistance.length
    const paginatedResources = resourcesWithDistance.slice(skip, skip + limit)
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        resources: paginatedResources,
        userLocation: {
          latitude: userLat,
          longitude: userLng,
        },
        searchRadius: radius,
        recommended: recommended.slice(0, 3), // Top 3 recommendations
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }, 'Emergency resources retrieved successfully')
    )
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, error: { code: error.code, details: error.details } },
        { status: 400 }
      )
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: 500 })
  }
};

// POST /api/emergency/resources/nearby - Alternative endpoint with body params
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const body = await request.json()
    
    // Validate input using location query schema
    const validatedData = locationQuerySchema.parse({
      latitude: body.latitude,
      longitude: body.longitude,
      radius: body.radius || 50,
    })
    
    const { latitude, longitude, radius } = validatedData
    const page = body.page || 1
    const limit = body.limit || 10
    const resourceType = body.type as ResourceType
    
    const skip = (page - 1) * limit
    
    // Build where clause for resources
    const where: any = {
      isActive: true,
      type: resourceType ? resourceType : {
        in: ['HOSPITAL', 'GOVERNMENT_CLINIC', 'NGO_CLINIC', 'PHARMACY', 'COMMUNITY_HEALTH_CENTER']
      }
    }
    
    // Get all active resources
    const resources = await prisma.medicalResource.findMany({
      where,
      skip,
      take: limit * 3, // Get more to filter by distance
      orderBy: { averageRating: 'desc' },
    })
    
    // Calculate distances and filter by radius
    const resourcesWithDistance = resources
      .map(resource => ({
        ...resource,
        distance: calculateDistance(latitude, longitude, resource.latitude, resource.longitude),
      }))
      .filter(resource => resource.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
    
    // Get recommended resources based on urgency
    const recommended = getRecommendedResources(
      resourcesWithDistance,
      'EMERGENCY',
      latitude,
      longitude
    )
    
    // Apply pagination to filtered results
    const total = resourcesWithDistance.length
    const paginatedResources = resourcesWithDistance.slice(0, limit)
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        resources: paginatedResources,
        userLocation: {
          latitude,
          longitude,
        },
        searchRadius: radius,
        recommended: recommended.slice(0, 3),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }, 'Emergency resources found successfully')
    )
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, error: { code: error.code, details: error.details } },
        { status: 400 }
      )
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: 500 })
  }
};