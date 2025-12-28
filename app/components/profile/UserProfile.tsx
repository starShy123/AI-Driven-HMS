"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/app/services/auth';
import UsersService, { type UserProfile } from '@/app/services/users';

interface UserProfileProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function UserProfile({ language, user, onNavigate }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editing, setEditing] = useState(false);

  const texts = {
    EN: {
      title: 'Profile',
      description: 'Manage your account and health information',
      personalInfo: 'Personal Information',
      healthInfo: 'Health Information',
      locationInfo: 'Location Information',
      emergencyContacts: 'Emergency Contacts',
      preferences: 'Preferences',
      statistics: 'Account Statistics',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Profile',
      cancelEdit: 'Cancel',
      loading: 'Loading profile...',
      error: 'Error loading profile',
      noData: 'No data available',
      phone: 'Phone',
      dateOfBirth: 'Date of Birth',
      age: 'Age',
      gender: 'Gender',
      role: 'Role',
      village: 'Village',
      upazila: 'Upazila',
      district: 'District',
      division: 'Division',
      medicalHistory: 'Medical History',
      allergies: 'Allergies',
      currentMedications: 'Current Medications',
      totalConsultations: 'Total Consultations',
      emergencyAlerts: 'Emergency Alerts',
      voiceInteractions: 'Voice Interactions',
      educationContentRead: 'Education Content Read',
      lastLogin: 'Last Login',
      accountCreated: 'Account Created',
      notifications: 'Notifications',
      language: 'Language',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications',
      privacy: 'Privacy Settings',
      shareDataForResearch: 'Share Data for Research',
      allowLocationTracking: 'Allow Location Tracking',
    },
    BN: {
      title: 'প্রোফাইল',
      description: 'আপনার অ্যাকাউন্ট এবং স্বাস্থ্য তথ্য পরিচালনা করুন',
      personalInfo: 'ব্যক্তিগত তথ্য',
      healthInfo: 'স্বাস্থ্য তথ্য',
      locationInfo: 'অবস্থানের তথ্য',
      emergencyContacts: 'জরুরি যোগাযোগ',
      preferences: 'পছন্দসমূহ',
      statistics: 'অ্যাকাউন্ট পরিসংখ্যান',
      editProfile: 'প্রোফাইল সম্পাদনা',
      saveProfile: 'প্রোফাইল সংরক্ষণ',
      cancelEdit: 'বাতিল',
      loading: 'প্রোফাইল লোড হচ্ছে...',
      error: 'প্রোফাইল লোড করতে ত্রুটি',
      noData: 'কোন তথ্য নেই',
      phone: 'ফোন',
      dateOfBirth: 'জন্ম তারিখ',
      age: 'বয়স',
      gender: 'লিঙ্গ',
      role: 'ভূমিকা',
      village: 'গ্রাম',
      upazila: 'উপজেলা',
      district: 'জেলা',
      division: 'বিভাগ',
      medicalHistory: 'চিকিৎসার ইতিহাস',
      allergies: 'অ্যালার্জি',
      currentMedications: 'বর্তমান ওষুধ',
      totalConsultations: 'মোট পরামর্শ',
      emergencyAlerts: 'জরুরি সতর্কতা',
      voiceInteractions: 'ভয়েস ইন্টারঅ্যাকশন',
      educationContentRead: 'পড়া শিক্ষামূলক কন্টেন্ট',
      lastLogin: 'শেষ লগইন',
      accountCreated: 'অ্যাকাউন্ট তৈরির তারিখ',
      notifications: 'বিজ্ঞপ্তি',
      language: 'ভাষা',
      emailNotifications: 'ইমেইল বিজ্ঞপ্তি',
      smsNotifications: 'SMS বিজ্ঞপ্তি',
      pushNotifications: 'পুশ বিজ্ঞপ্তি',
      privacy: 'গোপনীয়তা সেটিংস',
      shareDataForResearch: 'গবেষণার জন্য ডেটা শেয়ার করুন',
      allowLocationTracking: 'অবস্থান ট্র্যাকিংয়ের অনুমতি দিন',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await UsersService.getCurrentProfile();
        
        if (response.success) {
          setProfile(response.data);
        } else {
          setError(response.message || t.error);
        }
      } catch (err: any) {
        setError(err.message || t.error);
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [language]);

  const getRoleInfo = (role: UserProfile['role']) => {
    return UsersService.getRoleInfo(role, language);
  };

  const getGenderInfo = (gender: UserProfile['gender']) => {
    return UsersService.getGenderInfo(gender, language);
  };

  const formatPhoneNumber = (phone: string) => {
    return UsersService.formatPhoneNumber(phone);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'EN' ? 'en-US' : 'bn-BD');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.noData}</p>
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile.role);
  const genderInfo = getGenderInfo(profile.gender);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-semibold">
            {profile.firstName[0]}{profile.lastName[0]}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
        <div className="mt-4 flex justify-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color} bg-opacity-10`}>
            {roleInfo.name}
          </span>
          {profile.isVerified && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-100">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setEditing(!editing)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editing ? t.cancelEdit : t.editProfile}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.personalInfo}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">{language === 'EN' ? 'Name' : 'নাম'}</label>
              <p className="font-medium">{profile.firstName} {profile.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{language === 'EN' ? 'Email' : 'ইমেইল'}</label>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.phone}</label>
              <p className="font-medium">{formatPhoneNumber(profile.phone)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.dateOfBirth}</label>
              <p className="font-medium">{formatDate(profile.dateOfBirth)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.age}</label>
              <p className="font-medium">{UsersService.calculateAge(profile.dateOfBirth)} {language === 'EN' ? 'years' : 'বছর'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.gender}</label>
              <div className="flex items-center space-x-2">
                <span>{genderInfo.icon}</span>
                <p className="font-medium">{genderInfo.name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.role}</label>
              <p className="font-medium">{roleInfo.name}</p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.locationInfo}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">{t.village}</label>
              <p className="font-medium">{profile.location.village || t.noData}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.upazila}</label>
              <p className="font-medium">{profile.location.upazila || t.noData}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.district}</label>
              <p className="font-medium">{profile.location.district || t.noData}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.division}</label>
              <p className="font-medium">{profile.location.division || t.noData}</p>
            </div>
            {profile.location.latitude && profile.location.longitude && (
              <div>
                <label className="text-sm text-gray-600">{language === 'EN' ? 'Coordinates' : 'স্থানাঙ্ক'}</label>
                <p className="font-medium">
                  {profile.location.latitude.toFixed(6)}, {profile.location.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Health Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.healthInfo}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">{t.medicalHistory}</label>
              <p className="font-medium">{profile.medicalHistory || t.noData}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.allergies}</label>
              <p className="font-medium">{profile.allergies || t.noData}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.currentMedications}</label>
              <p className="font-medium">{profile.currentMedications || t.noData}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.emergencyContacts}</h2>
          <div className="space-y-3">
            {profile.emergencyContacts && profile.emergencyContacts.length > 0 ? (
              profile.emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    {t.phone}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500">{t.noData}</p>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.statistics}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{profile.statistics.totalConsultations}</p>
              <p className="text-sm text-blue-800">{t.totalConsultations}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{profile.statistics.emergencyAlerts}</p>
              <p className="text-sm text-red-800">{t.emergencyAlerts}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{profile.statistics.voiceInteractions}</p>
              <p className="text-sm text-purple-800">{t.voiceInteractions}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{profile.statistics.educationContentRead}</p>
              <p className="text-sm text-green-800">{t.educationContentRead}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t.lastLogin}:</span>
              <span className="text-sm font-medium">{formatDate(profile.statistics.lastLogin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t.accountCreated}:</span>
              <span className="text-sm font-medium">{formatDate(profile.statistics.accountCreated)}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.preferences}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">{t.language}</label>
              <p className="font-medium">{profile.preferences.language === 'EN' ? 'English' : 'বাংলা'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.notifications}</label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.emailNotifications}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profile.preferences.notifications.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {profile.preferences.notifications.email ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.smsNotifications}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profile.preferences.notifications.sms ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {profile.preferences.notifications.sms ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.pushNotifications}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profile.preferences.notifications.push ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {profile.preferences.notifications.push ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t.privacy}</label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.shareDataForResearch}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profile.preferences.privacy.shareDataForResearch ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {profile.preferences.privacy.shareDataForResearch ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.allowLocationTracking}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${profile.preferences.privacy.allowLocationTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {profile.preferences.privacy.allowLocationTracking ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
