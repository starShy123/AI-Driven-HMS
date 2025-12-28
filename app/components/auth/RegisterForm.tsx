"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import AuthService, { RegisterRequest } from '@/app/services/auth';

interface RegisterFormProps {
  onToggleMode: () => void;
  language: 'EN' | 'BN';
}

export default function RegisterForm({ onToggleMode, language }: RegisterFormProps) {
  const router = useRouter();
  const { dispatch } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterRequest & { confirmPassword?: string }>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    village: '',
    upazila: '',
    district: '',
    division: '',
    latitude: 0,
    longitude: 0,
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterRequest & { confirmPassword?: string }>>({});
  const [showPassword, setShowPassword] = useState(false);

  const texts = {
    EN: {
      title: 'Create Account',
      subtitle: 'Join ShasthoBondhu AI for better healthcare access',
      // Step 1 - Personal Info
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      firstNamePlaceholder: 'Enter your first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Enter your last name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      genderMale: 'Male',
      genderFemale: 'Female',
      genderOther: 'Other',
      // Step 2 - Location
      locationInfo: 'Location Information',
      village: 'Village/Area',
      villagePlaceholder: 'Enter your village or area',
      upazila: 'Upazila',
      upazilaPlaceholder: 'Enter your upazila',
      district: 'District',
      districtPlaceholder: 'Enter your district',
      division: 'Division',
      divisionPlaceholder: 'Enter your division',
      // Step 3 - Medical Info
      medicalInfo: 'Medical Information',
      medicalHistory: 'Medical History',
      medicalHistoryPlaceholder: 'Enter your medical history (optional)',
      allergies: 'Allergies',
      allergiesPlaceholder: 'Enter your allergies (optional)',
      currentMedications: 'Current Medications',
      currentMedicationsPlaceholder: 'Enter current medications (optional)',
      // Step 4 - Security
      securityInfo: 'Security',
      password: 'Password',
      passwordPlaceholder: 'Create a strong password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      // Form Actions
      next: 'Next',
      back: 'Back',
      register: 'Create Account',
      registerLoading: 'Creating Account...',
      // Navigation
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign In',
      // Validation Messages
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Please enter a valid phone number',
      dateOfBirthRequired: 'Date of birth is required',
      genderRequired: 'Gender is required',
      villageRequired: 'Village/Area is required',
      upazilaRequired: 'Upazila is required',
      districtRequired: 'District is required',
      divisionRequired: 'Division is required',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordWeak: 'Password should contain uppercase, lowercase, and numbers',
      confirmPasswordRequired: 'Confirm password is required',
      passwordMismatch: 'Passwords do not match',
      registerSuccess: 'Account created successfully! Redirecting to login...',
      registerError: 'Registration failed. Please try again.',
      // Step Titles
      step1Title: 'Personal Details',
      step2Title: 'Location',
      step3Title: 'Medical Info',
      step4Title: 'Security',
    },
    BN: {
      title: 'অ্যাকাউন্ট তৈরি করুন',
      subtitle: 'উন্নত স্বাস্থ্যসেবার জন্য ShasthoBondhu AI এ যোগ দিন',
      // Step 1 - Personal Info
      personalInfo: 'ব্যক্তিগত তথ্য',
      firstName: 'নামের প্রথম অংশ',
      firstNamePlaceholder: 'আপনার নামের প্রথম অংশ দিন',
      lastName: 'নামের শেষ অংশ',
      lastNamePlaceholder: 'আপনার নামের শেষ অংশ দিন',
      email: 'ইমেইল ঠিকানা',
      emailPlaceholder: 'আপনার ইমেইল দিন',
      phone: 'ফোন নম্বর',
      phonePlaceholder: 'আপনার ফোন নম্বর দিন',
      dateOfBirth: 'জন্ম তারিখ',
      gender: 'লিঙ্গ',
      genderMale: 'পুরুষ',
      genderFemale: 'নারী',
      genderOther: 'অন্যান্য',
      // Step 2 - Location
      locationInfo: 'অবস্থানের তথ্য',
      village: 'গ্রাম/এলাকা',
      villagePlaceholder: 'আপনার গ্রাম বা এলাকা দিন',
      upazila: 'উপজেলা',
      upazilaPlaceholder: 'আপনার উপজেলা দিন',
      district: 'জেলা',
      districtPlaceholder: 'আপনার জেলা দিন',
      division: 'বিভাগ',
      divisionPlaceholder: 'আপনার বিভাগ দিন',
      // Step 3 - Medical Info
      medicalInfo: 'চিকিৎসা তথ্য',
      medicalHistory: 'চিকিৎসা ইতিহাস',
      medicalHistoryPlaceholder: 'আপনার চিকিৎসা ইতিহাস দিন (ঐচ্ছিক)',
      allergies: 'অ্যালার্জি',
      allergiesPlaceholder: 'আপনার অ্যালার্জি দিন (ঐচ্ছিক)',
      currentMedications: 'বর্তমান ওষুধ',
      currentMedicationsPlaceholder: 'বর্তমান ওষুধের তালিকা দিন (ঐচ্ছিক)',
      // Step 4 - Security
      securityInfo: 'নিরাপত্তা',
      password: 'পাসওয়ার্ড',
      passwordPlaceholder: 'একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      confirmPasswordPlaceholder: 'আপনার পাসওয়ার্ড নিশ্চিত করুন',
      // Form Actions
      next: 'পরবর্তী',
      back: 'পূর্ববর্তী',
      register: 'অ্যাকাউন্ট তৈরি করুন',
      registerLoading: 'অ্যাকাউন্ট তৈরি হচ্ছে...',
      // Navigation
      alreadyHaveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      signIn: 'সাইন ইন',
      // Validation Messages
      firstNameRequired: 'নামের প্রথম অংশ আবশ্যক',
      lastNameRequired: 'নামের শেষ অংশ আবশ্যক',
      emailRequired: 'ইমেইল আবশ্যক',
      emailInvalid: 'অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন',
      phoneRequired: 'ফোন নম্বর আবশ্যক',
      phoneInvalid: 'অনুগ্রহ করে একটি বৈধ ফোন নম্বর দিন',
      dateOfBirthRequired: 'জন্ম তারিখ আবশ্যক',
      genderRequired: 'লিঙ্গ আবশ্যক',
      villageRequired: 'গ্রাম/এলাকা আবশ্যক',
      upazilaRequired: 'উপজেলা আবশ্যক',
      districtRequired: 'জেলা আবশ্যক',
      divisionRequired: 'বিভাগ আবশ্যক',
      passwordRequired: 'পাসওয়ার্ড আবশ্যক',
      passwordMinLength: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে',
      passwordWeak: 'পাসওয়ার্ডে বড় অক্ষর, ছোট অক্ষর এবং সংখ্যা থাকতে হবে',
      confirmPasswordRequired: 'পাসওয়ার্ড নিশ্চিত করা আবশ্যক',
      passwordMismatch: 'পাসওয়ার্ড মিলছে না',
      registerSuccess: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! লগইনে পুনঃনির্দেশিত হচ্ছে...',
      registerError: 'নিবন্ধন ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
      // Step Titles
      step1Title: 'ব্যক্তিগত বিবরণ',
      step2Title: 'অবস্থান',
      step3Title: 'চিকিৎসা তথ্য',
      step4Title: 'নিরাপত্তা',
    },
  };

  const t = texts[language];

  const divisions = {
    EN: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'],
    BN: ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'],
  };

  const steps = [
    { title: t.step1Title, component: renderPersonalInfo() },
    { title: t.step2Title, component: renderLocationInfo() },
    { title: t.step3Title, component: renderMedicalInfo() },
    { title: t.step4Title, component: renderSecurityInfo() },
  ];

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.firstName) newErrors.firstName = t.firstNameRequired;
    if (!formData.lastName) newErrors.lastName = t.lastNameRequired;
    if (!formData.email) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }
    if (!formData.phone) {
      newErrors.phone = t.phoneRequired;
    } else if (!/^(\+8801|8801|01)[3-9]\d{8}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = t.phoneInvalid;
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = t.dateOfBirthRequired;
    if (!formData.gender) (newErrors as any).gender = t.genderRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.village) newErrors.village = t.villageRequired;
    if (!formData.upazila) newErrors.upazila = t.upazilaRequired;
    if (!formData.district) newErrors.district = t.districtRequired;
    if (!formData.division) newErrors.division = t.divisionRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    // Medical info is optional, no validation needed
    setErrors({});
    return true;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 8) {
      newErrors.password = t.passwordMinLength;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t.passwordWeak;
    }

    if (!formData.confirmPassword) {
      (newErrors as any).confirmPassword = t.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      (newErrors as any).confirmPassword = t.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep4()) return;

    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await AuthService.register(formData);
      
      // Store auth data
      AuthService.storeAuthData(response.data.token, response.data.user);
      
      // Update auth context
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      // Show success message
      console.log(t.registerSuccess);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      setErrors({ email: error.message || t.registerError });
    }
  };

  // Input change handler
  const handleInputChange = (field: keyof (RegisterRequest & { confirmPassword?: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Step indicators
  const renderStepIndicators = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            step <= currentStep 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Personal Information Step
  function renderPersonalInfo() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.firstName}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder={t.firstNamePlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.lastName}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder={t.lastNamePlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.email}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder={t.emailPlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.phone}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder={t.phonePlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.dateOfBirth}
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.gender}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'MALE', label: t.genderMale },
              { value: 'FEMALE', label: t.genderFemale },
              { value: 'OTHER', label: t.genderOther },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleInputChange('gender', e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
      </div>
    );
  }

  // Location Information Step
  function renderLocationInfo() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.village}
          </label>
          <input
            type="text"
            value={formData.village}
            onChange={(e) => handleInputChange('village', e.target.value)}
            placeholder={t.villagePlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.village ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.village && (
            <p className="mt-1 text-sm text-red-600">{errors.village}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.upazila}
          </label>
          <input
            type="text"
            value={formData.upazila}
            onChange={(e) => handleInputChange('upazila', e.target.value)}
            placeholder={t.upazilaPlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.upazila ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.upazila && (
            <p className="mt-1 text-sm text-red-600">{errors.upazila}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.district}
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder={t.districtPlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.district ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.district && (
            <p className="mt-1 text-sm text-red-600">{errors.district}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.division}
          </label>
          <select
            value={formData.division}
            onChange={(e) => handleInputChange('division', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.division ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">{t.divisionPlaceholder}</option>
            {divisions[language].map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
          {errors.division && (
            <p className="mt-1 text-sm text-red-600">{errors.division}</p>
          )}
        </div>
      </div>
    );
  }

  // Medical Information Step
  function renderMedicalInfo() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.medicalHistory}
          </label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            placeholder={t.medicalHistoryPlaceholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.allergies}
          </label>
          <textarea
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            placeholder={t.allergiesPlaceholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.currentMedications}
          </label>
          <textarea
            value={formData.currentMedications}
            onChange={(e) => handleInputChange('currentMedications', e.target.value)}
            placeholder={t.currentMedicationsPlaceholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    );
  }

  // Security Information Step
  function renderSecurityInfo() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.password}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={t.passwordPlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m4.242 4.242L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.confirmPassword}
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={(formData as any).confirmPassword || ''}
            onChange={(e) => handleInputChange('confirmPassword' as keyof RegisterRequest, e.target.value)}
            placeholder={t.confirmPasswordPlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Step Indicators */}
      {renderStepIndicators()}

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          {steps[currentStep - 1].title}
        </h2>
        {steps[currentStep - 1].component}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.back}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            {t.next}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            {t.register}
          </button>
        )}
      </div>

      {/* Toggle to Login */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          {t.alreadyHaveAccount}{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {t.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}