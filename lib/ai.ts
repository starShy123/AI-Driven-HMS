import { GoogleGenerativeAI } from "@google/generative-ai";
import { pipeline } from "@huggingface/transformers";
import { UrgencyLevelType, LanguageType } from "@/lib/validations";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize zero-shot classifier (lazy loaded)
let zeroShotClassifier: any = null;

// Initialize transformer pipeline for zero-shot classification
async function getZeroShotClassifier() {
  if (!zeroShotClassifier) {
    try {
      zeroShotClassifier = await pipeline(
        "zero-shot-classification",
        "facebook/bart-large-mnli"
      );
    } catch (error) {
      console.error("Failed to load zero-shot classifier:", error);
      return null;
    }
  }
  return zeroShotClassifier;
}

// Initialize text classification pipeline for extracting structured data
let textClassifier: any = null;
async function getTextClassifier() {
  if (!textClassifier) {
    try {
      textClassifier = await pipeline(
        "text-classification",
        "cardiffnlp/twitter-roberta-base-sentiment-latest"
      );
    } catch (error) {
      console.error("Failed to load text classifier:", error);
      return null;
    }
  }
  return textClassifier;
}

// Zero-shot classification functions
async function classifyUrgencyLevel(text: string): Promise<UrgencyLevelType> {
  try {
    const classifier = await getZeroShotClassifier();
    if (!classifier) return "MEDIUM";

    const result = await classifier(text, [
      "low urgency medical condition",
      "medium urgency medical condition",
      "high urgency medical condition",
      "emergency medical situation"
    ]);

    const topLabel = result[0].label.toLowerCase();
    if (topLabel.includes("emergency")) return "EMERGENCY";
    if (topLabel.includes("high")) return "HIGH";
    if (topLabel.includes("medium")) return "MEDIUM";
    if (topLabel.includes("low")) return "LOW";
    return "MEDIUM";
  } catch (error) {
    console.error("Urgency classification error:", error);
    return "MEDIUM";
  }
}

async function validateEmergencyDetection(
  symptoms: string,
  geminiResponse: string
): Promise<boolean> {
  try {
    const classifier = await getZeroShotClassifier();
    if (!classifier) return false;

    const combinedText = `${symptoms} ${geminiResponse}`;
    const result = await classifier(combinedText, [
      "emergency medical situation requiring immediate attention",
      "non-emergency medical condition"
    ]);

    return result[0].label.toLowerCase().includes("emergency");
  } catch (error) {
    console.error("Emergency validation error:", error);
    return false;
  }
}

async function classifyRecommendations(text: string): Promise<string[]> {
  try {
    const classifier = await getZeroShotClassifier();
    if (!classifier) return ["Consult healthcare provider"];

    const result = await classifier(text, [
      "rest and monitor symptoms",
      "seek immediate medical attention",
      "consult healthcare provider",
      "use over-the-counter medications",
      "lifestyle changes",
      "preventive measures"
    ]);

    // Return top 2-3 recommendations based on confidence scores
    const recommendations = (result as any[])
      .filter((item: any) => item.score > 0.3)
      .slice(0, 3)
      .map((item: any) => {
        const label = item.label;
        // Map back to readable recommendations
        switch (label) {
          case "rest and monitor symptoms": return "Rest and monitor your symptoms";
          case "seek immediate medical attention": return "Seek immediate medical attention";
          case "consult healthcare provider": return "Consult a healthcare provider";
          case "use over-the-counter medications": return "Consider over-the-counter medications";
          case "lifestyle changes": return "Make appropriate lifestyle changes";
          case "preventive measures": return "Take preventive measures";
          default: return label;
        }
      });

    return recommendations.length > 0 ? recommendations : ["Consult healthcare provider"];
  } catch (error) {
    console.error("Recommendations classification error:", error);
    return ["Consult healthcare provider"];
  }
}

