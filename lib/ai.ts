import { GoogleGenerativeAI } from "@google/generative-ai";
import { UrgencyLevelType, LanguageType } from "@/lib/validations";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface SymptomAnalysis {
  possibleConditions: string[];
  urgencyLevel: UrgencyLevelType;
  recommendations: string[];
  riskScore: number;
  emergencyFlags: string[];
}

export interface AIResponse {
  text: string;
  language: LanguageType;
  confidence: number;
}

// Analyze symptoms using Gemini AI
export async function analyzeSymptoms(
  symptoms: string,
  language: LanguageType = "EN"
): Promise<SymptomAnalysis> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      language === "BN"
        ? `আপনি একজন অভিজ্ঞ চিকিৎসক। রোগী বলেছেন: "${symptoms}"

      অনুগ্রহ করে বিশ্লেষণ করুন:
      1. সম্ভাব্য রোগ (সর্বোচ্চ ৫টি)
      2. জরুরিতার মাত্রা (LOW/MEDIUM/HIGH/EMERGENCY)
      3. সুপারিশ (সর্বোচ্চ ৩টি)
      4. ঝুঁকির স্কোর (০-১০)
      5. জরুরি সতর্কতা (যদি থাকে)

      JSON ফরম্যাটে উত্তর দিন।`
        : `You are an experienced medical professional. The patient reports: "${symptoms}"

      Please analyze and provide:
      1. Possible conditions (max 5)
      2. Urgency level (LOW/MEDIUM/HIGH/EMERGENCY)
      3. Recommendations (max 3)
      4. Risk score (0-10)
      5. Emergency flags (if any)

      Respond in JSON format only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      const analysis = JSON.parse(text) as SymptomAnalysis;

      // Validate and normalize the response
      return {
        possibleConditions: analysis.possibleConditions || [],
        urgencyLevel: mapUrgencyLevel(analysis.urgencyLevel),
        recommendations: analysis.recommendations || [],
        riskScore: Math.min(Math.max(analysis.riskScore || 0, 0), 10),
        emergencyFlags: analysis.emergencyFlags || [],
      };
    } catch (parseError) {
      // Fallback analysis if JSON parsing fails
      return {
        possibleConditions: ["Analysis pending"],
        urgencyLevel: "MEDIUM",
        recommendations: ["Consult healthcare provider"],
        riskScore: 5,
        emergencyFlags: [],
      };
    }
  } catch (error) {
    console.error("Gemini AI analysis error:", error);

    // Return safe fallback
    return {
      possibleConditions: [
        "Unable to analyze - please consult healthcare provider",
      ],
      urgencyLevel: "MEDIUM",
      recommendations: ["Contact medical professional for proper diagnosis"],
      riskScore: 5,
      emergencyFlags: [],
    };
  }
}

// Generate health education content
export async function generateHealthEducation(
  topic: string,
  language: LanguageType = "EN"
): Promise<AIResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      language === "BN"
        ? `স্বাস্থ্য শিক্ষা বিষয়ে একটি সহজ ও বোধগম্য নিবন্ধ লিখুন。
      
      বিষয়: ${topic}
      
      নির্দেশনা:
      - সহজ ভাষা ব্যবহার করুন
      - গ্রামীণ মানুষের জন্য উপযুক্ত
      - বাস্তব উদাহরণ দিন
      - ৩০০-৫০০ শব্দের মধ্যে রাখুন`
        : `Write a simple and understandable health education article.
      
      Topic: ${topic}
      
      Guidelines:
      - Use simple language
      - Suitable for rural communities
      - Include practical examples
      - Keep between 300-500 words`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text: text,
      language,
      confidence: 0.9,
    };
  } catch (error) {
    console.error("Health education generation error:", error);

    return {
      text:
        language === "BN"
          ? "দুঃখিত, বর্তমানে এই তথ্য তৈরি করা যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
          : "Sorry, unable to generate content at the moment. Please try again later.",
      language,
      confidence: 0.1,
    };
  }
}

// Emergency detection
export async function detectEmergency(
  symptoms: string,
  language: LanguageType = "EN"
): Promise<{ isEmergency: boolean; emergencyType?: string; message: string }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      language === "BN"
        ? `জরুরি চিকিৎসা সংক্রান্ত সতর্কতা বিশ্লেষণ করুন。
      
      লক্ষণসমূহ: ${symptoms}
      
      নিম্নলিখিত জরুরি অবস্থার মধ্যে কোনটি থাকলে "EMERGENCY" বলুন:
      - স্ট্রোক (চেহারা বিকৃতি, কথা বলতে না পারা, হাত-পা অবশ হওয়া)
      - হার্ট অ্যাটাক (বুকে ব্যথা, শ্বাসকষ্ট)
      - গুরুতর আঘাত
      - অজ্ঞান হওয়া
      - খুব বেশি রক্তক্ষরণ
      - শ্বাস নিতে না পারা
      - গর্ভাবস্থার জটিলতা
      
      JSON ফরম্যাটে উত্তর দিন:
      {"isEmergency": true/false, "emergencyType": "বর্ণনা", "message": "সতর্কতার বার্তা"}`
        : `Analyze for emergency medical situations.
      
      Symptoms: ${symptoms}
      
      Consider these emergency conditions:
      - Stroke (facial drooping, speech difficulty, arm weakness)
      - Heart attack (chest pain, shortness of breath)
      - Severe injuries
      - Unconsciousness
      - Severe bleeding
      - Breathing difficulties
      - Pregnancy complications
      
      Respond in JSON format:
      {"isEmergency": true/false, "emergencyType": "description", "message": "warning message"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text);
      return {
        isEmergency: analysis.isEmergency || false,
        emergencyType: analysis.emergencyType,
        message: analysis.message || "",
      };
    } catch (parseError) {
      return {
        isEmergency: false,
        message:
          language === "BN"
            ? "বিশ্লেষণ সম্পূর্ণ হয়নি। অনুগ্রহ করে চিকিৎসকের সাথে যোগাযোগ করুন।"
            : "Analysis incomplete. Please contact medical professional.",
      };
    }
  } catch (error) {
    console.error("Emergency detection error:", error);

    return {
      isEmergency: false,
      message:
        language === "BN"
          ? "জরুরি সনাক্তকরণ সিস্টেমে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি জরুরি সেবায় যোগাযোগ করুন।"
          : "Emergency detection system error. Please contact emergency services directly.",
    };
  }
}

