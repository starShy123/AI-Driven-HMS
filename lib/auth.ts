import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './db'
import { UserRoleType } from '@/lib/validations'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRoleType
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  role: UserRoleType
  firstName: string
  lastName: string
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions)
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Compare password
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Get current user from request (convenience function)
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  return getUserFromRequest(request)
}

// Get user from request (for API routes)
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// Require authentication middleware
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    throw new Error('Unauthorized: Invalid or missing token')
  }
  
  return user
}

// Require specific role
export async function requireRole(request: NextRequest, roles: UserRoleType[]): Promise<AuthUser> {
  const user = await requireAuth(request)
  
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  
  return user
}

// Generate password reset token
export function generatePasswordResetToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  return jwt.sign(
    { userId, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

// Verify password reset token
export function verifyPasswordResetToken(token: string): { userId: string } | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as any
    
    if (payload.type !== 'password_reset') {
      return null
    }

    return { userId: payload.userId }
  } catch (error) {
    return null
  }
}