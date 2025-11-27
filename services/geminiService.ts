import { GoogleGenAI, Type } from "@google/genai";
import { MarketTrend, FishType } from "../types";
import { FISH_COLORS } from "../constants";

// Helper to get random item for fallback
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateMarketTrend = async (currentLevel: number): Promise<MarketTrend> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("No API Key found. Using default market trend.");
    return {
      headline: "Local Market Stable",
      bonusColor: FISH_COLORS.RED,
      bonusType: FishType.MEDIUM,
      multiplier: 1.5
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Dynamically build the prompt based on level
  const prompt = `
    You are the 'Fish Market Guru' for a game. Level ${currentLevel}.
    Create a short, funny 1-sentence news headline about fish prices.
    Pick a random color (Red, Blue, Green, Gold, Purple, Teal, Neon, Dark) and a fish size (Tiny, Small, Medium, Large, Giant, Legendary, Mutant) to be in high demand.
    Set a multiplier between 1.5 and 4.0.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            bonusColor: { type: Type.STRING, enum: Object.values(FISH_COLORS) },
            bonusType: { type: Type.STRING, enum: Object.values(FishType) },
            multiplier: { type: Type.NUMBER },
          },
          required: ["headline", "bonusColor", "bonusType", "multiplier"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as MarketTrend;
      return data;
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini Market Gen Error:", error);
    // Fallback
    return {
      headline: "Market Analysis Failed - Prices fluctuating wildly!",
      bonusColor: getRandom(Object.values(FISH_COLORS)),
      bonusType: getRandom(Object.values(FishType)),
      multiplier: 2.0
    };
  }
};