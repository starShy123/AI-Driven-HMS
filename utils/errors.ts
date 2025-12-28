import { NextResponse } from 'next/server'

export class AppError extends Error {
  public statusCode: number
  public code: string
  public details?: any
  public isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error', details?: any) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details)
  }
}

export class AIProcessingError extends AppError {
  constructor(message: string = 'AI processing failed', details?: any) {
    super(message, 503, 'AI_PROCESSING_ERROR', details)
  }
}

// Error handler for API routes
export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
      },
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
      error: {
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    }
  }

  return {
    success: false,
    message: 'An unexpected error occurred',
    error: {
      code: 'UNKNOWN_ERROR',
    },
  }
}

// Next.js App Router compatible async handler
export function asyncHandler(fn: Function) {
  return async (req: any, context?: any) => {
    try {
      return await fn(req, context)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            error: {
              code: error.code,
              details: error.details,
            },
          },
          { status: error.statusCode }
        )
      }
      
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            error: {
              code: 'INTERNAL_ERROR',
              details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'An unexpected error occurred',
          error: {
            code: 'UNKNOWN_ERROR',
          },
        },
        { status: 500 }
      )
    }
  }
}

// Async error handler wrapper for Next.js App Router
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Route Handler Error:', error)
      
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            error: {
              code: error.code,
              details: error.details,
            },
          },
          { status: error.statusCode }
        )
      }
      
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            error: {
              code: 'INTERNAL_ERROR',
              details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'An unexpected error occurred',
          error: {
            code: 'UNKNOWN_ERROR',
          },
        },
        { status: 500 }
      )
    }
  }
}

// Legacy async handler (deprecated for Next.js App Router)
export function legacyAsyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Validation error handler
export function handleValidationError(errors: any[]) {
  const message = errors.map(error => error.message).join(', ')
  throw new ValidationError(`Validation failed: ${message}`, errors)
}

// Database error handler
export function handleDatabaseError(error: any) {
  console.error('Database Error:', error)

  if (error.code === 'P2002') {
    throw new ConflictError('A record with this information already exists')
  }

  if (error.code === 'P2025') {
    throw new NotFoundError('Record not found')
  }

  throw new AppError('Database operation failed', 500, 'DATABASE_ERROR', error)
}

// AI service error handler
export function handleAIError(error: any, operation: string) {
  console.error(`AI Error in ${operation}:`, error)

  if (error.message?.includes('API_KEY')) {
    throw new ExternalServiceError('AI service authentication failed')
  }

  if (error.message?.includes('quota')) {
    throw new RateLimitError('AI service rate limit exceeded')
  }

  throw new AIProcessingError(`AI ${operation} failed`, error)
}

// Create standardized error responses
export const ErrorResponses = {
  BAD_REQUEST: (message: string = 'Bad request') => ({
    success: false,
    message,
    error: { code: 'BAD_REQUEST' },
  }),

  UNAUTHORIZED: (message: string = 'Authentication required') => ({
    success: false,
    message,
    error: { code: 'UNAUTHORIZED' },
  }),

  FORBIDDEN: (message: string = 'Insufficient permissions') => ({
    success: false,
    message,
    error: { code: 'FORBIDDEN' },
  }),

  NOT_FOUND: (message: string = 'Resource not found') => ({
    success: false,
    message,
    error: { code: 'NOT_FOUND' },
  }),

  CONFLICT: (message: string = 'Resource conflict') => ({
    success: false,
    message,
    error: { code: 'CONFLICT' },
  }),

  VALIDATION_ERROR: (message: string, details?: any) => ({
    success: false,
    message,
    error: { code: 'VALIDATION_ERROR', details },
  }),

  RATE_LIMIT: (message: string = 'Rate limit exceeded') => ({
    success: false,
    message,
    error: { code: 'RATE_LIMIT_ERROR' },
  }),

  INTERNAL_ERROR: (message: string = 'Internal server error') => ({
    success: false,
    message,
    error: { code: 'INTERNAL_ERROR' },
  }),

  SERVICE_UNAVAILABLE: (message: string = 'Service temporarily unavailable') => ({
    success: false,
    message,
    error: { code: 'SERVICE_UNAVAILABLE' },
  }),
}

// Create API error response
export function createApiError(message: string, statusCode: number = 500) {
  const getErrorCode = (code: number) => {
    switch (code) {
      case 400: return 'BAD_REQUEST'
      case 401: return 'UNAUTHORIZED'
      case 403: return 'FORBIDDEN'
      case 404: return 'NOT_FOUND'
      case 409: return 'CONFLICT'
      case 422: return 'VALIDATION_ERROR'
      case 429: return 'RATE_LIMIT_ERROR'
      case 500: return 'INTERNAL_ERROR'
      case 502: return 'SERVICE_UNAVAILABLE'
      case 503: return 'SERVICE_UNAVAILABLE'
      default: return 'INTERNAL_ERROR'
    }
  }

  return {
    success: false,
    message,
    error: {
      code: getErrorCode(statusCode),
      statusCode,
    },
  }
}