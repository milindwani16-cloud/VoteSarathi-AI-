
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsAnalysis } from "../types";

// Initialize Gemini client directly on the frontend
// The platform handles the injection of the GEMINI_API_KEY
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function chatWithAI(message: string, history: any[], language: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
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
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
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
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts }],
      config: {
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Generate spoken audio for this text in ${languageCode}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || 'audio/mpeg';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
}
