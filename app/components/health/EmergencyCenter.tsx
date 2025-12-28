"use client";

import React from 'react';
import { User } from '@/app/services/auth';

interface EmergencyCenterProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function EmergencyCenter({ language, user, onNavigate }: EmergencyCenterProps) {
  const texts = {
    EN: {
      title: 'Emergency Center',
      description: 'Quick access to emergency services and contacts',
      emergencyNumbers: 'Emergency Numbers',
      ambulance: 'Ambulance: 102',
      police: 'Police: 100',
      fireService: 'Fire Service: 102',
      locateHospital: 'Find Nearest Hospital',
      emergencyGuide: 'Emergency First Aid Guide',
    },
    BN: {
      title: 'জরুরি কেন্দ্র',
      description: 'জরুরি সেবা এবং যোগাযোগের দ্রুত অ্যাক্সেস',
      emergencyNumbers: 'জরুরি নম্বর',
      ambulance: 'এম্বুলেন্স: ১০২',
      police: 'পুলিশ: ১০০',
      fireService: 'ফায়ার সার্ভিস: ১০২',
      locateHospital: 'নিকটস্থ হাসপাতাল খুঁজুন',
      emergencyGuide: 'জরুরি প্রাথমিক চিকিৎসা গাইড',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">🚨</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.emergencyNumbers}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <span className="font-medium text-red-900">{t.ambulance}</span>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Call</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="font-medium text-blue-900">{t.police}</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Call</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <span className="font-medium text-orange-900">{t.fireService}</span>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Call</button>
          </div>
        </div>
      </div>
    </div>
  );
}