# ShasthoBondhu AI - Backend API Documentation

## Overview

ShasthoBondhu AI is an AI-powered, low-bandwidth healthcare access platform for rural & hill tract communities. This backend API provides comprehensive healthcare services including AI symptom checking, emergency detection, medical resource routing, voice-based assistance, and health education.

## Features

### 🏥 Core Healthcare Features
- **AI Symptom Checker**: AI-powered chatbot for basic health assessment
- **Emergency Detection**: Automatic detection of high-risk symptoms
- **Medical Resource Routing**: AI suggests nearest available medical help
- **Voice-Based AI Assistant**: Speech-to-text and text-to-speech support
- **Health Education Bot**: Personalized health education content

### 🌐 Technical Features
- **Multi-language Support**: Bangla and English language support
- **Progressive Web App (PWA)**: Optimized for low-bandwidth connections
- **Offline-First Design**: Works with intermittent internet connectivity
- **JWT Authentication**: Stateless token-based authentication
- **PostgreSQL Database**: Robust data persistence with Prisma ORM

## API Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints (except registration and login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+8801234567890",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "gender": "MALE",
  "village": "Sample Village",
  "upazila": "Sample Upazila",
  "district": "Sample District",
  "division": "Dhaka",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "medicalHistory": "None",
  "allergies": "None",
  "currentMedications": "None"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

## AI Symptom Checker

### Submit Symptoms for Analysis
```http
POST /api/consultations/symptom-check
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "symptoms": "I have chest pain and difficulty breathing",
  "language": "EN",
  "consultationLocation": "Home"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Symptom analysis completed",
  "data": {
    "consultationId": "consultation-id",
    "symptoms": "I have chest pain and difficulty breathing",
    "analysis": {
      "possibleConditions": ["Possible heart condition", "Respiratory issue"],
      "urgencyLevel": "EMERGENCY",
      "recommendations": ["Seek immediate medical attention", "Call emergency services"],
      "riskScore": 8.5,
      "emergencyFlags": ["chest pain", "difficulty breathing"]
    },
    "emergency": {
      "isEmergency": true,
      "message": "Emergency symptoms detected",
      "type": "MEDICAL_EMERGENCY"
    },
    "language": "EN",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "user": {
      "name": "John Doe",
      "location": {
        "village": "Sample Village",
        "upazila": "Sample Upazila",
        "district": "Sample District",
        "division": "Dhaka"
      }
    }
  }
}
```

### Get User Consultations
```http
GET /api/consultations/symptom-check?page=1&limit=10&status=PENDING
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Consultations retrieved successfully",
  "data": {
    "consultations": [
      {
        "id": "consultation-id",
        "symptoms": "Headache and fever",
        "urgencyLevel": "MEDIUM",
        "status": "PENDING",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

### User
- Personal information and location data
- Medical history and current medications
- Authentication and role management

### Consultation
- AI-powered symptom analysis results
- Urgency level assessment
- Emergency detection and alerts

### EmergencyAlert
- Automatic emergency detection
- Location-based emergency response
- Recommended actions

### MedicalResource
- Healthcare facilities and services
- Location-based resource discovery
- Operating hours and contact information

### HealthEducationContent
- AI-generated health education materials
- Multi-language support
- Seasonal and region-specific content

### VoiceInteraction
- Speech-to-text processing
- AI response generation
- Multi-language voice support

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details (in development mode)"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Missing or invalid authentication token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Requested resource not found
- `CONFLICT_ERROR`: Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_ERROR`: API rate limit exceeded
- `AI_PROCESSING_ERROR`: AI service processing failed
- `EXTERNAL_SERVICE_ERROR`: External service unavailable

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sasthobondhu_ai"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"

# Google Cloud (for Speech-to-Text)
GOOGLE_CLOUD_SPEECH_CREDENTIALS_PATH="./google-cloud-credentials.json"

# Application
NODE_ENV="development"
APP_URL="http://localhost:3000"
API_BASE_URL="http://localhost:3000/api"

# PWA Configuration
PWA_NAME="ShasthoBondhu AI"
PWA_SHORT_NAME="ShasthoBondhu"
PWA_DESCRIPTION="AI-powered healthcare access platform"
```

## Project Structure

```
shasthobondhu-ai/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── consultations/
│   │   │   └── symptom-check/route.ts
│   │   ├── ai/
│   │   ├── emergency/
│   │   ├── resources/
│   │   ├── voice/
│   │   ├── education/
│   │   ├── disease-trends/
│   │   └── users/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts          # JWT authentication utilities
│   ├── ai.ts            # Gemini AI integration
│   ├── db.ts            # Prisma database client
│   └── validations.ts   # Zod validation schemas
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── utils/
│   ├── helpers.ts       # Utility functions
│   └── errors.ts        # Error handling
├── types/               # TypeScript type definitions
├── middleware.ts        # Next.js middleware
├── next.config.ts       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json
```

## Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Prisma**: Database ORM with type safety
- **PostgreSQL**: Robust relational database
- **Gemini AI**: Google's AI for symptom analysis and health education
- **JWT**: Stateless authentication
- **Zod**: Runtime type validation
- **Tailwind CSS**: Utility-first CSS framework

## Development Setup

1. **Clone and Install Dependencies**
   ```bash
   cd shasthobondhu-ai
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Testing

### Using curl

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Submit symptoms (replace TOKEN with actual JWT)
curl -X POST http://localhost:3000/api/consultations/symptom-check \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "I have a headache",
    "language": "EN"
  }'
```

## Future Enhancements

1. **Real-time Emergency Response**: Integration with emergency services
2. **Community Health Worker Dashboard**: Dedicated interface for health workers
3. **Offline Data Synchronization**: Local storage with sync when online
4. **Multi-language Voice Support**: Enhanced Bangla dialect recognition
5. **Predictive Analytics**: Disease outbreak prediction models
6. **Telemedicine Integration**: Video consultation capabilities
7. **Medication Reminders**: SMS-based medication alerts
8. **Health Tracking**: Vital signs monitoring integration

## Security Considerations

- JWT tokens with expiration
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration
- Environment variable protection
- SQL injection prevention via Prisma
- XSS protection
- Secure password hashing with bcrypt

## Performance Optimizations

- Database query optimization
- Caching strategies
- Lazy loading of components
- Image optimization
- Bundle size optimization
- API response compression
- Connection pooling
- Index optimization

## Deployment

The application can be deployed on various platforms:
- **Vercel**: Recommended for Next.js applications
- **Railway**: PostgreSQL + Next.js deployment
- **AWS**: EC2 + RDS deployment
- **Google Cloud**: App Engine + Cloud SQL
- **DigitalOcean**: App Platform + Managed Database

For production deployment, ensure:
- Environment variables are properly configured
- Database migrations are run
- SSL certificates are installed
- Rate limiting is configured
- Monitoring and logging are set up
- Backup strategies are implemented

## Support

For technical support or questions about the API:
- Review this documentation
- Check the error responses for debugging
- Examine the code comments and type definitions
- Test with the provided curl examples

## License

This project is proprietary software developed for healthcare accessibility in rural communities.