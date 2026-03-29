
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

export const generateVehicleDescription = async (make: string, model: string, year: number): Promise<string> => {
    if (!ai) {
        return "AI features are disabled. Please configure the API Key.";
    }

    const prompt = `Generate a short, professional, and appealing marketing description for a car rental fleet. The car is a ${year} ${make} ${model}. Focus on reliability, comfort, and its key features for renters. Do not use emojis. Keep it under 50 words.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
                // Disable thinking for a faster response on this simple creative task
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        // The `.text` property directly provides the string output.
        return response.text.trim();
    } catch (error) {
        console.error("Error generating vehicle description:", error);
        // Provide a user-friendly error message
        if (error instanceof Error && error.message.includes('API key not valid')) {
            return "AI feature failed: The API key is not valid. Please check your configuration.";
        }
        return "Failed to generate AI description. Please try again later.";
    }
};
