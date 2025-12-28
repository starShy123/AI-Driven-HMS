import axios, { AxiosResponse } from 'axios';

// Types
export interface VoiceInteractionRequest {
  audioUrl?: string;
  transcribedText?: string;
  language: 'EN' | 'BN';
  consultationId?: string;
}

export interface VoiceResponse {
  text: string;
  audioData?: string; // Base64 encoded response audio
  language: string;
  confidence: number;
  intent?: string;
  entities?: Record<string, any>;
}

export interface VoiceInteraction {
  id: string;
  userId: string;
  audioUrl?: string;
  transcribedText?: string;
  language: 'EN' | 'BN';
  aiResponseText?: string;
  responseAudioUrl?: string;
  consultationId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface VoiceInteractionResponse {
  success: boolean;
  message: string;
  data: {
    response: VoiceResponse;
    interactionId: string;
  };
}

export interface VoiceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    interactions: VoiceInteraction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: string;
  };
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000, // Longer timeout for voice processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Voice Service
export class VoiceService {
  /**
   * Process voice input and get AI response
   */
  static async processVoiceInput(request: VoiceInteractionRequest): Promise<VoiceInteractionResponse> {
    try {
      const response = await apiClient.post<VoiceInteractionResponse>('/voice', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's voice interaction history
   */
  static async getVoiceHistory(
    page: number = 1,
    limit: number = 10,
    language?: 'EN' | 'BN',
    consultationId?: string
  ): Promise<VoiceHistoryResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (language) {
        params.append('language', language);
      }

      if (consultationId) {
        params.append('consultationId', consultationId);
      }

      const response = await apiClient.get<VoiceHistoryResponse>(`/voice?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit feedback for a voice interaction
   */
  static async submitFeedback(
    interactionId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/voice/feedback/${interactionId}`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Start recording audio
   */
  static startRecording(): Promise<MediaRecorder> {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error('Audio recording is not supported in this browser'));
        return;
      }

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          resolve(mediaRecorder);
        })
        .catch((error) => {
          reject(new Error('Unable to access microphone: ' + error.message));
        });
    });
  }

  /**
   * Stop recording and get audio blob
   */
  static stopRecording(mediaRecorder: MediaRecorder): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('Recording error: ' + event.error));
      };

      mediaRecorder.stop();
    });
  }

  /**
   * Convert audio blob to base64
   */
  static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 to audio blob and play
   */
  static playBase64Audio(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Add data URL prefix
        const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;
        const audio = new Audio(audioDataUrl);
        
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Failed to play audio'));
        
        audio.play();
      } catch (error) {
        reject(new Error('Failed to play audio: ' + error));
      }
    });
  }

  /**
   * Check if browser supports speech recognition
   */
  static isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Check if browser supports speech synthesis
   */
  static isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Use browser's built-in speech recognition as fallback
   */
  static startSpeechRecognition(
    language: string = 'en-US',
    onResult: (transcript: string) => void,
    onError: (error: string) => void
  ): void {
    if (!this.isSpeechRecognitionSupported()) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    // @ts-ignore - SpeechRecognition types may not be available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError('Speech recognition error: ' + event.error);
    };

    recognition.start();
  }

  /**
   * Use browser's built-in speech synthesis
   */
  static speakText(
    text: string,
    language: string = 'en-US',
    rate: number = 1.0,
    pitch: number = 1.0
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis is not supported in this browser'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error('Speech synthesis error: ' + event.error));

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Get available voices for speech synthesis
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSynthesisSupported()) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }

  /**
   * Get language-specific voice
   */
  static getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    return voices.find(voice => voice.lang.startsWith(language)) || null;
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      return new Error(apiError.message || 'Voice service error');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Network error occurred during voice processing');
  }
}

export default VoiceService;