import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { asyncHandler, handleApiError, handleAIError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { generateHealthEducation } from '@/lib/ai'
import { Language } from '@prisma/client'

// POST /api/education/ai-generate - Generate AI health education content
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { topic, language = 'EN', targetAudience, season, division } = body
    
    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Topic is required' },
        { status: 400 }
      )
    }
    
    // Generate AI content
    let aiContent
    try {
      aiContent = await generateHealthEducation(topic, language as Language)
    } catch (aiError) {
      handleAIError(aiError, 'health education generation')
      return NextResponse.json(
        { success: false, message: 'AI content generation failed' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      formatApiResponse({
        topic,
        generatedContent: aiContent.text,
        language: language as Language,
        targetAudience,
        season,
        division,
        aiResponse: aiContent,
      }, 'AI health education content generated successfully')
    )
    
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: 500 })
  }
};