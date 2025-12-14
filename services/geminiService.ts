import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts text from an image (Base64 string) using Gemini Vision capabilities.
 */
export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Extract all visible text from this image exactly as it appears. Do not add any conversational filler, just return the raw extracted text. If no text is found, return 'NO_TEXT_FOUND'."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from API");
    }

    return text.trim();
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from the image.");
  }
};

/**
 * Translates text into the target language using Gemini.
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const prompt = `Translate the following text into ${targetLanguage}. 
    Ensure the translation is accurate and natural. 
    Do not add explanations or notes.
    
    Text to translate:
    """
    ${text}
    """`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const translated = response.text;
    if (!translated) {
      throw new Error("No translation returned from API");
    }

    return translated.trim();
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Failed to translate text.");
  }
};
