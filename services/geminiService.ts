
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Complex query handler with Thinking Mode
export const getComplexAnalysis = async (query: string, context: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this complex scenario for a HiredPath user. Context: ${JSON.stringify(context)}. Query: ${query}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text;
};

// Low-latency response handler
export const getFastResponse = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
  });
  return response.text;
};

// Image analysis service
export const analyzeImage = async (base64Image: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

// Image editing service (Nano Banana)
export const editImage = async (base64Image: string, editPrompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: editPrompt }
      ]
    }
  });
  
  // Find the image part in the response
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// Chatbot service
export const getChatbotResponse = async (history: { role: string, parts: { text: string }[] }[], message: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are HiredAI, an elite career mentor for HiredPath. You help students get hired at companies like Google and Meta. Be professional, punchy, and highly strategic."
    }
  });
  
  return response.text;
};

export const getAssessmentQuestions = async (domain: string, skills: string[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 high-quality multiple choice questions for a student applying for a ${domain} role with skills in ${skills.join(', ')}. Include 4 options and the correct answer for each.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "answer"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getCourseSuggestions = async (domain: string, gaps: string[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For a student aiming for a ${domain} role with skill gaps in ${gaps.join(', ')}, suggest 3 specific training modules. Each should have a title, duration, and 3 bullet points of what's covered.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.STRING },
            curriculum: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "duration", "curriculum"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getSmartSuggestions = async (context: string, data: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Role: ${context}. Data: ${JSON.stringify(data)}. Generate 3 actionable "Strategic Suggestions". For each, include: title, suggestion, priority (High/Medium/Low), actionLabel (the button text), and targetView (a simple string representing the view to navigate to).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            actionLabel: { type: Type.STRING },
            targetView: { type: Type.STRING }
          },
          required: ["title", "suggestion", "priority", "actionLabel", "targetView"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getLiveMarketIntel = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze current job market trends and provide specific career "Suggestions" for: "${query}". Include salary estimates, trending skills, and major hiring companies for late 2024/2025. Be concise and professional.`,
    config: {
      tools: [{ googleSearch: {} }]
    },
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || []
  };
};

export const getNearbyOpportunities = async (lat: number, lng: number) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What major technology companies or corporate offices are located near these coordinates? Provide a brief description for each.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.maps).filter(Boolean) || []
  };
};

export const getPlatformInsights = async () => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 high-level "Strategic Growth Insights" for an investor pitch about an AI-driven placement platform called HiredPath. Focus on: TAM expansion, Moat strengthening, and Revenue optimization.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            insight: { type: Type.STRING },
            impact: { type: Type.STRING }
          },
          required: ["title", "insight", "impact"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getSkillSuggestions = async (domain: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For a student aiming for a ${domain} role, suggest 5 trending or essential skills they should declare. Return as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const predictBatchSuccess = async (stats: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze these platform stats and market context: ${JSON.stringify(stats)}. Predict the placement rate for the next quarter and estimate total placement revenue. Provide deep reasoning and specific institutional recommendations.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text;
};

export const getConceptExplanation = async (concept: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the technical concept of "${concept}" for a job interview. Provide a clear explanation and one "Pro Interview Tip".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          interviewTip: { type: Type.STRING }
        },
        required: ["explanation", "interviewTip"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getNegotiationTactics = async (offer: string, score: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `A student has received a job offer: "${offer}". Their HiredPath Readiness Score is ${score}%. Suggest professional negotiation tactics to increase the compensation or benefits based on their high readiness score. Be specific and persuasive.`,
  });
  return response.text;
};

export const getBatchRiskAnalysis = async (batchData: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this college batch data: ${JSON.stringify(batchData)}. Identify the top 3 'At Risk' patterns and suggest institutional interventions.`,
    config: {
      thinkingConfig: { thinkingBudget: 10000 }
    }
  });
  return response.text;
};
