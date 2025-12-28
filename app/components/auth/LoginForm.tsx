"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import AuthService, { LoginRequest } from "@/app/services/auth";

interface LoginFormProps {
  onToggleMode: () => void;
  language: "EN" | "BN";
}

export default function LoginForm({ onToggleMode, language }: LoginFormProps) {
  const router = useRouter();
  const { state, dispatch } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [showPassword, setShowPassword] = useState(false);

  const texts = {
    EN: {
      title: "Welcome Back",
      subtitle: "Sign in to access your healthcare services",
      email: "Email Address",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      loginButton: "Sign In",
      loginButtonLoading: "Signing In...",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      createAccount: "Create Account",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      loginSuccess: "Login successful! Redirecting...",
      loginError: "Login failed. Please check your credentials.",
    },
    BN: {
      title: "স্বাগতম",
      subtitle: "আপনার স্বাস্থ্যসেবা অ্যাক্সেস করতে সাইন ইন করুন",
      email: "ইমেইল ঠিকানা",
      emailPlaceholder: "আপনার ইমেইল দিন",
      password: "পাসওয়ার্ড",
      passwordPlaceholder: "আপনার পাসওয়ার্ড দিন",
      loginButton: "সাইন ইন",
      loginButtonLoading: "সাইন ইন হচ্ছে...",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      noAccount: "কোনো অ্যাকাউন্ট নেই?",
      createAccount: "অ্যাকাউন্ট তৈরি করুন",
      emailRequired: "ইমেইল আবশ্যক",
      emailInvalid: "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন",
      passwordRequired: "পাসওয়ার্ড আবশ্যক",
      passwordMinLength: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
      loginSuccess: "সাইন ইন সফল! পুনঃনির্দেশিত হচ্ছে...",
      loginError: "সাইন ইন ব্যর্থ। অনুগ্রহ করে আপনার তথ্য পরীক্ষা করুন।",
    },
  };

  const t = texts[language];

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.passwordMinLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch({ type: "LOGIN_START" });

    try {
      const response = await AuthService.login(formData);

      // Store auth data
      AuthService.storeAuthData(response.data.token, response.data.user);

      // Update auth context
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      // Show success message
      console.log(t.loginSuccess);

      console.log(state.isAuthenticated);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE" });
      setErrors({ email: error.message || t.loginError });
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder={t.emailPlaceholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            disabled={state.isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t.password}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder={t.passwordPlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              disabled={state.isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={state.isLoading}
            >
              {showPassword ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m4.242 4.242L21 21"
                  />
                </svg>
              ) : (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            disabled={state.isLoading}
          >
            {t.forgotPassword}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={state.isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            state.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          } text-white shadow-lg hover:shadow-xl`}
        >
          {state.isLoading ? t.loginButtonLoading : t.loginButton}
        </button>
      </form>

      {/* Toggle to Register */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          {t.noAccount}{" "}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            disabled={state.isLoading}
          >
            {t.createAccount}
          </button>
        </p>
      </div>

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">{t.loginButtonLoading}</span>
          </div>
        </div>
      )}
    </div>
  );
}
