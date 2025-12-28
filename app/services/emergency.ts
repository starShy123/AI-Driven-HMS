import axios, { AxiosResponse } from 'axios';

// Types
export interface EmergencyAlert {
  id: string;
  consultationId: string;
  emergencyType: 'MEDICAL_EMERGENCY' | 'PREGNANCY_COMPLICATION' | 'STROKE' | 'INFECTION' | 'INJURY' | 'OTHER';
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  alertMessage: string;
  recommendedAction: string;
  latitude?: number;
  longitude?: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  consultation?: {
    id: string;
    symptoms: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      village?: string;
      upazila?: string;
      district?: string;
      division?: string;
      latitude?: number;
      longitude?: number;
    };
  };
}

export interface MedicalResource {
  id: string;
  name: string;
  type: 'GOVERNMENT_CLINIC' | 'NGO_CLINIC' | 'PHARMACY' | 'HOSPITAL' | 'MOBILE_MEDICAL_TEAM' | 'COMMUNITY_HEALTH_CENTER';
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  village?: string;
  upazila?: string;
  district?: string;
  division?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  operatingHours?: string; // JSON string
  services?: string; // JSON array
  averageRating: number;
  totalReviews: number;
  distance?: number;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface EmergencyAlertsResponse {
  success: boolean;
  message: string;
  data: {
    alerts: EmergencyAlert[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface EmergencyResourcesResponse {
  success: boolean;
  message: string;
  data: {
    resources: MedicalResource[];
    userLocation: {
      latitude: number;
      longitude: number;
    };
    searchRadius: number;
    recommended: MedicalResource[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: string;
  };
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Emergency Service
export class EmergencyService {
  /**
   * Get emergency alerts for user
   */
  static async getUserAlerts(
    page: number = 1,
    limit: number = 10,
    status?: 'active' | 'resolved' | 'all'
  ): Promise<EmergencyAlertsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const response = await apiClient.get<EmergencyAlertsResponse>(`/emergency?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get emergency medical resources near user location
   */
  static async getEmergencyResources(
    latitude?: number,
    longitude?: number,
    radius: number = 50,
    page: number = 1,
    limit: number = 10
  ): Promise<EmergencyResourcesResponse> {
    try {
      const params = new URLSearchParams({
        radius: radius.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      if (latitude && longitude) {
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
      }

      const response = await apiClient.get<EmergencyResourcesResponse>(`/emergency/resources?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get emergency medical resources using POST with body parameters
   */
  static async getEmergencyResourcesPost(
    latitude: number,
    longitude: number,
    radius: number = 50,
    page: number = 1,
    limit: number = 10,
    resourceType?: string
  ): Promise<EmergencyResourcesResponse> {
    try {
      const response = await apiClient.post<EmergencyResourcesResponse>('/emergency/resources', {
        latitude,
        longitude,
        radius,
        page,
        limit,
        type: resourceType,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Resolve emergency alert (for healthcare workers/admin)
   */
  static async resolveAlert(
    alertId: string,
    resolutionNotes: string,
    resolvedBy?: string
  ): Promise<{ success: boolean; message: string; data: EmergencyAlert }> {
    try {
      const response = await apiClient.patch(`/emergency/${alertId}/resolve`, {
        resolutionNotes,
        resolvedBy,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get emergency preparedness tips
   */
  static getEmergencyTips(language: 'EN' | 'BN' = 'EN'): string[] {
    const tips = {
      EN: [
        'Keep emergency contact numbers easily accessible',
        'Know the location of the nearest hospital',
        'Have a basic first aid kit at home',
        'Keep important medical documents handy',
        'Ensure your phone is always charged',
        'Know basic emergency procedures',
        'Have a backup communication plan',
        'Keep emergency cash available',
      ],
      BN: [
        'জরুরি যোগাযোগের নম্বর সহজে পৌঁছানোর জায়গায় রাখুন',
        'নিকটস্থ হাসপাতালের অবস্থান জানুন',
        'বাড়িতে একটি মৌলিক প্রাথমিক চিকিৎসার কিট রাখুন',
        'গুরুত্বপূর্ণ চিকিৎসা নথি হাতের কাছে রাখুন',
        'নিশ্চিত করুন যে আপনার ফোন সর্বদা চার্জড',
        'মৌলিক জরুরি পদ্ধতি জানুন',
        'একটি ব্যাকআপ যোগাযোগ পরিকল্পনা রাখুন',
        'জরুরি নগদ অর্থ সংরক্ষণ করুন',
      ],
    };

    return tips[language];
  }

  /**
   * Get emergency contact numbers for Bangladesh
   */
  static getBangladeshEmergencyContacts(): Array<{
    type: string;
    name: string;
    phone: string;
    address?: string;
  }> {
    return [
      {
        type: 'AMBULANCE',
        name: 'National Emergency Service',
        phone: '102',
        address: 'Bangladesh',
      },
      {
        type: 'POLICE',
        name: 'Police Control Room',
        phone: '100',
        address: 'Bangladesh',
      },
      {
        type: 'FIRE_SERVICE',
        name: 'Fire Service Control Room',
        phone: '102',
        address: 'Bangladesh',
      },
      {
        type: 'HOSPITAL',
        name: 'National Institute of Cardiovascular Diseases',
        phone: '+880-2-9131591',
        address: 'Dhaka, Bangladesh',
      },
      {
        type: 'HOSPITAL',
        name: 'Bangabandhu Sheikh Mujib Medical University',
        phone: '+880-2-9661051',
        address: 'Dhaka, Bangladesh',
      },
    ];
  }

  /**
   * Get urgency level color for UI
   */
  static getUrgencyLevelColor(urgencyLevel: EmergencyAlert['urgencyLevel']): string {
    switch (urgencyLevel) {
      case 'EMERGENCY':
        return 'text-red-800 bg-red-100 border-red-300';
      case 'HIGH':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get resolved status color for UI
   */
  static getResolvedStatusColor(isResolved: boolean): string {
    return isResolved 
      ? 'text-green-700 bg-green-50 border-green-200'
      : 'text-red-700 bg-red-50 border-red-200';
  }

  /**
   * Get resolved status text
   */
  static getResolvedStatusText(isResolved: boolean, language: 'EN' | 'BN' = 'EN'): string {
    return language === 'BN' 
      ? (isResolved ? 'সমাধান হয়েছে' : 'অসমাধান')
      : (isResolved ? 'Resolved' : 'Active');
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  }

  /**
   * Get current location
   */
  static getCurrentLocation(): Promise<LocationInfo> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Unable to retrieve your location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'Emergency service error');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Network error occurred');
  }
}

export default EmergencyService;