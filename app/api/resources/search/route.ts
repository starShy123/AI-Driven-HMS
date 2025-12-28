import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ResourceType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth(request);

    const body = await request.json();
    const {
      type,
      latitude,
      longitude,
      radius = 10,
      district,
      upazila,
      services,
      specialties,
      isEmergency,
      isOpen,
      costRange
    } = body;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (type) {
      const prismaType = mapServiceTypeToPrisma(type);
      if (prismaType) {
        where.type = prismaType;
      }
    }

    if (district) {
      where.district = {
        contains: district,
        mode: 'insensitive'
      };
    }

    if (upazila) {
      where.upazila = {
        contains: upazila,
        mode: 'insensitive'
      };
    }

    // Get resources
    let resources = await prisma.medicalResource.findMany({
      where,
      orderBy: [
        { averageRating: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // Filter by location if provided
    if (latitude && longitude && radius) {
      resources = resources.filter(resource => {
        const distance = calculateDistance(latitude, longitude, resource.latitude, resource.longitude);
        return distance <= radius;
      }).map(resource => ({
        ...resource,
        distance: calculateDistance(latitude, longitude, resource.latitude, resource.longitude),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Transform to match service interface
    const transformedResources = resources.map(resource => ({
      id: resource.id,
      name: resource.name,
      type: mapResourceType(resource.type),
      description: resource.description || '',
      address: {
        street: resource.address,
        village: resource.village || '',
        upazila: resource.upazila || '',
        district: resource.district || '',
        division: resource.division || '',
      },
      location: {
        latitude: resource.latitude,
        longitude: resource.longitude,
      },
      contact: {
        phone: resource.phone || '',
        email: resource.email || '',
        website: resource.website || '',
      },
      services: resource.services ? JSON.parse(resource.services) : [],
      operatingHours: resource.operatingHours ? JSON.parse(resource.operatingHours) : {},
      rating: resource.averageRating,
      reviewCount: resource.totalReviews,
      isEmergency: resource.type === 'HOSPITAL',
      isVerified: true, // Assume verified for now
      isOpen: true, // TODO: Implement based on operating hours
      distance: (resource as any).distance,
    }));

    // Get filter options
    const types = ['HOSPITAL', 'CLINIC', 'PHARMACY', 'DIAGNOSTIC_CENTER', 'BLOOD_BANK', 'AMBULANCE_SERVICE'];
    const districts = [...new Set(transformedResources.map(r => r.address.district).filter(Boolean))];
    const upazilas = [...new Set(transformedResources.map(r => r.address.upazila).filter(Boolean))];
    const allServices = [...new Set(transformedResources.flatMap(r => r.services))];

    return NextResponse.json({
      success: true,
      message: 'Resources search completed successfully',
      data: {
        resources: transformedResources,
        total: transformedResources.length,
        filters: {
          types,
          districts,
          upazilas,
          services: allServices,
        },
      },
    });
  } catch (error) {
    console.error('Error searching resources:', error);

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
        message: 'Failed to search resources',
        error: {
          code: 'SEARCH_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Map service enum to Prisma enum
function mapServiceTypeToPrisma(type: string): ResourceType | undefined {
  switch (type) {
    case 'HOSPITAL': return ResourceType.HOSPITAL;
    case 'CLINIC': return ResourceType.GOVERNMENT_CLINIC; // Default to government clinic
    case 'PHARMACY': return ResourceType.PHARMACY;
    case 'DIAGNOSTIC_CENTER': return ResourceType.MOBILE_MEDICAL_TEAM; // Map to mobile medical team as closest
    case 'BLOOD_BANK': return ResourceType.PHARMACY; // No blood bank in enum, map to pharmacy
    case 'AMBULANCE_SERVICE': return ResourceType.MOBILE_MEDICAL_TEAM;
    default: return undefined;
  }
}

// Map Prisma enum to service enum
function mapResourceType(type: string): 'HOSPITAL' | 'CLINIC' | 'PHARMACY' | 'DIAGNOSTIC_CENTER' | 'BLOOD_BANK' | 'AMBULANCE_SERVICE' {
  switch (type) {
    case 'HOSPITAL': return 'HOSPITAL';
    case 'NGO_CLINIC':
    case 'GOVERNMENT_CLINIC':
    case 'COMMUNITY_HEALTH_CENTER':
      return 'CLINIC';
    case 'PHARMACY': return 'PHARMACY';
    case 'MOBILE_MEDICAL_TEAM': return 'AMBULANCE_SERVICE';
    default: return 'CLINIC';
  }
}