import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 
// NOTE: In a real app, never expose API keys on the client. 
// This is a demo frontend-only architecture.

const ai = new GoogleGenAI({ apiKey });

// 1. Chatbot (Complex queries - Thinking Mode)
export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  if (!apiKey) return "API Key missing.";
  
  try {
    const model = ai.models.generateContent;
    // Using gemini-3-pro-preview for deep reasoning/teaching
    const response = await model({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Moderate budget for responsiveness vs depth
        systemInstruction: "You are PREP AI, a friendly, energetic, and highly intelligent tutor. Help students understand complex topics simply. Use analogies.",
      }
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error", error);
    return "I'm having trouble connecting to the brain. Try again later.";
  }
};

// 2. Fast Explanations for Quiz (Low Latency)
export const getQuickExplanation = async (question: string, answer: string) => {
  if (!apiKey) return "Explanation unavailable.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Low latency model
      contents: `Explain why '${answer}' is the correct answer for the question: '${question}'. Keep it under 50 words.`,
    });
    return response.text;
  } catch (error) {
    return "Could not fetch explanation.";
  }
};

// 3. Search Resources (Grounding)
export const searchStudyResources = async (query: string) => {
  if (!apiKey) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find study resources, syllabus details, or recent exam news for: ${query}`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    return {
      text: response.text,
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Search Error", error);
    return null;
  }
};

// 4. Image Generation (Visual Aids)
export const generateConceptImage = async (prompt: string, resolution: '1K' | '2K' = '1K') => {
  if (!apiKey) throw new Error("API Key missing");
  
  // Using gemini-3-pro-image-preview for high quality
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
        parts: [{ text: prompt }]
    },
    config: {
        imageConfig: {
            imageSize: resolution,
            aspectRatio: "1:1"
        }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
      }
  }
  return null;
};

// 5. Image Editing (Modify charts/diagrams)
export const editStudyImage = async (base64Image: string, prompt: string) => {
   if (!apiKey) throw new Error("API Key missing");

   // Strip prefix if present for API
   const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

   const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash-image',
       contents: {
           parts: [
               { inlineData: { mimeType: 'image/png', data: base64Data } },
               { text: prompt }
           ]
       }
   });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
      }
  }
  return null;
}

// 6. Generate Realistic Quiz Questions
export interface AIQuizQuestion {
    question_id: string;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correct_answer: "A" | "B" | "C" | "D";
    explanation: string;
}

export const generateAIQuizQuestions = async (exam: string, subject: string, topic: string): Promise<AIQuizQuestion[] | null> => {
    if (!apiKey) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 10 realistic, exam-level multiple choice questions for ${exam} exam, Subject: ${subject}, Topic: ${topic}.
            Ensure the difficulty matches the exam (e.g. JEE = Hard, NEET = Moderate).
            Options must be meaningful values, not placeholders.
            Return ONLY a raw JSON array. No markdown formatting.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question_id: { type: Type.STRING },
                            question: { type: Type.STRING },
                            options: {
                                type: Type.OBJECT,
                                properties: {
                                    A: { type: Type.STRING },
                                    B: { type: Type.STRING },
                                    C: { type: Type.STRING },
                                    D: { type: Type.STRING },
                                }
                            },
                            correct_answer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
                            explanation: { type: Type.STRING },
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as AIQuizQuestion[];
        }
        return null;
    } catch (e) {
        console.error("Quiz Gen Error", e);
        return null;
    }
}
