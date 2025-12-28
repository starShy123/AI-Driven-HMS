"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, initializeAuth } from '@/app/providers';
import LoginForm from '@/app/components/auth/LoginForm';
import RegisterForm from '@/app/components/auth/RegisterForm';

export default function AuthPage() {
  const router = useRouter();
  const { state } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');

  // Initialize auth state on mount
  useEffect(() => {
    const initialAuth = initializeAuth();
    // If user is already authenticated, redirect to dashboard
    if (initialAuth.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [state.isAuthenticated, router]);

  const texts = {
    EN: {
      toggleLanguage: 'বাংলা',
      appName: 'ShasthoBondhu AI',
      appDescription: 'AI-powered healthcare access platform for rural & hill tract communities',
      features: [
        'AI Symptom Checker',
        'Emergency Detection',
        'Voice-Based Assistance',
        'Health Education',
        'Medical Resource Finder',
      ],
      footer: '© 2024 ShasthoBondhu AI. All rights reserved.',
    },
    BN: {
      toggleLanguage: 'English',
      appName: 'ShasthoBondhu AI',
      appDescription: 'গ্রামীণ ও পাহাড়ি এলাকার জন্য AI-চালিত স্বাস্থ্যসেবা প্ল্যাটফর্ম',
      features: [
        'AI লক্ষণ পরীক্ষক',
        'জরুরি অবস্থা সনাক্তকরণ',
        'ভয়েস-ভিত্তিক সহায়তা',
        'স্বাস্থ্য শিক্ষা',
        'চিকিৎসা সম্পদ অনুসন্ধান',
      ],
      footer: '© ২০২৪ ShasthoBondhu AI। সকল অধিকার সংরক্ষিত।',
    },
  };

  const t = texts[language];

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'BN' : 'EN');
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.appName}</h1>
              <p className="text-sm text-gray-600">{t.appDescription}</p>
            </div>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            {t.toggleLanguage}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-md text-center lg:text-left">
            {/* Hero Content */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {language === 'EN' ? 'Healthcare Made Accessible' : 'স্বাস্থ্যসেবা সহজলভ্য'}
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                {language === 'EN' 
                  ? 'Access quality healthcare services powered by AI, designed specifically for rural and hill tract communities.'
                  : 'গ্রামীণ ও পাহাড়ি এলাকার জন্য বিশেষভাবে ডিজাইন করা AI-চালিত স্বাস্থ্যসেবা অ্যাক্সেস করুন।'
                }
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {t.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">
                  {language === 'EN' ? 'Available' : 'উপলব্ধ'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">AI</div>
                <div className="text-sm text-gray-600">
                  {language === 'EN' ? 'Powered' : 'চালিত'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">100K+</div>
                <div className="text-sm text-gray-600">
                  {language === 'EN' ? 'Users' : 'ব্যবহারকারী'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg">
            {authMode === 'login' ? (
              <LoginForm 
                onToggleMode={toggleAuthMode} 
                language={language}
              />
            ) : (
              <RegisterForm 
                onToggleMode={toggleAuthMode} 
                language={language}
              />
            )}
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center p-6 text-sm text-gray-500">
        {t.footer}
      </footer>

    </div>
  );
}