import axios, { AxiosResponse } from 'axios';

// Types
export interface HealthEducationContent {
  id: string;
  title: string;
  content: string;
  type: 'HEALTH_EDUCATION' | 'DISEASE_PREVENTION' | 'MATERNAL_HEALTH' | 'NUTRITION' | 'SEASONAL_HEALTH' | 'EMERGENCY_CARE';
  language: 'EN' | 'BN';
  targetAudience?: string;
  tags?: string[]; // JSON array
  season?: string;
  division?: string;
  isAIGenerated: boolean;
  views: number;
  likes: number;
  shares: number;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EducationRequest {
  type?: HealthEducationContent['type'];
  language?: 'EN' | 'BN';
  targetAudience?: string;
  season?: string;
  division?: string;
  search?: string;
  isAIGenerated?: boolean;
  page?: number;
  limit?: number;
}

export interface EducationResponse {
  success: boolean;
  message: string;
  data: {
    content: HealthEducationContent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      type?: string;
      language?: string;
      targetAudience?: string;
      season?: string;
      division?: string;
      search?: string;
      isAIGenerated?: string;
    };
  };
}

export interface AIGeneratedContentResponse {
  success: boolean;
  message: string;
  data: {
    topic: string;
    generatedContent: string;
    language: 'EN' | 'BN';
    targetAudience?: string;
    season?: string;
    division?: string;
    aiResponse: {
      text: string;
      language: 'EN' | 'BN';
      confidence: number;
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

// Type information interface
interface TypeInfo {
  name: string;
  description: string;
  icon: string;
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

// Education Service
export class EducationService {
  /**
   * Get health education content with filtering
   */
  static async getEducationContent(request: EducationRequest): Promise<EducationResponse> {
    try {
      const params = new URLSearchParams();
      
      if (request.type) params.append('type', request.type);
      if (request.language) params.append('language', request.language);
      if (request.targetAudience) params.append('targetAudience', request.targetAudience);
      if (request.season) params.append('season', request.season);
      if (request.division) params.append('division', request.division);
      if (request.search) params.append('search', request.search);
      if (request.isAIGenerated !== undefined) params.append('isAIGenerated', request.isAIGenerated.toString());
      if (request.page) params.append('page', request.page.toString());
      if (request.limit) params.append('limit', request.limit.toString());

      const response = await apiClient.get<EducationResponse>(`/education?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate AI health education content
   */
  static async generateAIContent(
    topic: string,
    language: 'EN' | 'BN' = 'EN',
    targetAudience?: string,
    season?: string,
    division?: string
  ): Promise<AIGeneratedContentResponse> {
    try {
      const response = await apiClient.post<AIGeneratedContentResponse>('/education/ai-generate', {
        topic,
        language,
        targetAudience,
        season,
        division,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get content type information with language support
   */
  static getContentTypeInfo(type: HealthEducationContent['type'], language: 'EN' | 'BN'): TypeInfo {
    const types: Record<'EN' | 'BN', Record<HealthEducationContent['type'], TypeInfo>> = {
      EN: {
        HEALTH_EDUCATION: { name: 'Health Education', description: 'General health information and tips', icon: '🏥' },
        DISEASE_PREVENTION: { name: 'Disease Prevention', description: 'Preventive measures and vaccination', icon: '🛡️' },
        MATERNAL_HEALTH: { name: 'Maternal Health', description: 'Pregnancy and women health', icon: '🤰' },
        NUTRITION: { name: 'Nutrition', description: 'Diet, nutrition, and healthy eating', icon: '🥗' },
        SEASONAL_HEALTH: { name: 'Seasonal Health', description: 'Weather-related health issues', icon: '🌤️' },
        EMERGENCY_CARE: { name: 'Emergency Care', description: 'First aid and emergency procedures', icon: '🚨' },
      },
      BN: {
        HEALTH_EDUCATION: { name: 'স্বাস্থ্য শিক্ষা', description: 'সাধারণ স্বাস্থ্য তথ্য ও পরামর্শ', icon: '🏥' },
        DISEASE_PREVENTION: { name: 'রোগ প্রতিরোধ', description: 'প্রতিরোধমূলক ব্যবস্থা ও টিকাদান', icon: '🛡️' },
        MATERNAL_HEALTH: { name: 'মাতৃস্বাস্থ্য', description: 'গর্ভাবস্থা ও নারীর স্বাস্থ্য', icon: '🤰' },
        NUTRITION: { name: 'পুষ্টি', description: 'খাদ্য, পুষ্টি ও স্বাস্থ্যকর খাবার', icon: '🥗' },
        SEASONAL_HEALTH: { name: 'মৌসুমি স্বাস্থ্য', description: 'আবহাওয়া-সংক্রান্ত স্বাস্থ্য সমস্যা', icon: '🌤️' },
        EMERGENCY_CARE: { name: 'জরুরি সেবা', description: 'প্রাথমিক চিকিৎসা ও জরুরি প্রক্রিয়া', icon: '🚨' },
      },
    };

    return types[language][type] || { name: type, description: '', icon: '' };
  }

  /**
   * Calculate reading time based on content length
   */
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Format reading time for display
   */
  static formatReadingTime(minutes: number, language: 'EN' | 'BN' = 'EN'): string {
    if (minutes < 1) {
      return language === 'BN' ? 'কম সময়' : 'Less than 1 min';
    }
    return language === 'BN' ? `${minutes} মিনিট` : `${minutes} min read`;
  }

  /**
   * Extract text excerpt from content
   */
  static getExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  /**
   * Get engagement level based on views, likes, and shares
   */
  static getEngagementLevel(content: HealthEducationContent): {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    color: string;
    description: string;
  } {
    const totalEngagement = content.views + (content.likes * 2) + (content.shares * 3);
    
    if (totalEngagement < 50) {
      return {
        level: 'LOW',
        color: 'text-gray-600',
        description: 'Low engagement',
      };
    } else if (totalEngagement < 200) {
      return {
        level: 'MEDIUM',
        color: 'text-yellow-600',
        description: 'Medium engagement',
      };
    } else {
      return {
        level: 'HIGH',
        color: 'text-green-600',
        description: 'High engagement',
      };
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'Education service error');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Network error occurred during education content retrieval');
  }
}

export default EducationService;