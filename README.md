# ShasthoBondhu AI - Healthcare Access Platform

## Team Information

**Team Name:** JUST_Hydra

**Team Members:**
- **Team Leader:** Shyhoon Moontaka (210105.cse@student.just.edu.bd)
- **Team Member:** Md. Sakib Hossain Khan (210128.cse@student.just.edu.bd)
- **Team Member:** Abu Taher (221106.eee@student.just.edu.bd)

## Problem Statement

Rural and hill tract communities in Bangladesh face significant barriers to healthcare access, including:
- Limited availability of healthcare professionals in remote areas
- Language barriers for non-English speaking populations
- Lack of emergency medical support and quick response systems
- Inadequate health education and disease prevention awareness
- Difficulty in finding nearby medical resources and facilities
- Limited internet connectivity affecting traditional telemedicine solutions

## Solution Overview

ShasthoBondhu AI is an AI-powered healthcare access platform specifically designed for rural and hill tract communities in Bangladesh. The platform provides:

### Core Features:
1. **AI Symptom Checker** - Intelligent symptom analysis with urgency assessment
2. **Emergency Detection** - Automated emergency situation identification with instant alerts
3. **Voice-Based Assistance** - Bengali and English voice interaction support
4. **Health Education** - AI-generated health education content in local languages
5. **Medical Resource Finder** - Location-based discovery of nearby healthcare facilities
6. **Disease Trend Prediction** - AI-powered disease outbreak predictions and recommendations

### Key Benefits:
- Provides 24/7 healthcare guidance and support
- Works in low-bandwidth environments
- Supports both Bengali and English languages
- Offers emergency response capabilities
- Accessible through voice commands for illiterate users
- Offline-capable for areas with limited internet

## Technologies Used

### Frontend:
- **Next.js 16.1.1** - React framework for server-side rendering
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Next PWA** - Progressive Web App capabilities

### Backend:
- **Next.js API Routes** - Serverless backend functions
- **Prisma 6.19.1** - Database ORM and migration tool
- **PostgreSQL** - Primary database
- **Zod** - Schema validation

### AI Integration:
- **Google Gemini AI** - Primary AI engine for medical analysis
- **Google Cloud Speech-to-Text** - Voice processing
- **Custom AI Logic** - Symptom analysis and emergency detection

### Authentication & Security:
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Custom middleware** - Route protection

### Additional Tools:
- **Node-cron** - Background task scheduling
- **Axios** - HTTP client
- **UUID** - Unique identifier generation
- **date-fns** - Date manipulation
- **geolib** - Geographic calculations

## AI Tools Disclosure (MANDATORY)

**ALL AI Tools Used in This Project:**

1. **Google Gemini AI** - Used for:
   - Medical symptom analysis and diagnosis suggestions
   - Health education content generation
   - Emergency situation detection
   - Disease trend prediction
   - Voice interaction processing
   - General health chat assistance

2. **ChatGPT** - Used for:
   - Code generation and debugging assistance
   - API design recommendations
   - Database schema optimization
   - Documentation writing support

3. **Kilo Code AI Assistant** - Used for:
   - Code refactoring and optimization
   - Bug fixing and error resolution
   - TypeScript type definitions
   - Project structure recommendations
   - Development workflow optimization

## How the Solution Handles Limited Internet Access

### Offline-First Design:
1. **Progressive Web App (PWA)** - The application can be installed on devices and work offline
2. **Service Worker Caching** - Critical resources and previously accessed content are cached locally
3. **Offline Data Storage** - User data and medical records stored locally when possible
4. **Background Sync** - Data synchronization when connection is restored

### Low-Bandwidth Optimization:
1. **Compressed Assets** - Optimized images and minimal JavaScript bundles
2. **Lazy Loading** - Components and content loaded on-demand
3. **Data Compression** - Efficient data formats for API responses
4. **Voice-First Interface** - Reduces need for extensive typing in poor connectivity

### Resilience Features:
1. **Connection Detection** - Automatically detects and adapts to network conditions
2. **Fallback Mechanisms** - Provides basic functionality even without internet
3. **Batch Operations** - Groups multiple requests to minimize bandwidth usage
4. **Local Processing** - Simple AI processing can work offline for basic queries

## Getting Started

### Prerequisites:
- Node.js 18+ 
- PostgreSQL database
- Google Gemini AI API key
- Google Cloud Speech-to-Text credentials (optional)

### Installation:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd shasthobondhu-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/shasthobondhu_ai"
   JWT_SECRET="your-super-secret-jwt-key"
   GEMINI_API_KEY="your-gemini-api-key"
   GOOGLE_CLOUD_SPEECH_CREDENTIALS_PATH="./google-cloud-credentials.json"
   ```

4. **Database Setup:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

6. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment:
The application can be deployed on Vercel, Netlify, or any Node.js hosting platform. Ensure environment variables are properly configured in your deployment environment.

## Contributing

This project is developed as part of an academic initiative. For contributions or questions, please contact the team members through their respective email addresses.

## Acknowledgments

- Bangladesh rural healthcare communities for inspiring this solution
- Google AI for providing powerful language models
- Next.js and React communities for excellent development tools
- Open source contributors whose libraries made this project possible
