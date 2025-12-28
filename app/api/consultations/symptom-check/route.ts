import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { analyzeSymptoms, detectEmergency } from '@/lib/ai';
import { createConsultationSchema } from '@/lib/validations';
import { asyncHandler, handleApiError, ValidationError, handleDatabaseError, handleAIError } from '@/utils/errors';
import { containsEmergencyKeywords, formatApiResponse } from '@/utils/helpers';
import { UrgencyLevel, Language } from '@prisma/client';

export const POST = async (request: NextRequest) => {
  try {
    // Authenticate user and get full user data
    const authUser = await requireAuth(request);
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        village: true,
        upazila: true,
        district: true,
        division: true,
        latitude: true,
        longitude: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = createConsultationSchema.parse(body);
    
    // Check for emergency keywords in symptoms
    const hasEmergencyKeywords = containsEmergencyKeywords(
      validatedData.symptoms, 
      validatedData.language as Language
    );
    
    // Start AI analysis and emergency detection in parallel
    const [analysisResult, emergencyCheck] = await Promise.allSettled([
      analyzeSymptoms(validatedData.symptoms, validatedData.language as Language),
      detectEmergency(validatedData.symptoms, validatedData.language as Language)
    ]);
    
    let analysis: any = {
      possibleConditions: ['Analysis pending'],
      urgencyLevel: 'MEDIUM' as UrgencyLevel,
      recommendations: ['Consult healthcare provider'],
      riskScore: 5,
      emergencyFlags: [],
    };
    
    let emergency = {
      isEmergency: false,
      message: 'No emergency detected',
    };
    
    // Handle AI analysis results
    if (analysisResult.status === 'fulfilled') {
      analysis = analysisResult.value;
    } else {
      console.error('AI Analysis Error:', analysisResult.reason);
      handleAIError(analysisResult.reason, 'symptom analysis');
    }
    
    // Handle emergency detection results
    if (emergencyCheck.status === 'fulfilled') {
      emergency = emergencyCheck.value;
    } else {
      console.error('Emergency Detection Error:', emergencyCheck.reason);
      handleAIError(emergencyCheck.reason, 'emergency detection');
    }
    
    // Determine final urgency level
    let finalUrgencyLevel = analysis.urgencyLevel;
    if (emergency.isEmergency || hasEmergencyKeywords) {
      finalUrgencyLevel = 'EMERGENCY';
    }
    
    // Create consultation record
    const consultation = await prisma.consultation.create({
      data: {
        userId: user.id,
        symptoms: validatedData.symptoms,
        aiResponse: `AI Analysis: ${JSON.stringify(analysis)}`,
        urgencyLevel: finalUrgencyLevel,
        status: finalUrgencyLevel === 'EMERGENCY' ? 'EMERGENCY' : 'PENDING',
        language: validatedData.language as Language,
        possibleConditions: JSON.stringify(analysis.possibleConditions),
        recommendations: JSON.stringify(analysis.recommendations),
        riskScore: analysis.riskScore,
        consultationLocation: validatedData.consultationLocation,
      },
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
    });
    
    // Create emergency alert if needed
    let emergencyAlert = null;
    if (emergency.isEmergency || finalUrgencyLevel === 'EMERGENCY') {
      emergencyAlert = await prisma.emergencyAlert.create({
        data: {
          consultationId: consultation.id,
          emergencyType: emergency.isEmergency ? 'MEDICAL_EMERGENCY' : 'OTHER',
          urgencyLevel: 'EMERGENCY',
          alertMessage: emergency.message || 'Emergency symptoms detected',
          recommendedAction: validatedData.language === 'BN' 
            ? 'অবিলম্বে নিকটতম জরুরি সেবায় যোগাযোগ করুন'
            : 'Contact nearest emergency services immediately',
          latitude: user.latitude || null,
          longitude: user.longitude || null,
        },
      });
    }
    
    // Prepare response based on language
    const response = {
      consultationId: consultation.id,
      symptoms: validatedData.symptoms,
      analysis: {
        possibleConditions: analysis.possibleConditions,
        urgencyLevel: finalUrgencyLevel,
        recommendations: analysis.recommendations,
        riskScore: analysis.riskScore,
        emergencyFlags: analysis.emergencyFlags,
      },
      emergency: {
        isEmergency: emergency.isEmergency || finalUrgencyLevel === 'EMERGENCY',
        message: emergency.message,
        type: emergencyAlert?.emergencyType,
      },
      language: validatedData.language,
      timestamp: consultation.createdAt,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        location: {
          village: user.village || null,
          upazila: user.upazila || null,
          district: user.district || null,
          division: user.division || null,
        },
      },
    };
    
    return NextResponse.json(
      formatApiResponse(response, 'Symptom analysis completed'),
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, error: { code: error.code, details: error.details } },
        { status: 400 }
      );
    }
    
    try {
      handleDatabaseError(error);
    } catch (dbError) {
      const apiError = handleApiError(dbError);
      return NextResponse.json(apiError, { status: 500 });
    }
    
    const apiError = handleApiError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
};

export const GET = async (request: NextRequest) => {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }
    
    // Get consultations with pagination
    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          emergencyAlerts: {
            where: { isResolved: false },
          },
        },
      }),
      prisma.consultation.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      message: 'Consultations retrieved successfully',
      data: {
        consultations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
    
  } catch (error) {
    const apiError = handleApiError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
};

