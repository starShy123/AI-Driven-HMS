import axios, { AxiosResponse } from 'axios';

// Types
export interface MedicalResource {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'CLINIC' | 'PHARMACY' | 'DIAGNOSTIC_CENTER' | 'BLOOD_BANK' | 'AMBULANCE_SERVICE';
  description?: string;
  address: {
    street: string;
    village?: string;
    upazila: string;
    district: string;
    division: string;
    postalCode?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  services: string[];
  specialties?: string[];
  facilities?: string[];
  operatingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  rating?: number;
  reviewCount?: number;
  isEmergency: boolean;
  isVerified: boolean;
  isOpen: boolean;
  distance?: number;
  estimatedTravelTime?: number;
  insuranceAccepted?: string[];
  costRange?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ResourceSearchRequest {
  type?: MedicalResource['type'];
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  district?: string;
  upazila?: string;
  services?: string[];
  specialties?: string[];
  isEmergency?: boolean;
  isOpen?: boolean;
  costRange?: MedicalResource['costRange'];
}

export interface ResourceSearchResponse {
  success: boolean;
  message: string;
  data: {
    resources: MedicalResource[];
    total: number;
    filters: {
      types: MedicalResource['type'][];
      districts: string[];
      upazilas: string[];
      services: string[];
    };
  };
}

export interface ResourceResponse {
  success: boolean;
  message: string;
  data: MedicalResource;
}

export interface ResourceTypesResponse {
  success: boolean;
  message: string;
  data: {
    types: Array<{
      id: MedicalResource['type'];
      name: string;
      description: string;
      icon: string;
      color: string;
      resourceCount: number;
    }>;
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

// Resources Service
export class ResourcesService {
  /**
   * Search medical resources
   */
  static async searchResources(request: ResourceSearchRequest): Promise<ResourceSearchResponse> {
    try {
      const response = await apiClient.post<ResourceSearchResponse>('/resources/search', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific resource by ID
   */
  static async getResource(resourceId: string): Promise<ResourceResponse> {
    try {
      const response = await apiClient.get<ResourceResponse>(`/resources/${resourceId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get resources near a location
   */
  static async getNearbyResources(
    latitude: number,
    longitude: number,
    radius: number = 10,
    type?: MedicalResource['type']
  ): Promise<ResourceSearchResponse> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      });

      if (type) {
        params.append('type', type);
      }

      const response = await apiClient.get<ResourceSearchResponse>(`/resources/nearby?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get emergency resources (hospitals, ambulance services)
   */
  static async getEmergencyResources(location?: { latitude: number; longitude: number }): Promise<ResourceSearchResponse> {
    try {
      const request: ResourceSearchRequest = {
        type: 'HOSPITAL',
        isEmergency: true,
        ...(location && { ...location }),
      };

      const response = await this.searchResources(request);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get 24/7 resources
   */
  static async get24hResources(location?: { latitude: number; longitude: number }): Promise<ResourceSearchResponse> {
    try {
      const request: ResourceSearchRequest = {
        type: 'HOSPITAL',
        isOpen: true,
        ...(location && { ...location }),
      };

      const response = await this.searchResources(request);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available resource types
   */
  static async getResourceTypes(): Promise<ResourceTypesResponse> {
    try {
      const response = await apiClient.get<ResourceTypesResponse>('/resources/types');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate distance between two points
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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
   * Get resource type information with language support
   */
  static getResourceTypeInfo(type: MedicalResource['type'], language: 'EN' | 'BN') {
    const types = {
      EN: {
        HOSPITAL: { name: 'Hospital', description: 'Full-service medical facility', icon: '🏥', color: 'text-red-600' },
        CLINIC: { name: 'Clinic', description: 'Outpatient medical facility', icon: '🏥', color: 'text-blue-600' },
        PHARMACY: { name: 'Pharmacy', description: 'Medicine and drug store', icon: '💊', color: 'text-green-600' },
        DIAGNOSTIC_CENTER: { name: 'Diagnostic Center', description: 'Medical tests and diagnostics', icon: '🔬', color: 'text-purple-600' },
        BLOOD_BANK: { name: 'Blood Bank', description: 'Blood donation and storage', icon: '🩸', color: 'text-red-500' },
        AMBULANCE_SERVICE: { name: 'Ambulance Service', description: 'Emergency medical transport', icon: '🚑', color: 'text-orange-600' },
      },
      BN: {
        HOSPITAL: { name: 'হাসপাতাল', description: 'সম্পূর্ণ সেবা প্রদানকারী চিকিৎসা কেন্দ্র', icon: '🏥', color: 'text-red-600' },
        CLINIC: { name: 'ক্লিনিক', description: 'বহির্বিভাগ চিকিৎসা কেন্দ্র', icon: '🏥', color: 'text-blue-600' },
        PHARMACY: { name: 'ফার্মেসি', description: 'ওষুধ ও ড্রাগ স্টোর', icon: '💊', color: 'text-green-600' },
        DIAGNOSTIC_CENTER: { name: 'ডায়াগনস্টিক সেন্টার', description: 'চিকিৎসা পরীক্ষা ও নির্ণয়', icon: '🔬', color: 'text-purple-600' },
        BLOOD_BANK: { name: 'ব্লাড ব্যাঙ্ক', description: 'রক্তদান ও সংরক্ষণ', icon: '🩸', color: 'text-red-500' },
        AMBULANCE_SERVICE: { name: 'এম্বুলেন্স সার্ভিস', description: 'জরুরি চিকিৎসা পরিবহন', icon: '🚑', color: 'text-orange-600' },
      },
    };

    return types[language][type] || type;
  }

  /**
   * Check if resource is currently open
   */
  static isCurrentlyOpen(resource: MedicalResource): boolean {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todaySchedule = resource.operatingHours[currentDay];
    if (!todaySchedule || todaySchedule.closed) {
      return false;
    }

    return currentTime >= todaySchedule.open && currentTime <= todaySchedule.close;
  }

  /**
   * Get operating status text
   */
  static getOperatingStatus(resource: MedicalResource, language: 'EN' | 'BN' = 'EN'): {
    status: string;
    color: string;
    isOpen: boolean;
  } {
    const isOpen = this.isCurrentlyOpen(resource);
    
    if (isOpen) {
      return {
        status: language === 'BN' ? 'খোলা' : 'Open',
        color: 'text-green-600',
        isOpen: true,
      };
    } else {
      return {
        status: language === 'BN' ? 'বন্ধ' : 'Closed',
        color: 'text-red-600',
        isOpen: false,
      };
    }
  }

  /**
   * Get cost range information
   */
  static getCostRangeInfo(costRange: MedicalResource['costRange'], language: 'EN' | 'BN') {
    const costRanges = {
      EN: {
        LOW: { name: 'Affordable', description: 'Budget-friendly options', color: 'text-green-600' },
        MEDIUM: { name: 'Moderate', description: 'Standard pricing', color: 'text-yellow-600' },
        HIGH: { name: 'Premium', description: 'Higher cost services', color: 'text-red-600' },
      },
      BN: {
        LOW: { name: 'সাশ্রয়ী', description: 'বাজেট-বান্ধব অপশন', color: 'text-green-600' },
        MEDIUM: { name: 'মধ্যম', description: 'মানসম্পন্ন মূল্য', color: 'text-yellow-600' },
        HIGH: { name: 'উচ্চমূল্যের', description: 'উচ্চ খরচের সেবা', color: 'text-red-600' },
      },
    };

    return costRanges[language][costRange as keyof typeof costRanges['EN']] || costRange;
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'Resources service error');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Network error occurred during resource search');
  }
}

export default ResourcesService;