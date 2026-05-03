
import { NewsAnalysis } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini directly in the service
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function chatWithAI(message: string, history: any[], language: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are VoteSaathi AI, a multi-language Indian Election Assistant. Respond in ${language} language. 
        Keep it conversational and friendly. Use simple sentences for easy voice output.`,
      }
    });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Something went wrong. Please check your connectivity.";
  }
}

export async function* chatWithAIStream(message: string, history: any[], language: string) {
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are VoteSaathi AI. Respond in ${language} language.`,
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    yield `Something went wrong: ${error.message}`;
  }
}

export async function verifyNews(content: string, language: string, imageBase64?: string): Promise<NewsAnalysis> {
  try {
    const parts: any[] = [{ text: `Analyze this news for truthfulness in ${language}: "${content || 'provided image'}"` }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ["True", "Fake", "Misleading"] },
            explanation: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["verdict", "explanation", "confidence", "sources"]
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      verdict: data.verdict || "Misleading",
      explanation: data.explanation || "No explanation provided.",
      confidence: data.confidence || 0,
      sources: data.sources || ["Official Election Sources"]
    };
  } catch (error) {
    console.error("Gemini News Error:", error);
    return {
      verdict: "Misleading",
      explanation: "Unable to verify this information at the moment. Please check official sources.",
      confidence: 0,
      sources: ["ECI Official Website"]
    };
  }
}

export async function generateSpeech(text: string, tone: string = 'professional', languageCode: string = 'en') {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone, languageCode })
    });
    const data = await response.json();
    return data.audioContent || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
