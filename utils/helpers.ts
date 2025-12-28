import { Language } from '@prisma/client'

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Format date for display
export function formatDate(date: Date, language: Language = 'EN'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  if (language === 'BN') {
    return new Intl.DateTimeFormat('bn-BD', options).format(date)
  }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Format time for display
export function formatTime(date: Date, language: Language = 'EN'): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  if (language === 'BN') {
    return new Intl.DateTimeFormat('bn-BD', options).format(date)
  }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Convert English numbers to Bangla numbers
export function convertToBanglaNumbers(input: string): string {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  
  let result = input
  englishNumbers.forEach((en, index) => {
    result = result.replace(new RegExp(en, 'g'), banglaNumbers[index])
  })
  
  return result
}

// Validate Bangladeshi phone number
export function validateBangladeshiPhone(phone: string): boolean {
  const phoneRegex = /^(\+8801|8801|01)[3-9]\d{8}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Format Bangladeshi phone number
export function formatBangladeshiPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '')
  const match = cleaned.match(/^(\+8801|8801|01)(\d{3})(\d{4})(\d{3})$/)
  
  if (match) {
    const [, prefix, part1, part2, part3] = match
    return `${prefix.slice(-3)}-${part1}-${part2}-${part3}`
  }
  
  return phone
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  
  return age
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitize string input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Get urgency level color for UI
export function getUrgencyLevelColor(urgencyLevel: string): string {
  switch (urgencyLevel.toLowerCase()) {
    case 'low':
      return 'green'
    case 'medium':
      return 'yellow'
    case 'high':
      return 'orange'
    case 'emergency':
      return 'red'
    default:
      return 'gray'
  }
}

// Get urgency level text based on language
export function getUrgencyLevelText(urgencyLevel: string, language: Language = 'EN'): string {
  const translations = {
    EN: {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      EMERGENCY: 'Emergency',
    },
    BN: {
      LOW: 'কম',
      MEDIUM: 'মধ্যম',
      HIGH: 'উচ্চ',
      EMERGENCY: 'জরুরি',
    },
  }

  return translations[language][urgencyLevel as keyof typeof translations['EN']] || urgencyLevel
}

// Get resource type text based on language
export function getResourceTypeText(resourceType: string, language: Language = 'EN'): string {
  const translations = {
    EN: {
      GOVERNMENT_CLINIC: 'Government Clinic',
      NGO_CLINIC: 'NGO Clinic',
      PHARMACY: 'Pharmacy',
      HOSPITAL: 'Hospital',
      MOBILE_MEDICAL_TEAM: 'Mobile Medical Team',
      COMMUNITY_HEALTH_CENTER: 'Community Health Center',
    },
    BN: {
      GOVERNMENT_CLINIC: 'সরকারি ক্লিনিক',
      NGO_CLINIC: 'এনজিও ক্লিনিক',
      PHARMACY: 'ফার্মেসি',
      HOSPITAL: 'হাসপাতাল',
      MOBILE_MEDICAL_TEAM: 'মোবাইল মেডিকেল টিম',
      COMMUNITY_HEALTH_CENTER: 'কমিউনিটি স্বাস্থ্য কেন্দ্র',
    },
  }

  return translations[language][resourceType as keyof typeof translations['EN']] || resourceType
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Check if string contains medical emergency keywords
export function containsEmergencyKeywords(text: string, language: Language = 'EN'): boolean {
  const emergencyKeywords = {
    EN: [
      'chest pain', 'heart attack', 'stroke', 'unconscious', 'bleeding',
      'difficulty breathing', 'severe injury', 'emergency', 'urgent',
      'can\'t breathe', 'fainting', 'seizure'
    ],
    BN: [
      'বুকে ব্যথা', 'হার্ট অ্যাটাক', 'স্ট্রোক', 'অজ্ঞান', 'রক্তক্ষরণ',
      'শ্বাসকষ্ট', 'গুরুতর আঘাত', 'জরুরি', 'শ্বাস নিতে পারছি না',
      'চেতনা হারানো', 'খিঁচুনি'
    ],
  }

  const textLower = text.toLowerCase()
  return emergencyKeywords[language].some(keyword => 
    textLower.includes(keyword.toLowerCase())
  )
}

// Get recommended medical resources based on urgency and location
export function getRecommendedResources(
  resources: any[],
  urgencyLevel: string,
  userLat: number,
  userLng: number
): any[] {
  const emergencyWeight = urgencyLevel === 'EMERGENCY' ? 2 : 1
  
  return resources
    .map(resource => ({
      ...resource,
      distance: calculateDistance(userLat, userLng, resource.latitude, resource.longitude),
      score: emergencyWeight / (1 + calculateDistance(userLat, userLng, resource.latitude, resource.longitude)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Return top 5 recommendations
}

// Format response for API consistency
export function formatApiResponse<T>(
  data: T,
  message: string = 'Success',
  success: boolean = true
): { success: boolean; message: string; data: T } {
  return {
    success,
    message,
    data,
  }
}

// Format error response for API consistency
export function formatApiError(
  message: string,
  code: string = 'ERROR',
  details?: any
): { success: boolean; message: string; error: { code: string; details?: any } } {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
  }
}

// Validate coordinates
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Get Bangladesh divisions
export function getBangladeshDivisions(language: Language = 'EN'): string[] {
  const divisions = {
    EN: [
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
    ],
    BN: [
      'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
    ],
  }

  return divisions[language]
}