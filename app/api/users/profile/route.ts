import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = await requireAuth(request);

    // Fetch user profile with related data
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        emergencyContacts: true,
        consultations: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        voiceInteractions: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Get counts separately
    const [consultationCount, emergencyAlertCount, voiceInteractionCount] = await Promise.all([
      prisma.consultation.count({ where: { userId: authUser.id } }),
      prisma.emergencyAlert.count({ where: { consultation: { userId: authUser.id } } }),
      prisma.voiceInteraction.count({ where: { userId: authUser.id } }),
    ]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
          error: {
            code: 'USER_NOT_FOUND',
            details: 'The requested user profile does not exist',
          },
        },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalConsultations = consultationCount;
    const emergencyAlerts = emergencyAlertCount;
    const voiceInteractions = voiceInteractionCount;

    // Get education content read count (mock for now)
    const educationContentRead = 0; // TODO: Implement when education tracking is added

    // Format the response according to UserProfile interface
    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth?.toISOString() || '',
      gender: user.gender as 'MALE' | 'FEMALE' | 'OTHER',
      role: user.role === 'HEALTHCARE_WORKER' ? 'HEALTH_WORKER' : user.role === 'COMMUNITY_HEALTH_WORKER' ? 'HEALTH_WORKER' : user.role as 'PATIENT' | 'HEALTH_WORKER' | 'ADMIN',
      location: {
        village: user.village || '',
        upazila: user.upazila || '',
        district: user.district || '',
        division: user.division || '',
        latitude: user.latitude || undefined,
        longitude: user.longitude || undefined,
      },
      medicalHistory: user.medicalHistory || '',
      allergies: user.allergies || '',
      currentMedications: user.currentMedications || '',
      emergencyContacts: user.emergencyContacts.map(contact => ({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
      })),
      preferences: {
        language: 'EN' as const, // Default to EN, TODO: Add to user model
        notifications: {
          email: true, // Default values, TODO: Add to user model
          sms: true,
          push: true,
        },
        privacy: {
          shareDataForResearch: false, // Default values, TODO: Add to user model
          allowLocationTracking: true,
        },
      },
      statistics: {
        totalConsultations,
        emergencyAlerts,
        voiceInteractions,
        educationContentRead,
        lastLogin: user.lastLogin?.toISOString() || '',
        accountCreated: user.createdAt.toISOString(),
      },
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin?.toISOString() || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: userProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: {
            code: 'UNAUTHORIZED',
            details: 'Please provide a valid authentication token',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user profile',
        error: {
          code: 'PROFILE_FETCH_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}