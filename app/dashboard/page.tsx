"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import AuthService from '../services/auth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import SymptomChecker from '../components/health/SymptomChecker';
import EmergencyCenter from '../components/health/EmergencyCenter';
import VoiceAssistant from '../components/health/VoiceAssistant';
import EducationCenter from '../components/health/EducationCenter';
import ResourcesFinder from '../components/health/ResourcesFinder';
import DiseaseTrends from '../components/health/DiseaseTrends';
import UserProfile from '../components/profile/UserProfile';

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (!state.isAuthenticated) {
      router.push('/auth');
      return;
    }
    setIsLoading(false);
  }, [state.isAuthenticated, router]);

  // Handle logout
  const handleLogout = () => {
    AuthService.logout();
  };

  // Navigation items with multi-language support
  const navigationItems = {
    EN: [
      { id: 'overview', label: 'Overview', icon: '📊', component: DashboardOverview },
      { id: 'symptom-check', label: 'Symptom Checker', icon: '🩺', component: SymptomChecker },
      { id: 'emergency', label: 'Emergency Center', icon: '🚨', component: EmergencyCenter },
      { id: 'voice', label: 'Voice Assistant', icon: '🎤', component: VoiceAssistant },
      { id: 'education', label: 'Health Education', icon: '📚', component: EducationCenter },
      { id: 'resources', label: 'Medical Resources', icon: '🏥', component: ResourcesFinder },
      { id: 'trends', label: 'Disease Trends', icon: '📈', component: DiseaseTrends },
      { id: 'profile', label: 'Profile', icon: '👤', component: UserProfile },
    ],
    BN: [
      { id: 'overview', label: 'সারসংক্ষেপ', icon: '📊', component: DashboardOverview },
      { id: 'symptom-check', label: 'লক্ষণ পরীক্ষক', icon: '🩺', component: SymptomChecker },
      { id: 'emergency', label: 'জরুরি কেন্দ্র', icon: '🚨', component: EmergencyCenter },
      { id: 'voice', label: 'ভয়েস সহায়তা', icon: '🎤', component: VoiceAssistant },
      { id: 'education', label: 'স্বাস্থ্য শিক্ষা', icon: '📚', component: EducationCenter },
      { id: 'resources', label: 'চিকিৎসা সম্পদ', icon: '🏥', component: ResourcesFinder },
      { id: 'trends', label: 'রোগের প্রবণতা', icon: '📈', component: DiseaseTrends },
      { id: 'profile', label: 'প্রোফাইল', icon: '👤', component: UserProfile },
    ],
  };

  const currentNavigation = navigationItems[language];
  const currentItem = currentNavigation.find(item => item.id === currentView);
  const CurrentComponent = currentItem?.component || DashboardOverview;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      language={language}
      onLanguageChange={setLanguage}
      user={state.user}
      onLogout={handleLogout}
    >
      <CurrentComponent
        language={language}
        user={state.user}
        onNavigate={setCurrentView}
      />
    </DashboardLayout>
  );
}