
import { GoogleGenAI } from "@google/genai";

export const fetchFriendshipQuote = async (): Promise<string> => {
  try {
    // Create a new instance inside the function to ensure the most up-to-date API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a short, enthusiastic, one-sentence magic or friendship quote inspired by Twilight Sparkle from My Little Pony to encourage a player in an arcade game. Keep it under 15 words.",
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    // Access the text property directly from the response object
    return response.text.trim() || "The Magic of Friendship is always with you!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Friendship is magic!";
  }
};
