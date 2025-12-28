import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { createUserSchema } from '@/lib/validations'
import { handleApiError, ValidationError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createUserSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
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
        createdAt: true,
        updatedAt: true,
      },
    })
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    })
    
    return NextResponse.json(
      formatApiResponse({
        user,
        token,
        message: 'User registered successfully',
      }),
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, error: { code: error.code, details: error.details } },
        { status: 400 }
      )
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: apiError.error.code === 'VALIDATION_ERROR' ? 400 : 500 })
  }
}