// Transformer pipeline to process Gemini response and create structured output
async function processGeminiResponseWithTransformer(
  geminiResponse: string,
  originalSymptoms: string
): Promise<SymptomAnalysis> {
  try {
    // First try to parse as JSON directly
    try {
      const parsed = JSON.parse(geminiResponse) as SymptomAnalysis;
      // Validate the parsed response has required fields
      if (parsed.possibleConditions && parsed.urgencyLevel && parsed.recommendations) {
        return {
          possibleConditions: Array.isArray(parsed.possibleConditions) ? parsed.possibleConditions : [],
          urgencyLevel: mapUrgencyLevel(parsed.urgencyLevel || "MEDIUM"),
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          riskScore: typeof parsed.riskScore === "number" ? Math.min(Math.max(parsed.riskScore, 0), 10) : 5,
          emergencyFlags: Array.isArray(parsed.emergencyFlags) ? parsed.emergencyFlags : []
        };
      }
    } catch (jsonError) {
      // JSON parsing failed, use transformer pipeline to extract information
      console.log("JSON parsing failed, using transformer pipeline");
    }

    // Use transformer pipeline to extract structured information from text
    const classifier = await getZeroShotClassifier();
    if (!classifier) {
      throw new Error("Transformer pipeline not available");
    }

    // Extract possible conditions using pattern matching and classification
    const conditions = extractPossibleConditions(geminiResponse);

    // Classify urgency level from the entire response
    const urgencyResult = await classifier(`${originalSymptoms} ${geminiResponse}`, [
      "low urgency medical condition",
      "medium urgency medical condition",
      "high urgency medical condition",
      "emergency medical situation"
    ]);

    let urgencyLevel: UrgencyLevelType = "MEDIUM";
    const topUrgency = (urgencyResult as any[])[0];
    if (topUrgency.label.toLowerCase().includes("emergency")) urgencyLevel = "EMERGENCY";
    else if (topUrgency.label.toLowerCase().includes("high")) urgencyLevel = "HIGH";
    else if (topUrgency.label.toLowerCase().includes("low")) urgencyLevel = "LOW";

    // Extract recommendations
    const recommendations = extractRecommendations(geminiResponse);

    // Calculate risk score based on urgency and content analysis
    const riskScore = calculateRiskScore(urgencyLevel, geminiResponse, originalSymptoms);

    // Extract emergency flags
    const emergencyFlags = extractEmergencyFlags(geminiResponse);

    return {
      possibleConditions: conditions,
      urgencyLevel,
      recommendations,
      riskScore,
      emergencyFlags
    };

  } catch (error) {
    console.error("Transformer pipeline processing error:", error);
    // Return fallback analysis
    return {
      possibleConditions: ["Analysis pending"],
      urgencyLevel: "MEDIUM",
      recommendations: ["Consult healthcare provider"],
      riskScore: 5,
      emergencyFlags: []
    };
  }
}

// Helper functions for information extraction
function extractPossibleConditions(text: string): string[] {
  // Look for common patterns in medical responses
  const patterns = [
    /possible conditions?:?\s*([^.]*?)(?:\d+\.|recommendations|urgency|risk|$)/i,
    /differential diagnosis:?\s*([^.]*?)(?:\d+\.|recommendations|$)/i,
    /may be:?\s*([^.]*?)(?:\d+\.|recommendations|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Split by common separators and clean up
      return match[1]
        .split(/[,;]|\sand\s|or\s/)
        .map(condition => condition.trim())
        .filter(condition => condition.length > 2)
        .slice(0, 5); // Limit to 5 conditions
    }
  }

  // Fallback: look for medical terms
  const medicalTerms = text.match(/\b(cold|flu|fever|infection|allergy|asthma|diabetes|hypertension|stroke|heart|lung|cancer)\b/gi);
  return medicalTerms ? [...new Set(medicalTerms)].slice(0, 5) : ["Common illness"];
}

