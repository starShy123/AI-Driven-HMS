"use client";

import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/app/services/auth';
import VoiceService, { VoiceInteractionRequest, VoiceInteractionResponse, VoiceInteraction } from '@/app/services/voice';

interface VoiceAssistantProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function VoiceAssistant({ language, user, onNavigate }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interactionHistory, setInteractionHistory] = useState<VoiceInteraction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const texts = {
    EN: {
      title: 'Voice Assistant',
      description: 'Speak with our AI assistant for health guidance',
      startListening: 'Start Listening',
      stopListening: 'Stop Listening',
      processing: 'Processing your request...',
      speakPrompt: 'Speak your health question or concern',
      response: 'AI Response',
      transcript: 'Your Speech',
      error: 'Error processing voice input',
      noSupport: 'Voice features are not supported in this browser',
      history: 'Recent Conversations',
      loadingHistory: 'Loading conversation history...',
      noHistory: 'No conversation history found',
      clearHistory: 'Clear History',
      playResponse: 'Play Response',
      stopPlaying: 'Stop Playing',
      confidence: 'Confidence',
    },
    BN: {
      title: 'ভয়েস সহায়তা',
      description: 'স্বাস্থ্য নির্দেশনার জন্য আমাদের AI সহায়তার সাথে কথা বলুন',
      startListening: 'শুনতে শুরু করুন',
      stopListening: 'শুনা বন্ধ করুন',
      processing: 'আপনার অনুরোধ প্রক্রিয়াজাত করা হচ্ছে...',
      speakPrompt: 'আপনার স্বাস্থ্য প্রশ্ন বা উদ্বেগ বলুন',
      response: 'AI প্রতিক্রিয়া',
      transcript: 'আপনার কথা',
      error: 'ভয়েস ইনপুট প্রক্রিয়াজাত করতে ত্রুটি',
      noSupport: 'এই ব্রাউজারে ভয়েস বৈশিষ্ট্য সমর্থিত নয়',
      history: 'সাম্প্রতিক কথোপকথন',
      loadingHistory: 'কথোপকথনের ইতিহাস লোড হচ্ছে...',
      noHistory: 'কোন কথোপকথনের ইতিহাস পাওয়া যায়নি',
      clearHistory: 'ইতিহাস মুছুন',
      playResponse: 'প্রতিক্রিয়া চালান',
      stopPlaying: 'চালানো বন্ধ করুন',
      confidence: 'আত্মবিশ্বাস',
    },
  };

  const t = texts[language];

  useEffect(() => {
    loadInteractionHistory();
  }, [language]);

  const loadInteractionHistory = async () => {
    try {
      const response = await VoiceService.getVoiceHistory(1, 10, language);
      if (response.success) {
        setInteractionHistory(response.data.interactions);
      }
    } catch (err) {
      console.error('Error loading voice history:', err);
    }
  };

  const startListening = async () => {
    try {
      setError('');
      setTranscript('');
      setResponse('');
      
      if (!VoiceService.isSpeechRecognitionSupported()) {
        setError(t.noSupport);
        return;
      }

      setIsListening(true);
      
      // Use browser's speech recognition as fallback
      VoiceService.startSpeechRecognition(
        language === 'EN' ? 'en-US' : 'bn-BD',
        (transcript) => {
          setTranscript(transcript);
          setIsListening(false);
          processVoiceInput(transcript);
        },
        (error) => {
          setError(error);
          setIsListening(false);
        }
      );
    } catch (err: any) {
      setError(err.message || t.error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    // Speech recognition will be stopped automatically
  };

  const processVoiceInput = async (text: string) => {
    try {
      setIsProcessing(true);
      setError('');

      const request: VoiceInteractionRequest = {
        transcribedText: text,
        language,
      };

      const response = await VoiceService.processVoiceInput(request);
      
      if (response.success) {
        setResponse(response.data.response.text);
        
        // Play audio response if available
        if (response.data.response.audioData) {
          await VoiceService.playBase64Audio(response.data.response.audioData);
        } else {
          // Fallback to speech synthesis
          await VoiceService.speakText(
            response.data.response.text,
            language === 'EN' ? 'en-US' : 'bn-BD'
          );
        }
        
        // Reload history to show the new interaction
        loadInteractionHistory();
      }
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playPreviousResponse = async (audioData: string) => {
    try {
      setIsPlaying(true);
      await VoiceService.playBase64Audio(audioData);
    } catch (err) {
      setError('Error playing audio response');
    } finally {
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const clearHistory = async () => {
    try {
      // Note: This would need to be implemented in the backend
      setInteractionHistory([]);
    } catch (err) {
      setError('Error clearing history');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'EN' ? 'en-US' : 'bn-BD');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-purple-600 text-2xl">🎤</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-lg text-gray-600">{t.description}</p>
      </div>

      {/* Voice Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center space-y-6">
          {/* Microphone Button */}
          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : isListening ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                </svg>
              )}
            </button>
            
            {isListening && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-400 rounded animate-pulse"></div>
                  <div className="w-1 h-6 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 bg-red-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="space-y-2">
            {isProcessing && (
              <p className="text-lg text-purple-600 font-medium">{t.processing}</p>
            )}
            {isListening && (
              <p className="text-lg text-red-600 font-medium">{t.speakPrompt}</p>
            )}
            {!isListening && !isProcessing && (
              <p className="text-lg text-gray-600">{t.description}</p>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">{t.transcript}:</h3>
              <p className="text-blue-800">"{transcript}"</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-green-900">{t.response}:</h3>
                <button
                  onClick={() => isPlaying ? stopPlayback() : VoiceService.speakText(response, language === 'EN' ? 'en-US' : 'bn-BD')}
                  className="text-green-600 hover:text-green-800"
                >
                  {isPlaying ? t.stopPlaying : t.playResponse}
                </button>
              </div>
              <p className="text-green-800">"{response}"</p>
            </div>
          )}

          {/* Error */}
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
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t.history}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-purple-600 hover:text-purple-800 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
            {interactionHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                {t.clearHistory}
              </button>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="space-y-4">
            {interactionHistory.length > 0 ? (
              interactionHistory.map((interaction) => (
                <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(interaction.createdAt)}</span>
                      <span className="capitalize">{interaction.language}</span>
                    </div>
                    
                    {interaction.transcribedText && (
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{t.transcript}:</p>
                        <p className="text-gray-700">"{interaction.transcribedText}"</p>
                      </div>
                    )}
                    
                    {interaction.aiResponseText && (
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 text-sm">{t.response}:</p>
                          {interaction.responseAudioUrl && (
                            <button
                              onClick={() => playPreviousResponse(interaction.responseAudioUrl!)}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              {t.playResponse}
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700">"{interaction.aiResponseText}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{t.noHistory}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Browser Support Warning */}
      {!VoiceService.isSpeechRecognitionSupported() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-700">{t.noSupport}</p>
          </div>
        </div>
      )}
    </div>
  );
}
