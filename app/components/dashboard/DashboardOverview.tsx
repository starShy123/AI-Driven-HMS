"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/app/services/auth';
import { UsersService } from '@/app/services/users';
import ConsultationService from '@/app/services/consultations';

interface DashboardOverviewProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function DashboardOverview({ language, user, onNavigate }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalConsultations: 0,
    emergencyAlerts: 0,
    unreadNotifications: 0,
    healthScore: 85,
    recommendations: [] as string[],
  });
  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'consultation',
      title: 'Symptom Check Completed',
      description: 'Headache analysis - Low priority',
      timestamp: '2 hours ago',
      icon: '🩺',
    },
    {
      id: '2',
      type: 'education',
      title: 'Health Education Read',
      description: 'Prevention of common diseases',
      timestamp: '1 day ago',
      icon: '📚',
    },
    {
      id: '3',
      type: 'resource',
      title: 'Medical Resource Found',
      description: 'Nearest hospital identified',
      timestamp: '2 days ago',
      icon: '🏥',
    },
  ]);

  const texts = {
    EN: {
      welcome: 'Welcome back',
      subtitle: 'Your health dashboard overview',
      quickActions: 'Quick Actions',
      checkSymptoms: 'Check Symptoms',
      findResources: 'Find Resources',
      emergencyGuide: 'Emergency Guide',
      healthTips: 'Get Health Tips',
      stats: 'Your Health Stats',
      totalConsultations: 'Total Consultations',
      emergencyAlerts: 'Emergency Alerts',
      unreadNotifications: 'Unread Notifications',
      healthScore: 'Health Score',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      recommendations: 'Recommendations',
      getStarted: 'Get Started',
      emergencyContact: 'Emergency Contact: 102',
      healthTip: 'Daily Health Tip',
    },
    BN: {
      welcome: 'স্বাগতম',
      subtitle: 'আপনার স্বাস্থ্য ড্যাশবোর্ড সারসংক্ষেপ',
      quickActions: 'দ্রুত কার্যক্রম',
      checkSymptoms: 'লক্ষণ পরীক্ষা',
      findResources: 'সম্পদ খুঁজুন',
      emergencyGuide: 'জরুরি গাইড',
      healthTips: 'স্বাস্থ্য পরামর্শ',
      stats: 'আপনার স্বাস্থ্য পরিসংখ্যান',
      totalConsultations: 'মোট পরামর্শ',
      emergencyAlerts: 'জরুরি সতর্কতা',
      unreadNotifications: 'অপঠিত বিজ্ঞপ্তি',
      healthScore: 'স্বাস্থ্য স্কোর',
      recentActivity: 'সাম্প্রতিক কার্যকলাপ',
      viewAll: 'সব দেখুন',
      recommendations: 'সুপারিশ',
      getStarted: 'শুরু করুন',
      emergencyContact: 'জরুরি যোগাযোগ: ১০২',
      healthTip: 'দৈনিক স্বাস্থ্য পরামর্শ',
    },
  };

  const t = texts[language];

  useEffect(() => {
    // Simulate loading dashboard stats
    const loadDashboardStats = async () => {
      try {
        // In a real app, this would be an API call
        setStats({
          totalConsultations: 12,
          emergencyAlerts: 0,
          unreadNotifications: 3,
          healthScore: 85,
          recommendations: [
            language === 'EN' 
              ? 'Stay hydrated by drinking 8 glasses of water daily'
              : 'প্রতিদিন ৮ গ্লাস পানি পান করে হাইড্রেটেড থাকুন',
            language === 'EN'
              ? 'Take a 10-minute walk after meals'
              : 'খাবারের পর ১০ মিনিট হাঁটুন',
          ],
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    loadDashboardStats();
  }, [language]);

  const quickActions = [
    {
      id: 'symptom-check',
      title: t.checkSymptoms,
      description: language === 'EN' 
        ? 'AI-powered symptom analysis'
        : 'AI-চালিত লক্ষণ বিশ্লেষণ',
      icon: '🩺',
      color: 'bg-blue-500',
      action: () => onNavigate('symptom-check'),
    },
    {
      id: 'resources',
      title: t.findResources,
      description: language === 'EN'
        ? 'Find nearby hospitals and clinics'
        : 'কাছের হাসপাতাল ও ক্লিনিক খুঁজুন',
      icon: '🏥',
      color: 'bg-green-500',
      action: () => onNavigate('resources'),
    },
    {
      id: 'emergency',
      title: t.emergencyGuide,
      description: language === 'EN'
        ? 'Emergency assistance and contacts'
        : 'জরুরি সহায়তা ও যোগাযোগ',
      icon: '🚨',
      color: 'bg-red-500',
      action: () => onNavigate('emergency'),
    },
    {
      id: 'education',
      title: t.healthTips,
      description: language === 'EN'
        ? 'Learn about health and wellness'
        : 'স্বাস্থ্য ও সুস্থতা সম্পর্কে জানুন',
      icon: '📚',
      color: 'bg-purple-500',
      action: () => onNavigate('education'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {t.welcome}, {user.firstName}!
            </h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.quickActions}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                  <span className="text-lg">{action.icon}</span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.stats}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalConsultations}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🩺</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.emergencyAlerts}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.emergencyAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.unreadNotifications}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🔔</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.healthScore}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.healthScore}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">💚</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t.recentActivity}</h2>
            <button
              onClick={() => onNavigate('overview')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.recommendations}</h2>
          <div className="space-y-4">
            {stats.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>

          {/* Health Tip */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">{t.healthTip}</h3>
                <p className="text-sm text-blue-700">
                  {language === 'EN'
                    ? 'Regular handwashing can reduce the risk of respiratory infections by 16-21%.'
                    : 'নিয়মিত হাত ধোয়া শ্বাসনালীর সংক্রমণের ঝুঁকি ১৬-২১% কমাতে পারে।'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">{t.emergencyContact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}