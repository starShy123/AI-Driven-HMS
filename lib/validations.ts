import { z } from 'zod'

// Local enum definitions (since Prisma v6 may not export enums properly)
export const UserRole = {
  PATIENT: 'PATIENT',
  HEALTHCARE_WORKER: 'HEALTHCARE_WORKER',
  ADMIN: 'ADMIN',
  COMMUNITY_HEALTH_WORKER: 'COMMUNITY_HEALTH_WORKER',
} as const

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const

export const UrgencyLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  EMERGENCY: 'EMERGENCY',
} as const

export const Language = {
  EN: 'EN',
  BN: 'BN',
} as const

export const ResourceType = {
  GOVERNMENT_CLINIC: 'GOVERNMENT_CLINIC',
  NGO_CLINIC: 'NGO_CLINIC',
  PHARMACY: 'PHARMACY',
  HOSPITAL: 'HOSPITAL',
  MOBILE_MEDICAL_TEAM: 'MOBILE_MEDICAL_TEAM',
  COMMUNITY_HEALTH_CENTER: 'COMMUNITY_HEALTH_CENTER',
} as const

export const EmergencyType = {
  MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
  PREGNANCY_COMPLICATION: 'PREGNANCY_COMPLICATION',
  STROKE: 'STROKE',
  INFECTION: 'INFECTION',
  INJURY: 'INJURY',
  OTHER: 'OTHER',
} as const

export const ContentType = {
  HEALTH_EDUCATION: 'HEALTH_EDUCATION',
  DISEASE_PREVENTION: 'DISEASE_PREVENTION',
  MATERNAL_HEALTH: 'MATERNAL_HEALTH',
  NUTRITION: 'NUTRITION',
  SEASONAL_HEALTH: 'SEASONAL_HEALTH',
  EMERGENCY_CARE: 'EMERGENCY_CARE',
} as const

// TypeScript types derived from the const objects
export type UserRoleType = typeof UserRole[keyof typeof UserRole]
export type GenderType = typeof Gender[keyof typeof Gender]
export type UrgencyLevelType = typeof UrgencyLevel[keyof typeof UrgencyLevel]
export type LanguageType = typeof Language[keyof typeof Language]
export type ResourceTypeType = typeof ResourceType[keyof typeof ResourceType]
export type EmergencyTypeType = typeof EmergencyType[keyof typeof EmergencyType]
export type ContentTypeType = typeof ContentType[keyof typeof ContentType]

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  village: z.string().optional(),
  upazila: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  village: z.string().optional(),
  upazila: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
})

// Consultation schemas
export const createConsultationSchema = z.object({
  symptoms: z.string().min(1, 'Symptoms are required'),
  language: z.enum(['EN', 'BN']).default('EN'),
  consultationLocation: z.string().optional(),
})

export const consultationResponseSchema = z.object({
  symptoms: z.string(),
  aiResponse: z.string().optional(),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'EMERGENCY']).default('PENDING'),
  language: z.enum(['EN', 'BN']).default('EN'),
  possibleConditions: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  riskScore: z.number().min(0).max(10).optional(),
  consultationLocation: z.string().optional(),
})

// Symptom report schemas
export const createSymptomReportSchema = z.object({
  symptom: z.string().min(1, 'Symptom is required'),
  severity: z.number().min(1).max(10, 'Severity must be between 1 and 10'),
  duration: z.string().min(1, 'Duration is required'),
  additionalNotes: z.string().optional(),
})

// Medical resource schemas
export const createMedicalResourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['GOVERNMENT_CLINIC', 'NGO_CLINIC', 'PHARMACY', 'HOSPITAL', 'MOBILE_MEDICAL_TEAM', 'COMMUNITY_HEALTH_CENTER']),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().min(1, 'Address is required'),
  village: z.string().optional(),
  upazila: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  operatingHours: z.string().optional(),
  services: z.array(z.string()).optional(),
})

// Health education content schemas
export const createHealthEducationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['HEALTH_EDUCATION', 'DISEASE_PREVENTION', 'MATERNAL_HEALTH', 'NUTRITION', 'SEASONAL_HEALTH', 'EMERGENCY_CARE']),
  language: z.enum(['EN', 'BN']).default('EN'),
  targetAudience: z.string().optional(),
  tags: z.array(z.string()).optional(),
  season: z.string().optional(),
  division: z.string().optional(),
  isAIGenerated: z.boolean().default(false),
})

// Voice interaction schemas
export const createVoiceInteractionSchema = z.object({
  audioUrl: z.string().url().optional(),
  transcribedText: z.string().optional(),
  language: z.enum(['EN', 'BN']).default('EN'),
  consultationId: z.string().optional(),
})

// Emergency alert schemas
export const createEmergencyAlertSchema = z.object({
  consultationId: z.string().min(1, 'Consultation ID is required'),
  emergencyType: z.enum(['MEDICAL_EMERGENCY', 'PREGNANCY_COMPLICATION', 'STROKE', 'INFECTION', 'INJURY', 'OTHER']),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('EMERGENCY'),
  alertMessage: z.string().min(1, 'Alert message is required'),
  recommendedAction: z.string().min(1, 'Recommended action is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// Health record schemas
export const createHealthRecordSchema = z.object({
  recordType: z.string().min(1, 'Record type is required'),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().optional(),
  notes: z.string().optional(),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
})

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const locationQuerySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(0.1).max(100).default(10), // in kilometers
})

// Disease tracking schemas
export const createDiseaseTrackingSchema = z.object({
  diseaseName: z.string().min(1, 'Disease name is required'),
  region: z.string().min(1, 'Region is required'),
  reportedCases: z.number().min(0).default(0),
  suspectedCases: z.number().min(0).default(0),
  resolvedCases: z.number().min(0).default(0),
  trendDirection: z.enum(['increasing', 'decreasing', 'stable']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  reportedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dataSource: z.string().optional(),
})

// CHW Assignment schemas
export const createCHWAssignmentSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
  area: z.string().min(1, 'Area is required'),
  upazila: z.string().min(1, 'Upazila is required'),
  district: z.string().min(1, 'District is required'),
})

// Type exports for use in API routes
export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateConsultationInput = z.infer<typeof createConsultationSchema>
export type CreateSymptomReportInput = z.infer<typeof createSymptomReportSchema>
export type CreateMedicalResourceInput = z.infer<typeof createMedicalResourceSchema>
export type CreateHealthEducationInput = z.infer<typeof createHealthEducationSchema>
export type CreateVoiceInteractionInput = z.infer<typeof createVoiceInteractionSchema>
export type CreateEmergencyAlertInput = z.infer<typeof createEmergencyAlertSchema>
export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>
export type CreateDiseaseTrackingInput = z.infer<typeof createDiseaseTrackingSchema>
export type CreateCHWAssignmentInput = z.infer<typeof createCHWAssignmentSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type LocationQueryInput = z.infer<typeof locationQuerySchema>