import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createMedicalResourceSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { UserRole } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/resources/[id] - Get specific medical resource
export const GET = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const user = await requireAuth(request)
    const { id } = params
    
    const resource = await prisma.medicalResource.findUnique({
      where: { id },
    })
    
    if (!resource) {
      return NextResponse.json(
        { success: false, message: 'Medical resource not found' },
        { status: 404 }
      )
    }
    
    // Parse JSON fields for response
    const parsedResource = {
      ...resource,
      operatingHours: resource.operatingHours ? JSON.parse(resource.operatingHours) : null,
      services: resource.services ? JSON.parse(resource.services) : null,
    }
    
    return NextResponse.json(
      formatApiResponse(parsedResource, 'Medical resource retrieved successfully')
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
};

// PATCH /api/resources/[id] - Update medical resource (Admin/Healthcare Worker only)
export const PATCH = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER])
    const { id } = params
    
    const body = await request.json()
    
    // Check if resource exists
    const existingResource = await prisma.medicalResource.findUnique({
      where: { id }
    })
    
    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Medical resource not found' },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData: any = { ...body }
    
    // Handle JSON fields
    if (updateData.operatingHours) {
      updateData.operatingHours = JSON.stringify(updateData.operatingHours)
    }
    
    if (updateData.services) {
      updateData.services = JSON.stringify(updateData.services)
    }
    
    // Update medical resource
    const updatedResource = await prisma.medicalResource.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json(
      formatApiResponse(updatedResource, 'Medical resource updated successfully')
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
};

// DELETE /api/resources/[id] - Deactivate medical resource (Admin only)
export const DELETE = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN])
    const { id } = params
    
    // Check if resource exists
    const existingResource = await prisma.medicalResource.findUnique({
      where: { id }
    })
    
    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Medical resource not found' },
        { status: 404 }
      )
    }
    
    // Soft delete by setting isActive to false
    const deactivatedResource = await prisma.medicalResource.update({
      where: { id },
      data: { isActive: false },
    })
    
    return NextResponse.json(
      formatApiResponse(deactivatedResource, 'Medical resource deactivated successfully')
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
};