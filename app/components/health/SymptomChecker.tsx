"use client";

import React, { useState } from 'react';
import { User } from '@/app/services/auth';
import ConsultationService, { SymptomCheckRequest, SymptomCheckResponse } from '@/app/services/consultations';

interface SymptomCheckerProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function SymptomChecker({ language, user, onNavigate }: SymptomCheckerProps) {
  const [formData, setFormData] = useState<SymptomCheckRequest>({
    symptoms: '',
    language: language,
    consultationLocation: 'Home',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomCheckResponse['data'] | null>(null);
  const [error, setError] = useState<string>('');

  const texts = {
    EN: {
      title: 'AI Symptom Checker',
      subtitle: 'Describe your symptoms for AI-powered analysis',
      description: 'Our AI will analyze your symptoms and provide recommendations. This is not a substitute for professional medical advice.',
      symptoms: 'Describe Your Symptoms',
      symptomsPlaceholder: 'Please describe your symptoms in detail. For example: "I have been experiencing a headache for 2 days along with fever and nausea"',
      language: 'Preferred Language',
      english: 'English',
      bangla: 'Bangla',
      location: 'Current Location',
      home: 'Home',
      work: 'Work',
      other: 'Other',
      analyzeSymptoms: 'Analyze Symptoms',
      analyzing: 'Analyzing Symptoms...',
      result: 'Analysis Results',
      possibleConditions: 'Possible Conditions',
      urgencyLevel: 'Urgency Level',
      recommendations: 'Recommendations',
      riskScore: 'Risk Score',
      emergencyFlags: 'Emergency Flags',
      viewEmergencyGuide: 'View Emergency Guide',
      newAnalysis: 'New Analysis',
      disclaimer: 'Disclaimer: This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.',
      error: 'Error analyzing symptoms. Please try again.',
    },
    BN: {
      title: 'AI লক্ষণ পরীক্ষক',
      subtitle: 'AI-চালিত বিশ্লেষণের জন্য আপনার লক্ষণগুলো বর্ণনা করুন',
      description: 'আমাদের AI আপনার লক্ষণগুলো বিশ্লেষণ করবে এবং সুপারিশ প্রদান করবে। এটি পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়।',
      symptoms: 'আপনার লক্ষণগুলো বর্ণনা করুন',
      symptomsPlaceholder: 'অনুগ্রহ করে আপনার লক্ষণগুলো বিস্তারিতভাবে বর্ণনা করুন। উদাহরণ: "আমার ২ দিন ধরে জ্বর এবং বমির সাথে মাথাব্যথা হচ্ছে"',
      language: 'পছন্দের ভাষা',
      english: 'ইংরেজি',
      bangla: 'বাংলা',
      location: 'বর্তমান অবস্থান',
      home: 'বাড়ি',
      work: 'কাজ',
      other: 'অন্যান্য',
      analyzeSymptoms: 'লক্ষণ বিশ্লেষণ করুন',
      analyzing: 'লক্ষণ বিশ্লেষণ হচ্ছে...',
      result: 'বিশ্লেষণের ফলাফল',
      possibleConditions: 'সম্ভাব্য অবস্থা',
      urgencyLevel: 'জরুরিতার মাত্রা',
      recommendations: 'সুপারিশ',
      riskScore: 'ঝুঁকির স্কোর',
      emergencyFlags: 'জরুরি সতর্কতা',
      viewEmergencyGuide: 'জরুরি গাইড দেখুন',
      newAnalysis: 'নতুন বিশ্লেষণ',
      disclaimer: 'দায়মুক্তি: এই AI বিশ্লেষণ শুধুমাত্র তথ্যমূলক উদ্দেশ্যে এবং পেশাদার চিকিৎসা পরামর্শের বিকল্প হওয়া উচিত নয়। সঠিক নির্ণয় এবং চিকিৎসার জন্য অনুগ্রহ করে একজন স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।',
      error: 'লক্ষণ বিশ্লেষণে ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symptoms.trim()) {
      setError(language === 'EN' ? 'Please describe your symptoms' : 'অনুগ্রহ করে আপনার লক্ষণগুলো বর্ণনা করুন');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const response = await ConsultationService.checkSymptoms(formData);
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (field: keyof SymptomCheckRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const resetAnalysis = () => {
    setResult(null);
    setError('');
    setFormData({
      symptoms: '',
      language: language,
      consultationLocation: 'Home',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600 mb-2">{t.subtitle}</p>
        <p className="text-sm text-gray-500">{t.description}</p>
      </div>

      {/* Analysis Form */}
      {!result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.symptoms}
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder={t.symptomsPlaceholder}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isAnalyzing}
              />
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.language}
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value as 'EN' | 'BN')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isAnalyzing}
                >
                  <option value="EN">{t.english}</option>
                  <option value="BN">{t.bangla}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.location}
                </label>
                <select
                  value={formData.consultationLocation}
                  onChange={(e) => handleInputChange('consultationLocation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isAnalyzing}
                >
                  <option value="Home">{t.home}</option>
                  <option value="Work">{t.work}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing || !formData.symptoms.trim()}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                isAnalyzing || !formData.symptoms.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isAnalyzing ? t.analyzing : t.analyzeSymptoms}
            </button>
          </form>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Result Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{t.result}</h2>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {t.newAnalysis}
              </button>
            </div>

            {/* Urgency Level */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
              ConsultationService.getUrgencyColor(result.analysis.urgencyLevel)
            }`}>
              <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
              {ConsultationService.getUrgencyText(result.analysis.urgencyLevel, language)}
            </div>
          </div>

          {/* Main Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Possible Conditions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.possibleConditions}
              </h3>
              <div className="space-y-2">
                {result.analysis.possibleConditions.map((condition, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Score */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {t.riskScore}
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {result.analysis.riskScore}/10
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      result.analysis.riskScore >= 7 ? 'bg-red-500' :
                      result.analysis.riskScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${result.analysis.riskScore * 10}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {ConsultationService.formatRiskScore(result.analysis.riskScore).level}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.recommendations}
            </h3>
            <div className="space-y-3">
              {result.analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Flags */}
          {result.analysis.emergencyFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {t.emergencyFlags}
              </h3>
              <div className="mb-4">
                <p className="text-red-800 font-medium mb-2">
                  {language === 'EN' 
                    ? 'Emergency symptoms detected! Please seek immediate medical attention.'
                    : 'জরুরি লক্ষণ সনাক্ত হয়েছে! অনুগ্রহ করে অবিলম্বে চিকিৎসা সেবা নিন।'
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.emergencyFlags.map((flag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onNavigate('emergency')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {t.viewEmergencyGuide}
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">{t.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.analyzing}</h3>
              <p className="text-sm text-gray-600">
                {language === 'EN'
                  ? 'Our AI is analyzing your symptoms. This may take a few moments.'
                  : 'আমাদের AI আপনার লক্ষণগুলো বিশ্লেষণ করছে। এতে কিছু সময় লাগতে পারে।'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}