function extractRecommendations(text: string): string[] {
  const patterns = [
    /recommendations?:?\s*([^.]*?)(?:\d+\.|conditions|urgency|$)/i,
    /should:?\s*([^.]*?)(?:\d+\.|conditions|$)/i,
    /advise:?\s*([^.]*?)(?:\d+\.|conditions|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1]
        .split(/[,;]|\sand\s/)
        .map(rec => rec.trim())
        .filter(rec => rec.length > 5)
        .slice(0, 3);
    }
  }

  return ["Consult healthcare provider"];
}

function calculateRiskScore(urgencyLevel: UrgencyLevelType, text: string, symptoms: string): number {
  let score = 5; // Base score

  // Adjust based on urgency level
  switch (urgencyLevel) {
    case "LOW": score -= 2; break;
    case "HIGH": score += 2; break;
    case "EMERGENCY": score += 3; break;
  }

  // Adjust based on keywords in symptoms and response
  const highRiskKeywords = /\b(severe|critical|life.threatening|intense|unbearable|emergency)\b/i;
  const lowRiskKeywords = /\b(mild|slight|minor|occasional)\b/i;

  if (highRiskKeywords.test(text) || highRiskKeywords.test(symptoms)) score += 2;
  if (lowRiskKeywords.test(text) || lowRiskKeywords.test(symptoms)) score -= 1;

  return Math.min(Math.max(score, 0), 10);
}

