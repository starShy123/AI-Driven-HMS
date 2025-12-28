import axios, { AxiosResponse } from 'axios';

// Types
export interface SymptomCheckRequest {
  symptoms: string;
  language: 'EN' | 'BN';
  consultationLocation?: string;
}

export interface ConsultationAnalysis {
  possibleConditions: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  recommendations: string[];
  riskScore: number;
  emergencyFlags: string[];
}

export interface EmergencyInfo {
  isEmergency: boolean;
  message: string;
  type: 'MEDICAL_EMERGENCY' | 'PSYCHOLOGICAL_EMERGENCY' | 'TRAUMA_EMERGENCY';
}

export interface UserLocation {
  village: string;
  upazila: string;
  district: string;
  division: string;
}

export interface Consultation {
  id: string;
  symptoms: string;
  urgencyLevel: string;
  status: string;
  createdAt: string;
}

export interface SymptomCheckResponse {
  success: boolean;
  message: string;
  data: {
    consultationId: string;
    symptoms: string;
    analysis: ConsultationAnalysis;
    emergency: EmergencyInfo;
    language: string;
    timestamp: string;
    user: {
      name: string;
      location: UserLocation;
    };
  };
}

export interface ConsultationsListResponse {
  success: boolean;
  message: string;
  data: {
    consultations: Consultation[];
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
  timeout: 30000, // Longer timeout for AI processing
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

// Consultation Service
export class ConsultationService {
  /**
   * Submit symptoms for AI analysis
   */
  static async checkSymptoms(request: SymptomCheckRequest): Promise<SymptomCheckResponse> {
    try {
      const response = await apiClient.post<SymptomCheckResponse>(
        '/consultations/symptom-check',
        request
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's consultation history
   */
  static async getConsultations(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<ConsultationsListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const response = await apiClient.get<ConsultationsListResponse>(
        `/consultations/symptom-check?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific consultation details
   */
  static async getConsultation(consultationId: string): Promise<SymptomCheckResponse> {
    try {
      const response = await apiClient.get<SymptomCheckResponse>(
        `/consultations/symptom-check/${consultationId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get urgency level color for UI
   */
  static getUrgencyColor(urgencyLevel: string): string {
    switch (urgencyLevel.toUpperCase()) {
      case 'EMERGENCY':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get urgency level text with language support
   */
  static getUrgencyText(urgencyLevel: string, language: 'EN' | 'BN' = 'EN'): string {
    const urgencyTexts = {
      EN: {
        EMERGENCY: 'Emergency',
        HIGH: 'High Priority',
        MEDIUM: 'Medium Priority',
        LOW: 'Low Priority',
      },
      BN: {
        EMERGENCY: 'জরুরি',
        HIGH: 'উচ্চ অগ্রাধিকার',
        MEDIUM: 'মধ্যম অগ্রাধিকার',
        LOW: 'নিম্ন অগ্রাধিকার',
      },
    };

    return urgencyTexts[language][urgencyLevel as keyof typeof urgencyTexts['EN']] || urgencyLevel;
  }

  /**
   * Check if consultation indicates emergency
   */
  static isEmergency(analysis: ConsultationAnalysis): boolean {
    return analysis.urgencyLevel === 'EMERGENCY' || analysis.emergencyFlags.length > 0;
  }

  /**
   * Format risk score for display
   */
  static formatRiskScore(score: number): { level: string; color: string } {
    if (score >= 8) {
      return { level: 'High Risk', color: 'text-red-600' };
    } else if (score >= 6) {
      return { level: 'Medium Risk', color: 'text-orange-600' };
    } else if (score >= 4) {
      return { level: 'Low Risk', color: 'text-yellow-600' };
    } else {
      return { level: 'Minimal Risk', color: 'text-green-600' };
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'Symptom analysis failed');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }
    
    return new Error('Network error occurred during symptom analysis');
  }
}

export default ConsultationService;