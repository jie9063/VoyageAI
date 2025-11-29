import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Itinerary, UserPreferences, NearbyPlace } from "../types";

// Initialize the Gemini API client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the itinerary response
const activitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    time: { type: Type.STRING, description: "Time of the activity (e.g., 09:00 AM)" },
    activity: { type: Type.STRING, description: "Specific Name of the activity, shop, or restaurant" },
    description: { type: Type.STRING, description: "Description including why this place fits the user" },
    location: { type: Type.STRING, description: "Specific Address or Area" },
    type: { 
      type: Type.STRING, 
      enum: ["food", "sightseeing", "relax", "travel", "shopping", "other"],
      description: "Category of the activity" 
    },
    estimatedCost: { type: Type.STRING, description: "Estimated cost per person in NT$" }
  },
  required: ["time", "activity", "description", "location", "type", "estimatedCost"]
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.INTEGER, description: "Day number (1, 2, 3...)" },
    title: { type: Type.STRING, description: "Title for the day" },
    theme: { type: Type.STRING, description: "Main theme of the day" },
    activities: { 
      type: Type.ARRAY, 
      items: activitySchema,
      description: "List of activities for the day, sorted by time"
    }
  },
  required: ["day", "title", "activities"]
};

const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    tripName: { type: Type.STRING, description: "A creative name for this trip" },
    summary: { type: Type.STRING, description: "A summary including budget analysis" },
    estimatedTransportCost: { type: Type.STRING, description: "Estimated round-trip transport cost" },
    totalEstimatedCost: { type: Type.STRING, description: "Total estimated cost for the whole trip" },
    days: { 
      type: Type.ARRAY, 
      items: daySchema,
      description: "Daily breakdown of the itinerary" 
    }
  },
  required: ["destination", "tripName", "summary", "days", "estimatedTransportCost", "totalEstimatedCost"]
};

// Schema for Nearby Places
const nearbyPlaceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['restaurant', 'attraction', 'shop'] },
    description: { type: Type.STRING, description: "Short appealing description" },
    address: { type: Type.STRING, description: "Approximate address" },
    rating: { type: Type.STRING, description: "Rating (e.g. 4.5)" },
    priceLevel: { type: Type.STRING, description: "Cost in NT$" },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["name", "type", "description", "address", "rating", "priceLevel", "tags"]
};

const nearbyResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    places: { type: Type.ARRAY, items: nearbyPlaceSchema }
  },
  required: ["places"]
};

const cleanJson = (text: string): string => {
  // Remove markdown code blocks first
  let content = text.replace(/```json\n?|```/g, '');
  
  // Robustly find the JSON object
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return content.substring(firstBrace, lastBrace + 1);
  }
  
  return content.trim();
};

export const generateItinerary = async (prefs: UserPreferences): Promise<Itinerary> => {
  const prompt = `
    請為我規劃一個去 ${prefs.destination} 的旅遊行程。
    
    【基本資訊】
    出發地: ${prefs.origin}
    天數: ${prefs.duration} 天
    總預算 (每人): NT$ ${prefs.budgetAmount} (包含來回交通費與當地消費)
    旅伴: ${prefs.companions}
    旅遊風格: ${prefs.travelStyle}
    
    【詳細偏好】
    當地交通方式: ${prefs.transportPreference}
    飲食禁忌: ${prefs.dietaryRestrictions || "無"}
    特別願望: ${prefs.specialRequests || "無"}
    興趣: ${prefs.interests.join(", ")}
    
    【規劃要求】
    1. **預算控制**: 
       - 估算從「${prefs.origin}」到「${prefs.destination}」的來回交通成本。
       - 從總預算中扣除交通費，剩餘的錢用於食宿。
       - 務必提供 \`estimatedTransportCost\` 和 \`totalEstimatedCost\`。
       
    2. **具體性**:
       - 必須給出**真實存在的店名**。
       - 考慮 ${prefs.transportPreference} 的移動邏輯。

    3. **格式**:
       - 繁體中文。
       - 價格使用新台幣 (NT$)。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
      }
    });

    if (response.text) {
      const cleanedText = cleanJson(response.text);
      try {
        const data = JSON.parse(cleanedText);
        
        // Inject ID and timestamp for history tracking
        const id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Date.now().toString() + Math.random().toString(36).substring(2);

        return {
          ...data,
          id: id,
          createdAt: Date.now()
        };
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", cleanedText);
        throw new Error("無法解析行程資料，請重試。");
      }
    } else {
      throw new Error("No text response from Gemini");
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};

export const searchNearbyPlaces = async (location: string, radius: string = '1km'): Promise<NearbyPlace[]> => {
  const prompt = `
    請推薦位於或靠近 "${location}" 且距離在「${radius}」範圍內的 5 個美食餐廳和 5 個熱門景點/活動。
    請用繁體中文回答，價格用 NT$。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nearbyResponseSchema,
      }
    });

    if (response.text) {
      const cleanedText = cleanJson(response.text);
      try {
        const data = JSON.parse(cleanedText);
        return data.places || [];
      } catch (parseError) {
        console.error("Failed to parse nearby places:", cleanedText);
        return [];
      }
    } else {
      throw new Error("No text response from Gemini");
    }
  } catch (error) {
    console.error("Error searching nearby places:", error);
    throw error;
  }
};

export const generateChatResponse = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, tripContext?: Itinerary): Promise<string> => {
  let systemInstruction = "You are a helpful travel assistant. Answer in Traditional Chinese.";
  
  if (tripContext) {
    systemInstruction += `\n\nCurrent Trip Context:\nDestination: ${tripContext.destination}\nSummary: ${tripContext.summary}\nTotal Cost: ${tripContext.totalEstimatedCost}`;
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "抱歉，我現在無法回答，請稍後再試。";
};