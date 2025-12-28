"use client";

import React from 'react';
import { User } from '@/app/services/auth';

interface EducationCenterProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function EducationCenter({ language }: EducationCenterProps) {
  const texts = {
    EN: {
      title: 'Health Education',
      description: 'Learn about health and wellness topics',
      categories: 'Health Categories',
    },
    BN: {
      title: 'স্বাস্থ্য শিক্ষা',
      description: 'স্বাস্থ্য ও সুস্থতার বিষয়ে জানুন',
      categories: 'স্বাস্থ্য বিভাগ',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-green-600 text-2xl">📚</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      <p className="text-lg text-gray-600">{t.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border">Prevention</div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">Nutrition</div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">Mental Health</div>
      </div>
    </div>
  );
}