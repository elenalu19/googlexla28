import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateQuizQuestion(): Promise<QuizQuestion> {
  try {
    const prompt = `Generate a challenging multiple-choice question about USA Olympic or USA Paralympic historical team stats and achievements. 
    
    CRITICAL RULES:
    1. NO ATHLETE NAMES: Do not mention any specific athletes, individuals, or likenesses. Focus strictly on team achievements, medal counts, or event milestones (e.g. "In what year...", "How many gold medals did Team USA win in...").
    2. BALANCE: Randomly choose between a USA Olympic fact and a USA Paralympic fact. Over time, there should be an even distribution.
    3. ACCURACY: Ensure the facts are strictly accurate for Team USA.
    4. DATA: Use only team-level statistics and verified historical data.
    
    Reward: 5 Flames.`;

    const response = await ai.models.generateContent({
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
    if (error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini API limit reached. Please check your spending cap at ai.studio/spend.");
    }
    throw error;
  }
}

export async function generateNewLines(day: number, sport: string, opponent: string) {
  try {
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
    7. vibeInsight: A "MISSION BRIEF" focusing on Team USA strategy. Max 120 chars.`;

    const response = await ai.models.generateContent({
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
    if (error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini API limit reached. Please check your spending cap at ai.studio/spend.");
    }
    throw error;
  }
}
