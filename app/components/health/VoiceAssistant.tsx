"use client";

import React from 'react';
import { User } from '@/app/services/auth';

interface VoiceAssistantProps {
  language: 'EN' | 'BN';
  user: User;
  onNavigate: (view: string) => void;
}

export default function VoiceAssistant({ language }: VoiceAssistantProps) {
  const texts = {
    EN: {
      title: 'Voice Assistant',
      description: 'Speak with our AI assistant for health guidance',
      startListening: 'Start Listening',
      stopListening: 'Stop Listening',
    },
    BN: {
      title: 'ভয়েস সহায়তা',
      description: 'স্বাস্থ্য নির্দেশনার জন্য আমাদের AI সহায়তার সাথে কথা বলুন',
      startListening: 'শুনতে শুরু করুন',
      stopListening: 'শুনা বন্ধ করুন',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-purple-600 text-2xl">🎤</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
      <p className="text-lg text-gray-600">{t.description}</p>
      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
        {t.startListening}
      </button>
    </div>
  );
}