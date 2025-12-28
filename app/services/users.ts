import axios, { AxiosResponse } from 'axios';

// Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  role: 'PATIENT' | 'HEALTH_WORKER' | 'ADMIN';
  location: {
    village: string;
    upazila: string;
    district: string;
    division: string;
    latitude?: number;
    longitude?: number;
  };
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  preferences: {
    language: 'EN' | 'BN';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      shareDataForResearch: boolean;
      allowLocationTracking: boolean;
    };
  };
  statistics: {
    totalConsultations: number;
    emergencyAlerts: number;
    voiceInteractions: number;
    educationContentRead: number;
    lastLogin: string;
    accountCreated: string;
  };
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  location?: {
    village?: string;
    upazila?: string;
    district?: string;
    division?: string;
    latitude?: number;
    longitude?: number;
  };
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  preferences?: {
    language?: 'EN' | 'BN';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      shareDataForResearch?: boolean;
      allowLocationTracking?: boolean;
    };
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
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

// Users Service
export class UsersService {
  /**
   * Get current user profile
   */
  static async getCurrentProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.get<UserProfileResponse>('/users/profile');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.patch<UpdateProfileResponse>('/users/profile', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID (admin only)
   */
  static async getUserById(userId: string): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.get<UserProfileResponse>(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: UserProfile['role'],
    district?: string
  ): Promise<{ success: boolean; data: { users: UserProfile[]; pagination: any } }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (role) {
        params.append('role', role);
      }

      if (district) {
        params.append('district', district);
      }

      const response = await apiClient.get(`/users?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(request: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/users/change-password', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete('/users/account');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch('/users/deactivate');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user dashboard statistics
   */
  static async getDashboardStats(): Promise<{ success: boolean; data: {
    recentConsultations: number;
    emergencyAlerts: number;
    unreadNotifications: number;
    upcomingAppointments?: number;
    healthScore: number;
    recommendations: string[];
  } }> {
    try {
      const response = await apiClient.get('/users/dashboard-stats');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user health summary
   */
  static async getHealthSummary(): Promise<{ success: boolean; data: {
    riskFactors: Array<{
      factor: string;
      level: 'LOW' | 'MEDIUM' | 'HIGH';
      description: string;
    }>;
    recommendations: string[];
    lastCheckup?: string;
    upcomingCheckups?: string[];
  } }> {
    try {
      const response = await apiClient.get('/users/health-summary');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(file: File): Promise<{ success: boolean; message: string; data: { profilePictureUrl: string } }> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user activity log
   */
  static async getActivityLog(page: number = 1, limit: number = 20): Promise<{ success: boolean; data: {
    activities: Array<{
      id: string;
      action: string;
      description: string;
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
    }>;
    pagination: any;
  } }> {
    try {
      const response = await apiClient.get('/users/activity-log', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format age for display
   */
  static formatAge(dateOfBirth: string, language: 'EN' | 'BN' = 'EN'): string {
    const age = this.calculateAge(dateOfBirth);
    return language === 'BN' ? `${age} বছর` : `${age} years old`;
  }

  /**
   * Get role information with language support
   */
  static getRoleInfo(role: UserProfile['role'], language: 'EN' | 'BN') {
    const roles = {
      EN: {
        PATIENT: { name: 'Patient', description: 'Healthcare service recipient', color: 'text-blue-600' },
        HEALTH_WORKER: { name: 'Health Worker', description: 'Healthcare service provider', color: 'text-green-600' },
        ADMIN: { name: 'Administrator', description: 'System administrator', color: 'text-purple-600' },
      },
      BN: {
        PATIENT: { name: 'রোগী', description: 'স্বাস্থ্যসেবা গ্রহণকারী', color: 'text-blue-600' },
        HEALTH_WORKER: { name: 'স্বাস্থ্যকর্মী', description: 'স্বাস্থ্যসেবা প্রদানকারী', color: 'text-green-600' },
        ADMIN: { name: 'প্রশাসক', description: 'সিস্টেম প্রশাসক', color: 'text-purple-600' },
      },
    };

    return roles[language][role] || role;
  }

  /**
   * Get gender information with language support
   */
  static getGenderInfo(gender: UserProfile['gender'], language: 'EN' | 'BN') {
    const genders = {
      EN: {
        MALE: { name: 'Male', icon: '👨' },
        FEMALE: { name: 'Female', icon: '👩' },
        OTHER: { name: 'Other', icon: '🧑' },
      },
      BN: {
        MALE: { name: 'পুরুষ', icon: '👨' },
        FEMALE: { name: 'নারী', icon: '👩' },
        OTHER: { name: 'অন্যান্য', icon: '🧑' },
      },
    };

    return genders[language][gender] || gender;
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    // Bangladesh phone number validation
    const bangladeshPhoneRegex = /^(\+8801|8801|01)[3-9]\d{8}$/;
    return bangladeshPhoneRegex.test(phone.replace(/[-\s]/g, ''));
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format for Bangladesh numbers
    if (cleaned.startsWith('880')) {
      return `+${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.startsWith('8801')) {
      return `+880-${cleaned.slice(4)}`;
    } else if (cleaned.startsWith('01')) {
      return `+880-${cleaned.slice(2)}`;
    }
    
    return phone; // Return original if not a Bangladesh number
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'User service error');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Network error occurred during user operation');
  }
}

export default UsersService;