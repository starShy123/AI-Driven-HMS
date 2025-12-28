"use client";

import React from 'react';
import { User } from '@/app/services/auth';

interface UserProfileProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function UserProfile({ language, user }: UserProfileProps) {
  const texts = {
    EN: {
      title: 'Profile',
      description: 'Manage your account and health information',
      personalInfo: 'Personal Information',
      healthInfo: 'Health Information',
      editProfile: 'Edit Profile',
    },
    BN: {
      title: 'প্রোফাইল',
      description: 'আপনার অ্যাকাউন্ট এবং স্বাস্থ্য তথ্য পরিচালনা করুন',
      personalInfo: 'ব্যক্তিগত তথ্য',
      healthInfo: 'স্বাস্থ্য তথ্য',
      editProfile: 'প্রোফাইল সম্পাদনা',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.personalInfo}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <p className="font-medium">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.healthInfo}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Medical History</label>
              <p className="font-medium">No records</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Allergies</label>
              <p className="font-medium">None reported</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Current Medications</label>
              <p className="font-medium">None</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {t.editProfile}
        </button>
      </div>
    </div>
  );
}