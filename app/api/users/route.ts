import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { updateUserSchema, createHealthRecordSchema, paginationSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { UserRole } from '@prisma/client'

// GET /api/users/profile - Get current user profile
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        village: true,
        upazila: true,
        district: true,
        division: true,
        latitude: true,
        longitude: true,
        medicalHistory: true,
        allergies: true,
        currentMedications: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      formatApiResponse(userProfile, 'User profile retrieved successfully')
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

// PATCH /api/users/profile - Update current user profile
export const PATCH = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const body = await request.json()
    
    // Validate input
    const validatedData = updateUserSchema.parse(body)
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        village: true,
        upazila: true,
        district: true,
        division: true,
        latitude: true,
        longitude: true,
        medicalHistory: true,
        allergies: true,
        currentMedications: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    return NextResponse.json(
      formatApiResponse(updatedUser, 'User profile updated successfully')
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
