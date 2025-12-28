import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createHealthEducationSchema, paginationSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError, handleAIError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { generateHealthEducation } from '@/lib/ai'
import { UserRole, Language, ContentType } from '@prisma/client'

// GET /api/education - Get health education content with filtering
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filters
    const type = searchParams.get('type') as ContentType
    const language = searchParams.get('language') as Language
    const targetAudience = searchParams.get('targetAudience')
    const season = searchParams.get('season')
    const division = searchParams.get('division')
    const isActive = searchParams.get('isActive') !== 'false' // Default to true
    const search = searchParams.get('search')
    const isAIGenerated = searchParams.get('isAIGenerated')
    
    // Build where clause
    const where: any = {
      isActive: isActive,
    }
    
    if (type) {
      where.type = type
    }
    
    if (language) {
      where.language = language
    }
    
    if (targetAudience) {
      where.targetAudience = {
        contains: targetAudience,
        mode: 'insensitive'
      }
    }
    
    if (season) {
      where.season = {
        contains: season,
        mode: 'insensitive'
      }
    }
    
    if (division) {
      where.division = {
        contains: division,
        mode: 'insensitive'
      }
    }
    
    if (isAIGenerated !== null) {
      where.isAIGenerated = isAIGenerated === 'true'
    }
    
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }
    
    // Get education content with pagination
    const [content, total] = await Promise.all([
      prisma.healthEducationContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
      }),
      prisma.healthEducationContent.count({ where }),
    ])
    
    // Parse tags for each content item
    const parsedContent = content.map(item => ({
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
    }))
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        content: parsedContent,
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
          language,
          targetAudience,
          season,
          division,
          search,
          isAIGenerated,
        },
      }, 'Health education content retrieved successfully')
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

// POST /api/education - Create new health education content (Admin/Healthcare Worker only)
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER])
    
    const body = await request.json()
    
    // Regular content creation
    const validatedData = createHealthEducationSchema.parse(body)
    
    // Create health education content
    const content = await prisma.healthEducationContent.create({
      data: {
        ...validatedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        publishedAt: new Date(),
      },
    })
    
    return NextResponse.json(
      formatApiResponse({
        ...content,
        tags: content.tags ? JSON.parse(content.tags) : [],
      }, 'Health education content created successfully'),
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
};
