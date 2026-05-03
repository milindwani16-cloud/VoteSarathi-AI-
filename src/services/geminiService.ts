
import { NewsAnalysis } from "../types";

export async function chatWithAI(message: string, history: any[], language: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, language })
    });
    const data = await response.json();
    return data.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Something went wrong. Please check your connectivity.";
  }
}

export async function* chatWithAIStream(message: string, history: any[], language: string) {
  try {
    const response = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, language })
    });

    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.substring(6);
          if (content === '[DONE]') return;
          try {
            const parsed = JSON.parse(content);
            if (parsed.text) yield parsed.text;
            if (parsed.error) yield `Error: ${parsed.error}`;
          } catch (e) {
            console.error("Error parsing stream chunk:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    yield "Something went wrong while generating the response.";
  }
}

export async function verifyNews(content: string, language: string, imageBase64?: string): Promise<NewsAnalysis> {
  try {
    const response = await fetch('/api/verify-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, imageBase64, language })
    });
    const data = await response.json();
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
export async function generateSpeech(text: string, tone: string = 'professional', languageCode: string = 'en-IN') {
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
