import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { asyncHandler, handleApiError, handleDatabaseError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'

// GET /api/users/emergency-contacts - Get user's emergency contacts
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: user.id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ],
    })
    
    return NextResponse.json(
      formatApiResponse(contacts, 'Emergency contacts retrieved successfully')
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

// POST /api/users/emergency-contacts - Add emergency contact
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { name, phone, relationship, isPrimary = false } = body
    
    if (!name || !phone || !relationship) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, and relationship are required' },
        { status: 400 }
      )
    }
    
    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      })
    }
    
    // Create emergency contact
    const contact = await prisma.emergencyContact.create({
      data: {
        userId: user.id,
        name,
        phone,
        relationship,
        isPrimary,
      },
    })
    
    return NextResponse.json(
      formatApiResponse(contact, 'Emergency contact added successfully'),
      { status: 201 }
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