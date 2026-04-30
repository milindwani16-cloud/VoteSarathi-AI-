
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsAnalysis } from "../types";

// Lazy-initialized AI client to prevent startup crashes if key is missing initially
let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it in the Secrets panel in Settings.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function chatWithAI(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[], language: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [
          { googleSearch: {} }
        ],
        systemInstruction: `You are VoteSaathi AI, a multi-language Indian Election Assistant. 
        Your goal is to provide accurate, up-to-date information about the Indian voting process.
        Respond in ${language} language.
        
        CRITICAL VOICE GUIDELINES:
        1. Speak in simple, clear, and relatively short sentences.
        2. Make responses natural and conversational for voice output.
        3. Avoid complex markdown, long lists, or heavy punctuation that sounds awkward when spoken.
        4. Use the Google Search tool when you need to verify current election dates, news, or specific constituency details.
        5. Always encourage democratic participation with a friendly, helpful tone.`,
      }
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Something went wrong. Please check your connectivity or API key.";
  }
}

/**
 * Streaming version of chat for better efficiency and UX
 */
export async function* chatWithAIStream(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[], language: string) {
  const ai = getAI();
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [
          { googleSearch: {} }
        ],
        systemInstruction: `You are VoteSaathi AI, a multi-language Indian Election Assistant.
        Respond in ${language} language.
        
        CRITICAL VOICE GUIDELINES:
        1. Speak in simple, clear, and relatively short sentences.
        2. Use natural conversational language easy for text-to-speech.
        3. Avoid dense blocks of text or complex formatting.
        4. Use Google Search for real-time verification of election facts.`,
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    yield "Something went wrong while generating the response.";
  }
}

export async function verifyNews(content: string, language: string, imageBase64?: string): Promise<NewsAnalysis> {
  const ai = getAI();
  try {
    const contents: any[] = [`Analyze the following election-related message/news for truthfulness: "${content || 'Analyze the provided image.'}"`];
    
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1] // Remove prefix if present
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents.map(c => typeof c === 'string' ? { role: 'user', parts: [{ text: c }] } : { role: 'user', parts: [c] }),
      config: {
        tools: [
          { googleSearch: {} }
        ],
        systemInstruction: "You are a professional fact-checker for Indian Elections. Use the provided Google Search tool to verify information before generating a verdict. Be objective and provide clear evidence.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              enum: ["True", "Fake", "Misleading"],
              description: "The verdict on the news content."
            },
            explanation: {
              type: Type.STRING,
              description: "A simple explanation of why this news is True, Fake, or Misleading."
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score from 0 to 1."
            },
            sources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Names of credible sources that confirm or debunk this."
            }
          },
          required: ["verdict", "explanation", "confidence", "sources"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      verdict: parsed.verdict || "Misleading",
      explanation: parsed.explanation || "No explanation provided.",
      confidence: parsed.confidence || 0,
      sources: parsed.sources || ["Official Election Sources"]
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

export async function generateSpeech(text: string, tone: 'friendly' | 'professional' | 'clear' = 'professional') {
  const ai = getAI();
  try {
    const tonePrompts: Record<string, string> = {
      friendly: "Say cheerfully and warmly: ",
      professional: "Say formally and clearly: ",
      clear: "Say slowly and distinctly: ",
    };

    const voiceName = tone === 'friendly' ? 'Kore' : (tone === 'clear' ? 'Zephyr' : 'Charon');

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${tonePrompts[tone] || ""}${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
}
