
import { GoogleGenAI } from "@google/genai";

const FALLBACK_QUOTES = [
  "The Magic of Friendship is always with you!",
  "Friendship is magic!",
  "You got this, friend!",
  "Keep shining bright!",
  "Magic awaits the curious!"
];

export const fetchFriendshipQuote = async (): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  // If no API key, return a random fallback quote
  if (!apiKey) {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }

  try {
    // Create a new instance inside the function to ensure the most up-to-date API key is used
    const ai = new GoogleGenAI({ apiKey });
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
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};