function extractEmergencyFlags(text: string): string[] {
  const emergencyPatterns = [
    /\b(stroke|heart.attack|cardiac.arrest|sepsis|shock|unconsciousness|severe.bleeding|breathing.difficulty)\b/gi,
    /\b(emergency|critical|life.threatening|immediate.attention)\b/gi
  ];

  const flags: string[] = [];
  for (const pattern of emergencyPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      flags.push(...matches);
    }
  }

  return [...new Set(flags)].slice(0, 3);
}

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

      Respond with a JSON object in this exact format:
      {"possibleConditions": ["condition1", "condition2"], "urgencyLevel": "MEDIUM", "recommendations": ["recommendation1", "recommendation2"], "riskScore": 5, "emergencyFlags": ["flag1"]}`
        : `You are an experienced medical professional. The patient reports: "${symptoms}"

      Analyze and respond with a JSON object in this exact format:
      {"possibleConditions": ["condition1", "condition2"], "urgencyLevel": "MEDIUM", "recommendations": ["recommendation1", "recommendation2"], "riskScore": 5, "emergencyFlags": ["flag1"]}`;

    let text = "";
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      text = response?.text?.() || "";
    } catch (apiError) {
      console.error("Google AI API error:", apiError);
      // Return generic fallback when API fails
      text = JSON.stringify({
        possibleConditions: ["Analysis temporarily unavailable"],
        urgencyLevel: "MEDIUM",
        recommendations: ["Please consult a healthcare professional"],
        riskScore: 5,
        emergencyFlags: [],
      });
    }

    // Use transformer pipeline to process Gemini response and create structured output
    try {
      const analysis = await processGeminiResponseWithTransformer(text, symptoms);

      // Additional enhancement with zero-shot classification for validation
      const enhancedUrgencyLevel = await classifyUrgencyLevel(
        `${symptoms} ${text}`
      );

      // Use enhanced urgency if it's higher priority
      const finalUrgencyLevel = getHigherPriorityUrgency(analysis.urgencyLevel, enhancedUrgencyLevel);

      // Enhance recommendations if needed
      let finalRecommendations = analysis.recommendations;
      if (finalRecommendations.length === 0 || finalRecommendations[0] === "Consult healthcare provider") {
        const enhancedRecommendations = await classifyRecommendations(text);
        if (enhancedRecommendations.length > 0) {
          finalRecommendations = enhancedRecommendations;
        }
      }

      return {
        possibleConditions: analysis.possibleConditions,
        urgencyLevel: finalUrgencyLevel,
        recommendations: finalRecommendations,
        riskScore: analysis.riskScore,
        emergencyFlags: analysis.emergencyFlags,
      };
    } catch (pipelineError) {
      console.error("Transformer pipeline processing failed:", pipelineError);

      // Fallback: try direct JSON parsing
      try {
        const analysis = JSON.parse(text) as SymptomAnalysis;
        return {
          possibleConditions: Array.isArray(analysis.possibleConditions)
            ? analysis.possibleConditions
            : [],
          urgencyLevel: mapUrgencyLevel(analysis.urgencyLevel || "MEDIUM"),
          recommendations: Array.isArray(analysis.recommendations)
            ? analysis.recommendations
            : ["Consult healthcare provider"],
          riskScore: Math.min(
            Math.max(
              typeof analysis.riskScore === "number" ? analysis.riskScore : 5,
              0
            ),
            10
          ),
          emergencyFlags: Array.isArray(analysis.emergencyFlags)
            ? analysis.emergencyFlags
            : [],
        };
      } catch (jsonError) {
        console.error("JSON parsing also failed:", text);

        // Final fallback with basic classification
        const fallbackUrgency = await classifyUrgencyLevel(symptoms);
        const fallbackRecommendations = await classifyRecommendations("consult healthcare provider");

        return {
          possibleConditions: ["Analysis pending"],
          urgencyLevel: fallbackUrgency,
          recommendations: fallbackRecommendations,
          riskScore: 5,
          emergencyFlags: [],
        };
      }
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

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

    const educationPrompt =
      language === "BN"
        ? `স্বাস্থ্য শিক্ষা বিষয়ে একটি সহজ ও বোধগম্য নিবন্ধ লিখুন।

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

    let text = "";
    try {
      const result = await model.generateContent(educationPrompt);
      const response = result.response;
      text = response?.text?.() || "";
    } catch (apiError) {
      console.error("Google AI API error:", apiError);
      text = language === "BN"
        ? "দুঃখিত, বর্তমানে এই তথ্য তৈরি করা যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
        : "Sorry, unable to generate content at the moment. Please try again later.";
    }

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
      
      Respond with a JSON object in this exact format:
      {"isEmergency": false, "emergencyType": "", "message": "warning message"}`
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

      Respond with a JSON object in this exact format:
      {"isEmergency": false, "emergencyType": "", "message": "warning message"}`;

    let text = "";
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      text = response?.text?.() || "";
    } catch (apiError) {
      console.error("Google AI API error:", apiError);
      // Return safe fallback when API fails
      text = JSON.stringify({
        isEmergency: false,
        emergencyType: "",
        message: "Unable to analyze - please contact emergency services if symptoms are severe",
      });
    }

    try {
      const analysis = JSON.parse(text);

      // Use zero-shot classification to validate emergency detection
      const validatedEmergency = await validateEmergencyDetection(
        symptoms,
        text
      );

      return {
        isEmergency:
          validatedEmergency ||
          (typeof analysis.isEmergency === "boolean"
            ? analysis.isEmergency
            : false),
        emergencyType: analysis.emergencyType || "",
        message: analysis.message || "",
      };
    } catch (parseError) {
      console.error(
        "Failed to parse emergency detection response as JSON:",
        text
      );

      // Fallback with zero-shot validation
      try {
        const isEmergencyValidated = await validateEmergencyDetection(
          symptoms,
          ""
        );
        return {
          isEmergency: isEmergencyValidated,
          message: isEmergencyValidated
            ? language === "BN"
              ? "জরুরি অবস্থা সনাক্ত হয়েছে। দ্রুত চিকিৎসকের সাথে যোগাযোগ করুন।"
              : "Emergency situation detected. Please contact medical professional immediately."
            : language === "BN"
            ? "বিশ্লেষণ সম্পূর্ণ হয়নি। অনুগ্রহ করে চিকিৎসকের সাথে যোগাযোগ করুন।"
            : "Analysis incomplete. Please contact medical professional.",
        };
      } catch (validationError) {
        return {
          isEmergency: false,
          message:
            language === "BN"
              ? "বিশ্লেষণ সম্পূর্ণ হয়নি। অনুগ্রহ করে চিকিৎসকের সাথে যোগাযোগ করুন।"
              : "Analysis incomplete. Please contact medical professional.",
        };
      }
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const voicePrompt =
      language === "BN"
        ? `আপনি একজন সহায়ক স্বাস্থ্য সহকারী। ব্যবহারকারী বলেছেন: "${audioText}"

      উপযুক্ত স্বাস্থ্য পরামর্শ বা তথ্য প্রদান করুন।
      সহজ ও বোধগম্য ভাষায় উত্তর দিন।`
        : `You are a helpful health assistant. The user said: "${audioText}"

      Provide appropriate health advice or information.
      Respond in simple, easy-to-understand language.`;

    let text = "";
    try {
      const result = await model.generateContent(voicePrompt);
      const response = result.response;
      text = response?.text?.() || "";
    } catch (apiError) {
      console.error("Google AI API error:", apiError);
      text = language === "BN"
        ? "দুঃখিত, আপনার কথা বুঝতে পারিনি। আবার চেষ্টা করুন।"
        : "Sorry, I did not understand. Please try again.";
    }

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

// Helper function to get the higher priority urgency level
function getHigherPriorityUrgency(level1: UrgencyLevelType, level2: UrgencyLevelType): UrgencyLevelType {
  const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, EMERGENCY: 4 };
  return priorityOrder[level1] >= priorityOrder[level2] ? level1 : level2;
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

    let text = "";
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      text = response?.text?.() || "";
    } catch (apiError) {
      console.error("Google AI API error:", apiError);
      // Return safe fallback when API fails
      text = "Unable to generate response at this time. Please consult healthcare professionals for important health concerns.";
    }

    // Use zero-shot classification to assess response quality
    try {
      const classifier = await getZeroShotClassifier();
      if (classifier) {
        const qualityCheck = await classifier(text, [
          "helpful medical advice",
          "needs medical attention",
          "general information",
          "inappropriate response",
        ]);
        const topCategory = qualityCheck[0].label;

        // Adjust confidence based on classification
        let confidence = 0.8;
        if (topCategory.includes("needs medical attention")) {
          confidence = 0.9; // High confidence for urgent responses
        } else if (topCategory.includes("inappropriate")) {
          confidence = 0.3; // Low confidence for potentially inappropriate responses
        }

        return {
          text: text,
          language: "EN",
          confidence: confidence,
        };
      }
    } catch (classificationError) {
      console.error("Chat classification error:", classificationError);
    }

    return {
      text: text,
      language: "EN",
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze disease trend predictions for ${region} over the next ${timeFrame}.

    Consider:
    - Seasonal patterns
    - Current health data
    - Environmental factors
    - Population density
    - Healthcare access

    Respond with a JSON object in this exact format:
    {"prediction": "prediction text", "confidence": 0.8, "recommendations": ["recommendation1", "recommendation2"]}`;

    let text = "";
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      text = response?.text?.() || "";
    } catch (apiError) {
      console.error("Google AI API error:", apiError);
      // Return safe fallback when API fails
      text = JSON.stringify({
        prediction: "Unable to generate predictions at this time",
        confidence: 0.1,
        recommendations: ["Contact local health authorities for current information"],
      });
    }

    try {
      const analysis = JSON.parse(text);
      return {
        prediction: analysis.prediction || "Stable health conditions expected",
        confidence:
          typeof analysis.confidence === "number" ? analysis.confidence : 0.7,
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : ["Maintain general hygiene"],
      };
    } catch (parseError) {
      console.error(
        "Failed to parse disease trend prediction response as JSON:",
        text
      );
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
