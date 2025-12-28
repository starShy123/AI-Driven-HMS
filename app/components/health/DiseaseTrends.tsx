"use client";

import React from 'react';
import { User } from '@/app/services/auth';

interface DiseaseTrendsProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function DiseaseTrends({ language }: DiseaseTrendsProps) {
  const texts = {
    EN: {
      title: 'Disease Trends',
      description: 'Monitor disease patterns and health statistics',
      currentTrends: 'Current Disease Trends',
    },
    BN: {
      title: 'রোগের প্রবণতা',
      description: 'রোগের নকশা এবং স্বাস্থ্য পরিসংখ্যান মনিটর করুন',
      currentTrends: 'বর্তমান রোগের প্রবণতা',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-orange-600 text-2xl">📈</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      <p className="text-lg text-gray-600">{t.description}</p>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">{t.currentTrends}</h3>
        <div className="text-sm text-gray-600">
          Disease trend data will be displayed here
        </div>
      </div>
    </div>
  );
}