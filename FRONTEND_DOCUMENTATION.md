# ShasthoBondhu AI - Frontend Documentation

## Overview

This document provides comprehensive documentation for the ShasthoBondhu AI healthcare platform frontend, built with Next.js, React.js Context API for state management, separate API services, and Tailwind CSS for styling.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Custom SVG icons
- **Language Support**: Multi-language (English/Bangla)

## Project Structure

```
shasthobondhu-ai/
├── app/
│   ├── api/                    # Backend API routes
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Main dashboard pages
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── health/            # Health-related components
│   │   └── profile/           # User profile components
│   ├── services/              # API service files
│   ├── providers.tsx          # Context providers
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── types/                     # TypeScript type definitions
└── README.md
```

## Core Features Implemented

### 1. Authentication System
- **Login Component** (`app/components/auth/LoginForm.tsx`)
  - Multi-step form validation
  - Password visibility toggle
  - Error handling and loading states
  - Multi-language support (EN/BN)

- **Register Component** (`app/components/auth/RegisterForm.tsx`)
  - 4-step registration process
  - Personal information collection
  - Location and medical history
  - Form validation for each step

- **Auth Page** (`app/auth/page.tsx`)
  - Hero section with app features
  - Language toggle functionality
  - Responsive design with animations

### 2. State Management
- **Context Providers** (`app/providers.tsx`)
  - AuthContext for authentication state
  - AppContext for application state
  - Notification system
  - Language and theme management

### 3. API Services
All services follow consistent patterns with error handling, authentication, and response formatting:

- **AuthService** (`app/services/auth.ts`)
  - User login/register
  - Token management
  - Authentication state handling

- **ConsultationService** (`app/services/consultations.ts`)
  - AI symptom analysis
  - Consultation history
  - Urgency level assessment

- **EmergencyService** (`app/services/emergency.ts`)
  - Emergency alert reporting
  - Emergency contacts
  - Location-based emergency services

- **VoiceService** (`app/services/voice.ts`)
  - Speech-to-text processing
  - Text-to-speech functionality
  - Voice interaction history

- **EducationService** (`app/services/education.ts`)
  - Health education content
  - Personalized recommendations
  - Content categorization

- **ResourcesService** (`app/services/resources.ts`)
  - Medical facility search
  - Location-based resource finding
  - Operating hours and services

- **DiseaseTrendsService** (`app/services/disease-trends.ts`)
  - Disease trend analysis
  - Regional health data
  - Risk assessment

- **UsersService** (`app/services/users.ts`)
  - User profile management
  - Dashboard statistics
  - Health summary

### 4. Dashboard System
- **Dashboard Layout** (`app/components/dashboard/DashboardLayout.tsx`)
  - Responsive sidebar navigation
  - User profile display
  - Language switching
  - Emergency access button

- **Dashboard Overview** (`app/components/dashboard/DashboardOverview.tsx`)
  - Health statistics display
  - Quick action buttons
  - Recent activity feed
  - Personalized recommendations

### 5. Health Components

- **Symptom Checker** (`app/components/health/SymptomChecker.tsx`)
  - AI-powered symptom analysis
  - Multi-language input support
  - Risk assessment visualization
  - Emergency detection alerts

- **Emergency Center** (`app/components/health/EmergencyCenter.tsx`)
  - Emergency contact numbers
  - Quick emergency actions
  - Location-based services

- **Voice Assistant** (`app/components/health/VoiceAssistant.tsx`)
  - Speech interaction interface
  - Multi-language support

- **Education Center** (`app/components/health/EducationCenter.tsx`)
  - Health education categories
  - Content discovery

- **Resources Finder** (`app/components/health/ResourcesFinder.tsx`)
  - Medical facility search
  - Location-based filtering

- **Disease Trends** (`app/components/health/DiseaseTrends.tsx`)
  - Health trend visualization
  - Regional disease data

- **User Profile** (`app/components/profile/UserProfile.tsx`)
  - Personal information display
  - Health data management

## Key Features

### Multi-Language Support
- Complete English/Bangla translation
- Dynamic language switching
- Context-aware text rendering
- RTL support ready

### Responsive Design
- Mobile-first approach
- Tailwind CSS utility classes
- Flexible grid layouts
- Touch-friendly interfaces

### Healthcare Theme
- Medical color scheme (blues, greens, reds)
- Healthcare-specific icons
- Professional typography
- Accessibility considerations

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Loading states and spinners
- Network error recovery

### Security Features
- JWT token management
- Secure API communication
- Input validation and sanitization
- Authentication guards

## API Integration

All API services follow consistent patterns:

```typescript
// Service structure
class ServiceName {
  static async methodName(request: RequestType): Promise<ResponseType> {
    try {
      const response = await apiClient.post<ResponseType>('/endpoint', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    // Consistent error handling
  }
}
```

## State Management

### Authentication State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### App State
```typescript
interface AppState {
  auth: AuthState;
  language: 'EN' | 'BN';
  theme: 'light' | 'dark';
  notifications: Notification[];
}
```

## Component Architecture

### Reusable Components
- Form components with validation
- Loading spinners and states
- Error display components
- Modal dialogs
- Navigation components

### Custom Hooks
- `useAuth()` - Authentication context
- `useApp()` - Application context
- Language and theme hooks

## Styling Guidelines

### Tailwind CSS Classes
- Consistent spacing scale
- Healthcare color palette
- Responsive breakpoints
- Custom animations

### Color Scheme
- Primary: Blue (`blue-600`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Error: Red (`red-600`)
- Neutral: Gray (`gray-600`)

## Performance Optimizations

### Code Splitting
- Dynamic imports for components
- Route-based splitting
- Lazy loading for heavy components

### Caching
- API response caching
- Local storage for user data
- Session management

### Bundle Optimization
- Tree shaking
- Minification
- Compressed assets

## Accessibility Features

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## Development Guidelines

### TypeScript Usage
- Strict type checking
- Interface definitions
- Type guards
- Generic types for reusability

### Component Patterns
- Functional components with hooks
- Props interface definitions
- Default and named exports
- Consistent naming conventions

### Error Boundaries
- Wrap critical components
- Graceful error handling
- User feedback
- Development vs production modes

## Testing Strategy

### Unit Testing
- Component testing
- Service testing
- Hook testing
- Utility function testing

### Integration Testing
- API integration
- Context provider testing
- Navigation testing

### E2E Testing
- User workflows
- Authentication flows
- Critical user paths

## Deployment Considerations

### Environment Variables
- API endpoints
- Authentication secrets
- Feature flags
- Analytics keys

### Build Optimization
- Production builds
- Asset optimization
- CDN configuration
- Caching strategies

### Performance Monitoring
- Core Web Vitals
- Error tracking
- User analytics
- Performance metrics

## Future Enhancements

### Planned Features
- Offline support
- Push notifications
- Advanced voice features
- Video consultations
- IoT device integration

### Technical Improvements
- Progressive Web App (PWA)
- Service workers
- Background sync
- Push messaging

## Conclusion

The ShasthoBondhu AI frontend provides a comprehensive, scalable, and user-friendly healthcare platform with robust state management, comprehensive API integration, and multi-language support. The architecture supports future enhancements while maintaining performance and accessibility standards.

---

**Last Updated**: December 28, 2024  
**Version**: 1.0.0  
**Maintainers**: ShasthoBondhu AI Development Team