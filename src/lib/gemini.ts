import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/**
 * Robust wrapper for Gemini API calls to handle transient errors,
 * rate limits, and timeouts with exponential backoff.
 */
async function callGeminiWithRetry(params: any, retries = 3): Promise<GenerateContentResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      // Create a new instance if needed or just use the global one
      // The skill suggests creating a new instance before call for updated keys
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await genAI.models.generateContent(params);
      
      if (!response.text) {
        throw new Error("Empty response from AI model.");
      }
      
      return response;
    } catch (err: any) {
      console.warn(`Gemini Attempt ${i + 1} failed:`, err.message);
      
      const isRetryable = 
        err.message?.includes("RESOURCE_EXHAUSTED") || 
        err.message?.includes("429") ||
        err.message?.includes("503") ||
        err.message?.includes("fetch") ||
        err.message?.includes("timeout") ||
        err.message?.includes("Empty response");

      if (i === retries - 1 || !isRetryable) {
        throw err;
      }
      
      // Exponential backoff: 2s, 4s, 8s...
      await new Promise(res => setTimeout(res, Math.pow(2, i + 1) * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function generateQuizQuestion(): Promise<QuizQuestion> {
  const prompt = `Generate a challenging multiple-choice question about USA Olympic or USA Paralympic historical team stats and achievements. 
  
  CRITICAL RULES:
  1. NO ATHLETE NAMES: Do not mention any specific athletes, individuals, or likenesses. Focus strictly on team achievements, medal counts, or event milestones (e.g. "In what year...", "How many gold medals did Team USA win in...").
  2. BALANCE: Randomly choose between a USA Olympic fact and a USA Paralympic fact. Over time, there should be an even distribution.
  3. ACCURACY: Ensure the facts are strictly accurate for Team USA.
  4. DATA: Use only team-level statistics and verified historical data.
  
  Reward: 5 Flames.`;

  try {
    const response = await callGeminiWithRetry({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 4 options"
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API Error (Quiz):", error);
    if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("429")) {
      throw new Error("The AI is currently processing high traffic. Please try again in a few moments.");
    }
    throw error;
  }
}

export async function generateNewLines(day: number, sport: string, opponent: string) {
  const prompt = `You are the LA28 Vibe-Maker AI. We are currently on DAY ${day} of the 17-day Olympic cycle.
  IMPORTANT: The prediction must be for TEAM USA in ${sport} on Day ${day}.
  
  GENDER DIFFERENTIATION: 
  - Ensure the "sport" field explicitly mentions "Men's" or "Women's" if applicable (e.g., "Men's Basketball").

  DATA STRATEGY - MATCH VS FIELD EVENTS:
  1. MATCH EVENTS (Traditional 1-vs-1 team matches like Basketball, Soccer, Volleyball, Flag Football, Baseball, Cricket, Lacrosse):
     - Opponent: ${opponent || 'TBD'}.
     - Format for Opponent field: ONLY the country name (e.g., "France", "Japan", "Serbia"). Do NOT include "USA vs" in the opponent field.
     - Metrics: Use Skill/Defense (Ace Serves, Blocks, Interceptions, Runs, Wickets) or Game Stats.
  2. FIELD/INDIVIDUAL EVENTS (Multi-competitor events like Individual Swimming, Athletics, Golf, Gymnastics Apparatus Finals, Squash, Skateboarding, Surfing):
     - Opponent: Leave the 'opponent' field in the JSON response EMPTY string "".
     - Metrics: Use RANK/PLACEMENT (e.g., "Final Podium Rank", "Overall Event Placement", "Execution Score").
  
  Implementation Rules:
  1. Lines: Use '.5' lines. 
  2. RANK LOGIC: For 'Placement' or 'Ranking', Rank 1 is the best. UI explains Lower = Better.
  3. The 'category' field must be one of: 'Placement', 'Medals', 'Ranking', 'Continuous', 'Set-Based', 'Judged', 'Timed', 'Innings', 'Combat', 'Points'.
  4. The 'sport' field must be '${sport}'.
  5. The 'opponent' field: ${opponent ? `Include JUST the opponent country name like 'France'.` : `Leave empty "".`}
  6. Historical Trends:
     - 'history' array: exactly 5 data points of Team USA performance ({ year: number, value: number }) in previous cycles.
     - 'headToHead' array: exactly 5 data points of USA vs ${opponent || 'the field'}. If no direct head-to-head history exists, return empty array.
  7. vibeInsight: A "MISSION BRIEF" focusing on Team USA strategy. Max 120 chars.
  8. OLYMPIC TIMING: All 'year' values in 'history' and 'headToHead' MUST correspond to actual Summer Olympic years (e.g., 2024, 2020, 2016, 2012, 2008, 2004). Do NOT use years like 2018, 2022, 2023, 2025 or 2026. If a sport was not in the Olympics during those years, provide performance stats as if they were competing in those specific Olympic cycle years to maintain data consistency.`;

  try {
    const response = await callGeminiWithRetry({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sport: { type: Type.STRING },
              opponent: { type: Type.STRING },
              category: { type: Type.STRING },
              metric: { type: Type.STRING },
              line: { type: Type.NUMBER },
              day: { type: Type.NUMBER },
              history: { 
                type: Type.ARRAY,
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    year: { type: Type.NUMBER },
                    value: { type: Type.NUMBER }
                  },
                  required: ["year", "value"]
                }
              },
              headToHead: { 
                type: Type.ARRAY,
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    year: { type: Type.NUMBER },
                    value: { type: Type.NUMBER }
                  },
                  required: ["year", "value"]
                }
              },
              vibeInsight: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["sport", "opponent", "category", "metric", "line", "day", "history", "vibeInsight", "icon"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API Error (Lines):", error);
    if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("429")) {
      throw new Error("The AI is currently processing high traffic. Please try again in a few moments.");
    }
    throw error;
  }
}
