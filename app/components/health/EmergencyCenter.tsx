"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/app/services/auth';
import EmergencyService, { EmergencyAlert, MedicalResource } from '@/app/services/emergency';

interface EmergencyCenterProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function EmergencyCenter({ language, user, onNavigate }: EmergencyCenterProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [resources, setResources] = useState<MedicalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const texts = {
    EN: {
      title: 'Emergency Center',
      description: 'Quick access to emergency services and contacts',
      emergencyNumbers: 'Emergency Numbers',
      emergencyContacts: 'Emergency Contacts',
      emergencyResources: 'Nearby Emergency Resources',
      activeAlerts: 'Active Emergency Alerts',
      loading: 'Loading emergency information...',
      error: 'Error loading emergency information',
      getLocation: 'Get My Location',
      findingResources: 'Finding nearby resources...',
      call: 'Call',
      directions: 'Directions',
      noAlerts: 'No active emergency alerts',
      noResources: 'No emergency resources found',
      currentLocation: 'Using current location',
      allowLocation: 'Allow location access to find nearby resources',
    },
    BN: {
      title: 'জরুরি কেন্দ্র',
      description: 'জরুরি সেবা এবং যোগাযোগের দ্রুত অ্যাক্সেস',
      emergencyNumbers: 'জরুরি নম্বর',
      emergencyContacts: 'জরুরি যোগাযোগ',
      emergencyResources: 'কাছের জরুরি সম্পদ',
      activeAlerts: 'সক্রিয় জরুরি সতর্কতা',
      loading: 'জরুরি তথ্য লোড হচ্ছে...',
      error: 'জরুরি তথ্য লোড করতে ত্রুটি',
      getLocation: 'আমার অবস্থান পান',
      findingResources: 'কাছের সম্পদ খুঁজে পাচ্ছি...',
      call: 'কল করুন',
      directions: 'নির্দেশনা',
      noAlerts: 'কোন সক্রিয় জরুরি সতর্কতা নেই',
      noResources: 'কোন জরুরি সম্পদ পাওয়া যায়নি',
      currentLocation: 'বর্তমান অবস্থান ব্যবহার করছি',
      allowLocation: 'কাছের সম্পদ খুঁজতে অবস্থান অ্যাক্সেসের অনুমতি দিন',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const loadEmergencyData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load emergency alerts
        const alertsResponse = await EmergencyService.getUserAlerts(1, 10, 'active');
        if (alertsResponse.success) {
          setAlerts(alertsResponse.data.alerts);
        }

        // Load emergency resources using current location or default
        try {
          const location = await EmergencyService.getCurrentLocation();
          setUserLocation(location);
          
          const resourcesResponse = await EmergencyService.getEmergencyResources(
            location.latitude,
            location.longitude,
            50, // 50km radius
            1,
            10
          );
          
          if (resourcesResponse.success) {
            setResources(resourcesResponse.data.resources);
          }
        } catch (locationError) {
          console.warn('Could not get user location:', locationError);
          // Use default location (Dhaka, Bangladesh)
          const defaultResourcesResponse = await EmergencyService.getEmergencyResources(
            23.8103, // Dhaka latitude
            90.4125, // Dhaka longitude
            50,
            1,
            10
          );
          
          if (defaultResourcesResponse.success) {
            setResources(defaultResourcesResponse.data.resources);
          }
        }
      } catch (err: any) {
        setError(err.message || t.error);
        console.error('Error loading emergency data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEmergencyData();
  }, [language]);

  const handleGetLocation = async () => {
    try {
      setLoading(true);
      const location = await EmergencyService.getCurrentLocation();
      setUserLocation(location);
      
      const resourcesResponse = await EmergencyService.getEmergencyResources(
        location.latitude,
        location.longitude,
        50,
        1,
        10
      );
      
      if (resourcesResponse.success) {
        setResources(resourcesResponse.data.resources);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const emergencyContacts = EmergencyService.getBangladeshEmergencyContacts();
  const emergencyTips = EmergencyService.getEmergencyTips(language);

  const getUrgencyColor = (urgencyLevel: EmergencyAlert['urgencyLevel']) => {
    return EmergencyService.getUrgencyLevelColor(urgencyLevel);
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return EmergencyService.formatDistance(distance);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">🚨</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
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

      {/* Emergency Numbers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.emergencyNumbers}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-900">{contact.name}</p>
                <p className="text-sm text-red-700">{contact.phone}</p>
                {contact.address && (
                  <p className="text-xs text-red-600">{contact.address}</p>
                )}
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t.call}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Active Emergency Alerts */}
      {!loading && alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.activeAlerts}</h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getUrgencyColor(alert.urgencyLevel)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{alert.emergencyType.replace('_', ' ')}</span>
                      <span className="text-xs">{alert.urgencyLevel}</span>
                    </div>
                    <p className="text-sm">{alert.alertMessage}</p>
                    <p className="text-xs mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Resources */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t.emergencyResources}</h2>
          <button
            onClick={handleGetLocation}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {t.getLocation}
          </button>
        </div>

        {userLocation && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{t.currentLocation}</p>
          </div>
        )}

        {!userLocation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{t.allowLocation}</p>
          </div>
        )}

        <div className="space-y-4">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{resource.type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-700">{resource.address}</p>
                    {resource.phone && (
                      <p className="text-sm text-gray-600 mt-1">{resource.phone}</p>
                    )}
                    {resource.distance && (
                      <p className="text-xs text-gray-500 mt-1">{formatDistance(resource.distance)}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {resource.phone && (
                      <a
                        href={`tel:${resource.phone}`}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        {t.call}
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                    >
                      {t.directions}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t.noResources}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Emergency Preparedness Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{language === 'EN' ? 'Emergency Preparedness Tips' : 'জরুরি প্রস্তুতির পরামর্শ'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs">✓</span>
              </div>
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
