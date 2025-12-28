"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/app/services/auth';
import ResourcesService, { MedicalResource, ResourceSearchRequest } from '@/app/services/resources';

interface ResourcesFinderProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function ResourcesFinder({ language, user, onNavigate }: ResourcesFinderProps) {
  const [resources, setResources] = useState<MedicalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(25); // 25km default

  const texts = {
    EN: {
      title: 'Medical Resources',
      description: 'Find nearby hospitals, clinics, and pharmacies',
      searchLocation: 'Search by location or service...',
      hospitals: 'Hospitals',
      clinics: 'Clinics',
      pharmacies: 'Pharmacies',
      emergency: 'Emergency Services',
      loading: 'Searching for medical resources...',
      error: 'Error searching for resources',
      filterByType: 'Filter by Type',
      allTypes: 'All Types',
      hospital: 'Hospital',
      clinic: 'Clinic',
      pharmacy: 'Pharmacy',
      diagnosticCenter: 'Diagnostic Center',
      bloodBank: 'Blood Bank',
      ambulanceService: 'Ambulance Service',
      searchRadius: 'Search Radius (km)',
      getLocation: 'Use Current Location',
      distance: 'away',
      call: 'Call',
      directions: 'Directions',
      hours: 'Hours',
      services: 'Services',
      rating: 'Rating',
      noResources: 'No medical resources found',
      showingResults: 'Showing results near',
    },
    BN: {
      title: 'চিকিৎসা সম্পদ',
      description: 'কাছের হাসপাতাল, ক্লিনিক এবং ফার্মেসি খুঁজুন',
      searchLocation: 'অবস্থান বা সেবা দিয়ে অনুসন্ধান...',
      hospitals: 'হাসপাতাল',
      clinics: 'ক্লিনিক',
      pharmacies: 'ফার্মেসি',
      emergency: 'জরুরি সেবা',
      loading: 'চিকিৎসা সম্পদ খুঁজে পাচ্ছি...',
      error: 'সম্পদ অনুসন্ধানে ত্রুটি',
      filterByType: 'প্রকার অনুযায়ী ফিল্টার',
      allTypes: 'সব প্রকার',
      hospital: 'হাসপাতাল',
      clinic: 'ক্লিনিক',
      pharmacy: 'ফার্মেসি',
      diagnosticCenter: 'ডায়াগনস্টিক সেন্টার',
      bloodBank: 'ব্লাড ব্যাঙ্ক',
      ambulanceService: 'এম্বুলেন্স সার্ভিস',
      searchRadius: 'অনুসন্ধানের পরিধি (কিমি)',
      getLocation: 'বর্তমান অবস্থান ব্যবহার করুন',
      distance: 'দূরে',
      call: 'কল করুন',
      directions: 'নির্দেশনা',
      hours: 'সময়',
      services: 'সেবা',
      rating: 'রেটিং',
      noResources: 'কোন চিকিৎসা সম্পদ পাওয়া যায়নি',
      showingResults: 'এখানকার ফলাফল দেখানো হচ্ছে',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const searchResources = async () => {
      try {
        setLoading(true);
        setError('');

        const request: ResourceSearchRequest = {};

        if (searchQuery.trim()) {
          // For location-based search, we'll use the query as district/upazila
          request.district = searchQuery.trim();
        }

        if (selectedType) {
          request.type = selectedType as any;
        }

        if (userLocation) {
          request.latitude = userLocation.latitude;
          request.longitude = userLocation.longitude;
          request.radius = searchRadius;
        }

        const response = await ResourcesService.searchResources(request);
        
        if (response.success) {
          setResources(response.data.resources);
        } else {
          setError(response.message || t.error);
        }
      } catch (err: any) {
        setError(err.message || t.error);
        console.error('Error searching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    searchResources();
  }, [searchQuery, selectedType, userLocation, searchRadius, language]);

  const handleGetLocation = async () => {
    try {
      setLoading(true);
      const location = await navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    } catch (err: any) {
      setError('Could not get your location');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? '' : type);
  };

  const getResourceTypeInfo = (type: MedicalResource['type']) => {
    return ResourcesService.getResourceTypeInfo(type, language);
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return ResourcesService.formatDistance(distance);
  };

  const getOperatingStatus = (resource: MedicalResource) => {
    return ResourcesService.getOperatingStatus(resource, language);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 text-2xl">🏥</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input 
              type="text" 
              placeholder={t.searchLocation}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {['HOSPITAL', 'CLINIC', 'PHARMACY', 'DIAGNOSTIC_CENTER', 'BLOOD_BANK', 'AMBULANCE_SERVICE'].map((type) => {
              const typeInfo = getResourceTypeInfo(type as any);
              return (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === type
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{typeInfo.icon}</span>
                  <span className="text-sm font-medium">{typeInfo.name}</span>
                </button>
              );
            })}
          </div>

          {/* Location and Radius Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGetLocation}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {t.getLocation}
            </button>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">{t.searchRadius}:</label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
          </div>

          {userLocation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                {t.showingResults}: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)} ({searchRadius}km radius)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length > 0 ? (
            resources.map((resource) => {
              const typeInfo = getResourceTypeInfo(resource.type);
              const operatingStatus = getOperatingStatus(resource);
              
              return (
                <div key={resource.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeInfo.icon}</span>
                      <span className="text-sm text-gray-600">{typeInfo.name}</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${operatingStatus.color} ${operatingStatus.isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
                      {operatingStatus.status}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.name}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>{resource.address.street}, {resource.address.upazila}</p>
                    <p>{resource.address.district}, {resource.address.division}</p>
                    
                    {resource.distance && (
                      <p className="text-blue-600 font-medium">{formatDistance(resource.distance)}</p>
                    )}
                    
                    {resource.rating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span>{resource.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({resource.reviewCount || 0})</span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {resource.services && resource.services.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">{t.services}:</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.services.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {service}
                          </span>
                        ))}
                        {resource.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{resource.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      {resource.contact.phone && (
                        <a
                          href={`tel:${resource.contact.phone}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          {t.call}
                        </a>
                      )}
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.location.latitude},${resource.location.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                      >
                        {t.directions}
                      </button>
                    </div>
                    
                    {resource.isEmergency && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Emergency
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">{t.noResources}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
