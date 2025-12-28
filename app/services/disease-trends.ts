import axios, { AxiosResponse } from 'axios';

// Types
export interface DiseaseTrend {
  id: string;
  diseaseName: string;
  category: 'INFECTIOUS' | 'CHRONIC' | 'SEASONAL' | 'EMERGING';
  region: {
    division: string;
    district: string;
    upazila?: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  statistics: {
    totalCases: number;
    newCases: number;
    recoveredCases: number;
    deaths: number;
    incidenceRate: number; // cases per 100,000 population
    mortalityRate: number; // deaths per 100,000 population
    recoveryRate: number; // percentage
  };
  trends: {
    direction: 'INCREASING' | 'DECREASING' | 'STABLE';
    changePercentage: number;
    weeklyTrend: Array<{
      week: string;
      cases: number;
      deaths: number;
    }>;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  demographics: {
    ageGroups: Array<{
      ageRange: string;
      cases: number;
      percentage: number;
    }>;
    genderDistribution: {
      male: number;
      female: number;
      other: number;
    };
  };
  recommendations: string[];
  lastUpdated: string;
}

export interface TrendAnalysisRequest {
  diseaseName?: string;
  region?: {
    division?: string;
    district?: string;
    upazila?: string;
  };
  period?: {
    startDate: string;
    endDate: string;
  };
  category?: DiseaseTrend['category'];
}

export interface DiseaseTrendsResponse {
  success: boolean;
  message: string;
  data: {
    trends: DiseaseTrend[];
    summary: {
      totalDiseases: number;
      highRiskDiseases: number;
      totalCases: number;
      averageIncidenceRate: number;
      lastUpdated: string;
    };
  };
}

export interface DiseaseTrendResponse {
  success: boolean;
  message: string;
  data: DiseaseTrend;
}

export interface RegionalTrendsResponse {
  success: boolean;
  message: string;
  data: {
    region: {
      division: string;
      districts: Array<{
        name: string;
        totalCases: number;
        highRiskDiseases: number;
        trends: DiseaseTrend[];
      }>;
    };
    comparison: {
      nationalAverage: number;
      regionalPerformance: 'ABOVE' | 'BELOW' | 'AT';
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
  timeout: 20000,
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

// Disease Trends Service
export class DiseaseTrendsService {
  /**
   * Get disease trends based on filters
   */
  static async getDiseaseTrends(request: TrendAnalysisRequest): Promise<DiseaseTrendsResponse> {
    try {
      const response = await apiClient.post<DiseaseTrendsResponse>('/disease-trends/analyze', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific disease trend by ID
   */
  static async getDiseaseTrend(trendId: string): Promise<DiseaseTrendResponse> {
    try {
      const response = await apiClient.get<DiseaseTrendResponse>(`/disease-trends/${trendId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get regional disease trends
   */
  static async getRegionalTrends(division: string): Promise<RegionalTrendsResponse> {
    try {
      const response = await apiClient.get<RegionalTrendsResponse>('/disease-trends/regional', {
        params: { division },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current disease outbreaks
   */
  static async getCurrentOutbreaks(): Promise<DiseaseTrendsResponse> {
    try {
      const response = await apiClient.get<DiseaseTrendsResponse>('/disease-trends/outbreaks');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get seasonal disease predictions
   */
  static async getSeasonalPredictions(region?: string): Promise<{ success: boolean; data: { predictions: Array<{
    disease: string;
    season: string;
    riskLevel: DiseaseTrend['riskLevel'];
    expectedCases: number;
    recommendations: string[];
  }> } }> {
    try {
      const params = region ? { region } : {};
      const response = await apiClient.get('/disease-trends/seasonal-predictions', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get disease surveillance alerts
   */
  static async getSurveillanceAlerts(): Promise<{ success: boolean; data: { alerts: Array<{
    id: string;
    disease: string;
    severity: DiseaseTrend['riskLevel'];
    region: string;
    message: string;
    issuedDate: string;
    validUntil: string;
  }> } }> {
    try {
      const response = await apiClient.get('/disease-trends/alerts');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available regions for disease tracking
   */
  static async getAvailableRegions(): Promise<{ success: boolean; data: { regions: Array<{
    division: string;
    districts: string[];
  }> } }> {
    try {
      const response = await apiClient.get('/disease-trends/regions');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get risk level color for UI
   */
  static getRiskLevelColor(riskLevel: DiseaseTrend['riskLevel']): string {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'text-red-800 bg-red-100 border-red-300';
      case 'HIGH':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW':
        return 'text-green-700 bg-green-50 border-green-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get trend direction icon and color
   */
  static getTrendDirection(trend: DiseaseTrend['trends']): {
    icon: string;
    color: string;
    text: string;
  } {
    switch (trend.direction) {
      case 'INCREASING':
        return {
          icon: '📈',
          color: 'text-red-600',
          text: 'Increasing',
        };
      case 'DECREASING':
        return {
          icon: '📉',
          color: 'text-green-600',
          text: 'Decreasing',
        };
      case 'STABLE':
        return {
          icon: '➡️',
          color: 'text-blue-600',
          text: 'Stable',
        };
      default:
        return {
          icon: '❓',
          color: 'text-gray-600',
          text: 'Unknown',
        };
    }
  }

  /**
   * Get category information with language support
   */
  static getCategoryInfo(category: DiseaseTrend['category'], language: 'EN' | 'BN') {
    const categories = {
      EN: {
        INFECTIOUS: { name: 'Infectious Diseases', description: 'Spread through contact or vectors', icon: '🦠' },
        CHRONIC: { name: 'Chronic Diseases', description: 'Long-term health conditions', icon: '💊' },
        SEASONAL: { name: 'Seasonal Diseases', description: 'Weather-dependent outbreaks', icon: '🌤️' },
        EMERGING: { name: 'Emerging Diseases', description: 'New or re-emerging health threats', icon: '⚠️' },
      },
      BN: {
        INFECTIOUS: { name: 'সংক্রামক রোগ', description: 'সংস্পর্শ বা ভেক্টরের মাধ্যমে ছড়ায়', icon: '🦠' },
        CHRONIC: { name: 'দীর্ঘস্থায়ী রোগ', description: 'দীর্ঘমেয়াদি স্বাস্থ্য অবস্থা', icon: '💊' },
        SEASONAL: { name: 'মৌসুমি রোগ', description: 'আবহাওয়া-নির্ভর প্রাদুর্ভাব', icon: '🌤️' },
        EMERGING: { name: 'নতুন রোগ', description: 'নতুন বা পুনরায় আবির্ভূত স্বাস্থ্য ঝুঁকি', icon: '⚠️' },
      },
    };

    return categories[language][category] || category;
  }

  /**
   * Format incidence rate for display
   */
  static formatIncidenceRate(rate: number): string {
    if (rate >= 100) {
      return `${rate.toFixed(0)} per 100k`;
    } else if (rate >= 10) {
      return `${rate.toFixed(1)} per 100k`;
    } else {
      return `${rate.toFixed(2)} per 100k`;
    }
  }

  /**
   * Calculate trend significance
   */
  static getTrendSignificance(changePercentage: number): {
    level: 'MINOR' | 'MODERATE' | 'MAJOR';
    color: string;
    description: string;
  } {
    const absChange = Math.abs(changePercentage);
    
    if (absChange < 5) {
      return {
        level: 'MINOR',
        color: 'text-gray-600',
        description: 'Minor change',
      };
    } else if (absChange < 20) {
      return {
        level: 'MODERATE',
        color: 'text-yellow-600',
        description: 'Moderate change',
      };
    } else {
      return {
        level: 'MAJOR',
        color: 'text-red-600',
        description: 'Major change',
      };
    }
  }

  /**
   * Get health recommendation based on disease and risk level
   */
  static getHealthRecommendations(diseaseName: string, riskLevel: DiseaseTrend['riskLevel'], language: 'EN' | 'BN' = 'EN'): string[] {
    const recommendations = {
      EN: {
        LOW: [
          'Maintain basic hygiene practices',
          'Stay informed about local health updates',
          'Consult healthcare provider if symptoms appear',
        ],
        MEDIUM: [
          'Take preventive measures seriously',
          'Avoid crowded places when possible',
          'Consider vaccination if available',
          'Monitor symptoms closely',
        ],
        HIGH: [
          'Seek immediate medical attention if symptomatic',
          'Follow isolation protocols if required',
          'Contact health authorities for guidance',
          'Avoid travel to affected areas',
        ],
        CRITICAL: [
          'Seek emergency medical care immediately',
          'Follow all public health advisories',
          'Implement strict isolation measures',
              'Contact emergency services if needed',
        ],
      },
      BN: {
        LOW: [
          'মৌলিক স্বাস্থ্যবিধি বজায় রাখুন',
          'স্থানীয় স্বাস্থ্য আপডেট সম্পর্কে অবগত থাকুন',
          'উপসর্গ দেখা দিলে চিকিৎসকের সাথে পরামর্শ করুন',
        ],
        MEDIUM: [
          'প্রতিরোধমূলক ব্যবস্থা গুরুত্বের সাথে নিন',
          'সম্ভব হলে ভিড় এড়িয়ে চলুন',
          'উপলব্ধ থাকলে টিকাদান বিবেচনা করুন',
          'উপসর্গগুলো ঘনিষ্ঠভাবে পর্যবেক্ষণ করুন',
        ],
        HIGH: [
          'উপসর্গ থাকলে অবিলম্বে চিকিৎসা সেবা নিন',
          'প্রয়োজনে আইসোলেশন প্রোটোকল অনুসরণ করুন',
          'নির্দেশনার জন্য স্বাস্থ্য কর্তৃপক্ষের সাথে যোগাযোগ করুন',
          'প্রভাবিত এলাকায় ভ্রমণ এড়িয়ে চলুন',
        ],
        CRITICAL: [
          'অবিলম্বে জরুরি চিকিৎসা সেবা নিন',
          'সব্বর জনস্বাস্থ্য পরামর্শ অনুসরণ করুন',
          'কঠোর আইসোলেশন ব্যবস্থা প্রয়োগ করুন',
          'প্রয়োজনে জরুরি সেবায় যোগাযোগ করুন',
        ],
      },
    };

    return recommendations[language][riskLevel] || recommendations[language]['LOW'];
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'Disease trends service error');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Network error occurred during disease trends analysis');
  }
}

export default DiseaseTrendsService;