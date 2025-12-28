"use client";

import React, { useState } from "react";
import { User } from "@/app/services/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  language: "EN" | "BN";
  onLanguageChange: (language: "EN" | "BN") => void;
  user: User;
  onLogout: () => void;
}

export default function DashboardLayout({
  children,
  currentView,
  onViewChange,
  language,
  onLanguageChange,
  user,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const texts = {
    EN: {
      appName: "ShasthoBondhu AI",
      toggleSidebar: "Toggle sidebar",
      closeSidebar: "Close sidebar",
      dashboard: "Dashboard",
      logout: "Logout",
      settings: "Settings",
      notifications: "Notifications",
      help: "Help & Support",
      emergency: "Emergency",
      language: "Language",
    },
    BN: {
      appName: "ShasthoBondhu AI",
      toggleSidebar: "সাইডবার খুলুন",
      closeSidebar: "সাইডবার বন্ধ করুন",
      dashboard: "ড্যাশবোর্ড",
      logout: "লগআউট",
      settings: "সেটিংস",
      notifications: "বিজ্ঞপ্তি",
      help: "সাহায্য ও সহায়তা",
      emergency: "জরুরি",
      language: "ভাষা",
    },
  };

  const t = texts[language];

  const navigationItems = {
    EN: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "symptom-check", label: "Symptom Checker", icon: "🩺" },
      { id: "emergency", label: "Emergency Center", icon: "🚨" },
      { id: "voice", label: "Voice Assistant", icon: "🎤" },
      { id: "education", label: "Health Education", icon: "📚" },
      { id: "resources", label: "Medical Resources", icon: "🏥" },
      { id: "trends", label: "Disease Trends", icon: "📈" },
      { id: "profile", label: "Profile", icon: "👤" },
    ],
    BN: [
      { id: "overview", label: "সারসংক্ষেপ", icon: "📊" },
      { id: "symptom-check", label: "লক্ষণ পরীক্ষক", icon: "🩺" },
      { id: "emergency", label: "জরুরি কেন্দ্র", icon: "🚨" },
      { id: "voice", label: "ভয়েস সহায়তা", icon: "🎤" },
      { id: "education", label: "স্বাস্থ্য শিক্ষা", icon: "📚" },
      { id: "resources", label: "চিকিৎসা সম্পদ", icon: "🏥" },
      { id: "trends", label: "রোগের প্রবণতা", icon: "📈" },
      { id: "profile", label: "প্রোফাইল", icon: "👤" },
    ],
  };

  const currentNavigation = navigationItems[language];

  return (
    <div className="bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t.appName}</h1>
              <p className="text-xs text-gray-500">Healthcare AI</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {currentNavigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === item.id
                  ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => onLanguageChange(language === "EN" ? "BN" : "EN")}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <span className="text-sm font-medium">
              {t.language}: {language === "EN" ? "English" : "বাংলা"}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm font-medium">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentNavigation.find((item) => item.id === currentView)
                    ?.label || t.dashboard}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Emergency button */}
              <button
                onClick={() => onViewChange("emergency")}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">
                  {t.emergency}
                </span>
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
