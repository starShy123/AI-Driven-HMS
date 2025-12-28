import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createVoiceInteractionSchema, paginationSchema } from '@/lib/validations'
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError, handleAIError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { processVoiceInput } from '@/lib/ai'
import { Language } from '@prisma/client'

// POST /api/voice - Process voice interaction
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createVoiceInteractionSchema.parse(body)
    
    let transcribedText = validatedData.transcribedText
    
    // If audioUrl is provided, we would typically process speech-to-text here
    // For now, we'll assume the transcribedText is already provided
    if (!transcribedText && validatedData.audioUrl) {
      // In a real implementation, you would:
      // 1. Download the audio file
      // 2. Send to speech-to-text service (Google Cloud Speech-to-Text)
      // 3. Get the transcribed text
      // For now, we'll return an error if only audioUrl is provided
      return NextResponse.json(
        { success: false, message: 'Audio processing not implemented. Please provide transcribedText.' },
        { status: 501 }
      )
    }
    
    if (!transcribedText) {
      return NextResponse.json(
        { success: false, message: 'Either audioUrl or transcribedText is required' },
        { status: 400 }
      )
    }
    
    // Process voice input with AI
    let aiResponse
    try {
      aiResponse = await processVoiceInput(transcribedText, validatedData.language as Language)
    } catch (aiError) {
      handleAIError(aiError, 'voice processing')
      // Fallback response if AI fails
      aiResponse = {
        text: validatedData.language === 'BN' 
          ? 'দুঃখিত, বর্তমানে আপনার প্রশ্নের উত্তর দিতে পারছি না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
          : 'Sorry, I cannot process your request right now. Please try again later.',
        language: validatedData.language as Language,
        confidence: 0.1,
      }
    }
    
    // Create voice interaction record
    const voiceInteraction = await prisma.voiceInteraction.create({
      data: {
        userId: user.id,
        audioUrl: validatedData.audioUrl,
        transcribedText: transcribedText,
        language: validatedData.language as Language,
        aiResponseText: aiResponse.text,
        responseAudioUrl: null, // Would be generated from AI response
        consultationId: validatedData.consultationId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
    
    return NextResponse.json(
      formatApiResponse({
        ...voiceInteraction,
        aiResponse: aiResponse,
      }, 'Voice interaction processed successfully'),
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

// GET /api/voice - Get user's voice interactions
export const GET = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const language = searchParams.get('language') as Language
    const consultationId = searchParams.get('consultationId')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = { userId: user.id }
    
    if (language) {
      where.language = language
    }
    
    if (consultationId) {
      where.consultationId = consultationId
    }
    
    // Get voice interactions with pagination
    const [interactions, total] = await Promise.all([
      prisma.voiceInteraction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.voiceInteraction.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      formatApiResponse({
        interactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          language,
          consultationId,
        },
      }, 'Voice interactions retrieved successfully')
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