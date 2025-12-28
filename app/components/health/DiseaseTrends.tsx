"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/app/services/auth';
import DiseaseTrendsService, { DiseaseTrend, TrendAnalysisRequest } from '@/app/services/disease-trends';

interface DiseaseTrendsProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function DiseaseTrends({ language, user, onNavigate }: DiseaseTrendsProps) {
  const [trends, setTrends] = useState<DiseaseTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const texts = {
    EN: {
      title: 'Disease Trends',
      description: 'Monitor disease patterns and health statistics',
      currentTrends: 'Current Disease Trends',
      loading: 'Loading disease trends...',
      error: 'Error loading disease trends',
      region: 'Filter by Region',
      category: 'Filter by Category',
      allRegions: 'All Regions',
      allCategories: 'All Categories',
      infectious: 'Infectious',
      chronic: 'Chronic',
      seasonal: 'Seasonal',
      emerging: 'Emerging',
      riskLevel: 'Risk Level',
      cases: 'Cases',
      trend: 'Trend',
      viewDetails: 'View Details',
      noData: 'No disease trend data available',
    },
    BN: {
      title: 'রোগের প্রবণতা',
      description: 'রোগের নকশা এবং স্বাস্থ্য পরিসংখ্যান মনিটর করুন',
      currentTrends: 'বর্তমান রোগের প্রবণতা',
      loading: 'রোগের প্রবণতা লোড হচ্ছে...',
      error: 'রোগের প্রবণতা লোড করতে ত্রুটি',
      region: 'অঞ্চল অনুযায়ী ফিল্টার',
      category: 'বিভাগ অনুযায়ী ফিল্টার',
      allRegions: 'সব অঞ্চল',
      allCategories: 'সব বিভাগ',
      infectious: 'সংক্রামক',
      chronic: 'দীর্ঘস্থায়ী',
      seasonal: 'মৌসুমি',
      emerging: 'নতুন',
      riskLevel: 'ঝুঁকির মাত্রা',
      cases: 'কেস',
      trend: 'প্রবণতা',
      viewDetails: 'বিস্তারিত দেখুন',
      noData: 'কোন রোগের প্রবণতার ডেটা নেই',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const loadDiseaseTrends = async () => {
      try {
        setLoading(true);
        setError('');

        const request: TrendAnalysisRequest = {};
        
        if (selectedRegion) {
          request.region = { division: selectedRegion };
        }
        
        if (selectedCategory) {
          request.category = selectedCategory as any;
        }

        const response = await DiseaseTrendsService.getDiseaseTrends(request);
        
        if (response.success) {
          setTrends(response.data.trends);
        } else {
          setError(response.message || t.error);
        }
      } catch (err: any) {
        setError(err.message || t.error);
        console.error('Error loading disease trends:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDiseaseTrends();
  }, [selectedRegion, selectedCategory, language]);

  const getRiskLevelColor = (riskLevel: string) => {
    return DiseaseTrendsService.getRiskLevelColor(riskLevel as any);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-orange-600 text-2xl">📈</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.region}
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">{t.allRegions}</option>
              <option value="Dhaka">{language === 'EN' ? 'Dhaka' : 'ঢাকা'}</option>
              <option value="Chittagong">{language === 'EN' ? 'Chittagong' : 'চট্টগ্রাম'}</option>
              <option value="Sylhet">{language === 'EN' ? 'Sylhet' : 'সিলেট'}</option>
              <option value="Rajshahi">{language === 'EN' ? 'Rajshahi' : 'রাজশাহী'}</option>
              <option value="Khulna">{language === 'EN' ? 'Khulna' : 'খুলনা'}</option>
              <option value="Barisal">{language === 'EN' ? 'Barisal' : 'বরিশাল'}</option>
              <option value="Rangpur">{language === 'EN' ? 'Rangpur' : 'রংপুর'}</option>
              <option value="Mymensingh">{language === 'EN' ? 'Mymensingh' : 'ময়মনসিংহ'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.category}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">{t.allCategories}</option>
              <option value="INFECTIOUS">{t.infectious}</option>
              <option value="CHRONIC">{t.chronic}</option>
              <option value="SEASONAL">{t.seasonal}</option>
              <option value="EMERGING">{t.emerging}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Trends List */}
      {!loading && !error && (
        <div className="space-y-4">
          {trends.length > 0 ? (
            trends.map((trend) => (
              <div key={trend.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{trend.diseaseName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(trend.riskLevel)}`}>
                        {trend.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {trend.region.division} Division • {trend.region.district} District
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatNumber(trend.statistics.totalCases)} {t.cases}</span>
                      <span>{DiseaseTrendsService.getTrendDirection(trend.trends).text}</span>
                      <span>Incidence: {DiseaseTrendsService.formatIncidenceRate(trend.statistics.incidenceRate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(`disease-trend-${trend.id}`)}
                    className="px-4 py-2 text-orange-600 hover:text-orange-800 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    {t.viewDetails}
                  </button>
                </div>

                {/* Trend Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t.trend}</span>
                    <span className={`font-medium ${DiseaseTrendsService.getTrendDirection(trend.trends).color}`}>
                      {DiseaseTrendsService.getTrendDirection(trend.trends).icon} {trend.trends.changePercentage > 0 ? '+' : ''}{trend.trends.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        trend.trends.direction === 'INCREASING' ? 'bg-red-500' :
                        trend.trends.direction === 'DECREASING' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(trend.trends.changePercentage), 100)}%`,
                        marginLeft: trend.trends.direction === 'INCREASING' ? '0' : 'auto'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">{t.noData}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
