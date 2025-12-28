"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/app/services/auth';
import EducationService, { HealthEducationContent, EducationRequest } from '@/app/services/education';

interface EducationCenterProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function EducationCenter({ language, user, onNavigate }: EducationCenterProps) {
  const [content, setContent] = useState<HealthEducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const texts = {
    EN: {
      title: 'Health Education',
      description: 'Learn about health and wellness topics',
      categories: 'Health Categories',
      loading: 'Loading health education content...',
      error: 'Error loading content',
      searchPlaceholder: 'Search health topics...',
      filterByType: 'Filter by Category',
      allTypes: 'All Categories',
      healthEducation: 'Health Education',
      diseasePrevention: 'Disease Prevention',
      maternalHealth: 'Maternal Health',
      nutrition: 'Nutrition',
      seasonalHealth: 'Seasonal Health',
      emergencyCare: 'Emergency Care',
      viewContent: 'View Content',
      readingTime: 'min read',
      views: 'views',
      likes: 'likes',
      shares: 'shares',
      noContent: 'No health education content available',
    },
    BN: {
      title: 'স্বাস্থ্য শিক্ষা',
      description: 'স্বাস্থ্য ও সুস্থতার বিষয়ে জানুন',
      categories: 'স্বাস্থ্য বিভাগ',
      loading: 'স্বাস্থ্য শিক্ষার কন্টেন্ট লোড হচ্ছে...',
      error: 'কন্টেন্ট লোড করতে ত্রুটি',
      searchPlaceholder: 'স্বাস্থ্য বিষয় খুঁজুন...',
      filterByType: 'বিভাগ অনুযায়ী ফিল্টার',
      allTypes: 'সব বিভাগ',
      healthEducation: 'স্বাস্থ্য শিক্ষা',
      diseasePrevention: 'রোগ প্রতিরোধ',
      maternalHealth: 'মাতৃস্বাস্থ্য',
      nutrition: 'পুষ্টি',
      seasonalHealth: 'মৌসুমি স্বাস্থ্য',
      emergencyCare: 'জরুরি সেবা',
      viewContent: 'কন্টেন্ট দেখুন',
      readingTime: 'মিনিট পড়ুন',
      views: 'দেখেছে',
      likes: 'পছন্দ',
      shares: 'শেয়ার',
      noContent: 'কোন স্বাস্থ্য শিক্ষার কন্টেন্ট নেই',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const loadEducationContent = async () => {
      try {
        setLoading(true);
        setError('');

        const request: EducationRequest = {
          language,
          page: 1,
          limit: 20,
        };

        if (selectedType) {
          request.type = selectedType as any;
        }

        if (searchQuery.trim()) {
          request.search = searchQuery.trim();
        }

        const response = await EducationService.getEducationContent(request);
        
        if (response.success) {
          setContent(response.data.content);
        } else {
          setError(response.message || t.error);
        }
      } catch (err: any) {
        setError(err.message || t.error);
        console.error('Error loading education content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEducationContent();
  }, [selectedType, searchQuery, language]);

  const getContentTypeInfo = (type: HealthEducationContent['type']) => {
    return EducationService.getContentTypeInfo(type, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'EN' ? 'en-US' : 'bn-BD');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">📚</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">{t.allTypes}</option>
              <option value="HEALTH_EDUCATION">{t.healthEducation}</option>
              <option value="DISEASE_PREVENTION">{t.diseasePrevention}</option>
              <option value="MATERNAL_HEALTH">{t.maternalHealth}</option>
              <option value="NUTRITION">{t.nutrition}</option>
              <option value="SEASONAL_HEALTH">{t.seasonalHealth}</option>
              <option value="EMERGENCY_CARE">{t.emergencyCare}</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {['HEALTH_EDUCATION', 'DISEASE_PREVENTION', 'MATERNAL_HEALTH', 'NUTRITION', 'SEASONAL_HEALTH', 'EMERGENCY_CARE'].map((type) => {
            const typeInfo = getContentTypeInfo(type as any);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? '' : type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {typeInfo.icon} {typeInfo.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
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

      {/* Content Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.length > 0 ? (
            content.map((item) => {
              const typeInfo = getContentTypeInfo(item.type);
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeInfo.icon}</span>
                      <span className="text-sm text-gray-600">{typeInfo.name}</span>
                    </div>
                    {item.isAIGenerated && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        AI Generated
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{EducationService.getExcerpt(item.content, 120)}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{EducationService.calculateReadingTime(item.content)} {t.readingTime}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>{item.views} {t.views}</span>
                      <span>{item.likes} {t.likes}</span>
                      <span>{item.shares} {t.shares}</span>
                    </div>
                    <button
                      onClick={() => onNavigate(`education-${item.id}`)}
                      className="px-3 py-1 text-green-600 hover:text-green-800 border border-green-200 rounded hover:bg-green-50 transition-colors"
                    >
                      {t.viewContent}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">{t.noContent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