// Voice interaction processing
export async function processVoiceInput(
  audioText: string,
  language: LanguageType = "EN"
): Promise<AIResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      language === "BN"
        ? `আপনি একজন সহায়ক স্বাস্থ্য সহকারী। ব্যবহারকারী বলেছেন: "${audioText}"
      
      উপযুক্ত স্বাস্থ্য পরামর্শ বা তথ্য প্রদান করুন।
      সহজ ও বোধগম্য ভাষায় উত্তর দিন।`
        : `You are a helpful health assistant. The user said: "${audioText}"
      
      Provide appropriate health advice or information.
      Respond in simple, easy-to-understand language.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      language,
      confidence: 0.85,
    };
  } catch (error) {
    console.error("Voice processing error:", error);

    return {
      text:
        language === "BN"
          ? "দুঃখিত, আপনার কথা বুঝতে পারিনি। আবার চেষ্টা করুন।"
          : "Sorry, I did not understand. Please try again.",
      language,
      confidence: 0.1,
    };
  }
}

// Helper function to map urgency levels
function mapUrgencyLevel(level: string): UrgencyLevelType {
  const normalized = level.toUpperCase();
  if (["LOW", "MEDIUM", "HIGH", "EMERGENCY"].includes(normalized)) {
    return normalized as UrgencyLevelType;
  }
  return "MEDIUM";
}

// General health chat functionality
export async function chat(
  message: string,
  context: string[] = []
): Promise<AIResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const contextStr =
      context.length > 0
        ? `\n\nPrevious conversation context:\n${context.join("\n")}`
        : "";

    const prompt = `You are ShasthoBondhu AI, a helpful healthcare assistant for Bangladesh. You provide general health information, advice, and guidance.

User message: "${message}"${contextStr}

Guidelines:
- Provide general health information and advice
- Be encouraging and supportive
- Recommend consulting healthcare professionals for serious concerns
- Use simple, clear language
- Consider local context and practices
- If asked about specific symptoms, suggest consulting a doctor
- Be culturally sensitive to Bangladeshi healthcare practices

Respond helpfully and professionally.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text: text,
      language: "EN", // Default to English, can be enhanced to detect language
      confidence: 0.8,
    };
  } catch (error) {
    console.error("Chat processing error:", error);

    return {
      text: "I apologize, but I'm having trouble processing your request right now. Please try again or consult a healthcare professional for immediate concerns.",
      language: "EN",
      confidence: 0.1,
    };
  }
}

// AI Service object for compatibility
export const aiService = {
  chat,
  analyzeSymptoms,
  processVoiceInput,
  predictDiseaseTrends,
};

// Predict disease trends
export async function predictDiseaseTrends(
  region: string,
  timeFrame: string = "30 days"
): Promise<{
  prediction: string;
  confidence: number;
  recommendations: string[];
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze disease trend predictions for ${region} over the next ${timeFrame}.
    
    Consider:
    - Seasonal patterns
    - Current health data
    - Environmental factors
    - Population density
    - Healthcare access
    
    Provide predictions and preventive recommendations in JSON format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text);
      return {
        prediction: analysis.prediction || "Stable health conditions expected",
        confidence: analysis.confidence || 0.7,
        recommendations: analysis.recommendations || [
          "Maintain general hygiene",
        ],
      };
    } catch (parseError) {
      return {
        prediction: "Analysis unavailable - consult local health authorities",
        confidence: 0.5,
        recommendations: ["Follow standard health guidelines"],
      };
    }
  } catch (error) {
    console.error("Disease trend prediction error:", error);

    return {
      prediction: "Unable to generate predictions at this time",
      confidence: 0.1,
      recommendations: ["Contact local health department for updates"],
    };
  }
}
