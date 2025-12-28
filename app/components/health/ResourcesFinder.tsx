"use client";

import React from 'react';
import { User } from '@/app/services/auth';

interface ResourcesFinderProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function ResourcesFinder({ language }: ResourcesFinderProps) {
  const texts = {
    EN: {
      title: 'Medical Resources',
      description: 'Find nearby hospitals, clinics, and pharmacies',
      searchLocation: 'Search by location',
      hospitals: 'Hospitals',
      clinics: 'Clinics',
      pharmacies: 'Pharmacies',
      emergency: 'Emergency Services',
    },
    BN: {
      title: 'চিকিৎসা সম্পদ',
      description: 'কাছের হাসপাতাল, ক্লিনিক এবং ফার্মেসি খুঁজুন',
      searchLocation: 'অবস্থান দিয়ে অনুসন্ধান',
      hospitals: 'হাসপাতাল',
      clinics: 'ক্লিনিক',
      pharmacies: 'ফার্মেসি',
      emergency: 'জরুরি সেবা',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 text-2xl">🏥</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      <div className="max-w-md mx-auto">
        <input 
          type="text" 
          placeholder={t.searchLocation}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl">🏥</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t.hospitals}</h3>
          <p className="text-sm text-gray-600">Find nearby hospitals</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-600 text-xl">🏥</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t.clinics}</h3>
          <p className="text-sm text-gray-600">Local clinics and health centers</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 text-xl">💊</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t.pharmacies}</h3>
          <p className="text-sm text-gray-600">Medicine and drug stores</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-orange-600 text-xl">🚨</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t.emergency}</h3>
          <p className="text-sm text-gray-600">24/7 emergency services</p>
        </div>
      </div>
    </div>
  );
}