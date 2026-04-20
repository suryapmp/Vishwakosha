import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateTechnicalTerm(word: string): Promise<{ translation: string; explanation: string } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the technical term "${word}" to Kannada. 
      Provide a JSON response with two fields: 
      "translation" (the Kannada word/phrase) and 
      "explanation" (a brief 1-sentence technical explanation in Kannada).`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || '{}');
    if (data.translation && data.explanation) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return null;
  }
}
