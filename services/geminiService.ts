
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
    activity: { type: Type.STRING, description: "Name of the activity or place" },
    description: { type: Type.STRING, description: "Short detailed description of what to do there" },
    location: { type: Type.STRING, description: "Address or area name" },
    type: { 
      type: Type.STRING, 
      enum: ["food", "sightseeing", "relax", "travel", "shopping", "other"],
      description: "Category of the activity" 
    },
    estimatedCost: { type: Type.STRING, description: "Estimated cost per person in New Taiwan Dollar (NT$)" }
  },
  required: ["time", "activity", "description", "location", "type"]
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.INTEGER, description: "Day number (1, 2, 3...)" },
    title: { type: Type.STRING, description: "Title for the day (e.g., 'Historical Center Tour')" },
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
    summary: { type: Type.STRING, description: "A brief 2-3 sentence summary of the entire trip" },
    days: { 
      type: Type.ARRAY, 
      items: daySchema,
      description: "Daily breakdown of the itinerary" 
    }
  },
  required: ["destination", "tripName", "summary", "days"]
};

// Schema for Nearby Places
const nearbyPlaceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['restaurant', 'attraction', 'shop'] },
    description: { type: Type.STRING, description: "Short appealing description" },
    address: { type: Type.STRING, description: "Approximate address or street name" },
    rating: { type: Type.STRING, description: "Estimated rating out of 5 (e.g. 4.5)" },
    priceLevel: { type: Type.STRING, description: "Average cost in NT$ (e.g. NT$300/人)" },
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

export const generateItinerary = async (prefs: UserPreferences): Promise<Itinerary> => {
  const prompt = `
    我需要一個去 ${prefs.destination} 的旅遊行程規劃。
    天數: ${prefs.duration} 天
    旅遊風格: ${prefs.travelStyle}
    預算: ${prefs.budget}
    旅伴: ${prefs.companions}
    特別興趣: ${prefs.interests.join(", ")}
    
    請生成一個詳細的每日行程，包括時間、地點、活動描述、活動類型和預估費用。
    請用繁體中文回答 (Traditional Chinese).
    所有價格請使用新台幣 (NT$) 估算。
    確保內容豐富且邏輯通順，考慮交通時間。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        systemInstruction: "You are an expert travel planner (旅遊規劃專家). Always respond in Traditional Chinese (Taiwan usage). Provide structured JSON output.",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Itinerary;
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
    
    需求：
    1. 地點必須盡量符合指定的距離範圍 (${radius})。如果是步行距離(如100m, 300m)，請推薦非常鄰近的店家。
    2. 包含當地人推薦的隱藏寶石和必去地點。
    3. 提供具體的地址或街道名稱。
    4. 預估價格請務必使用新台幣 (NT$)。
    5. 評分請基於一般網路評價估算。
    6. 請用繁體中文回答。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nearbyResponseSchema,
        systemInstruction: "You are a local guide expert. Recommend great places nearby within specific radius. Always use NT$ for currency.",
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.places || [];
    } else {
      throw new Error("No text response from Gemini");
    }
  } catch (error) {
    console.error("Error searching nearby places:", error);
    throw error;
  }
};

export const generateChatResponse = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, tripContext?: Itinerary): Promise<string> => {
  let systemInstruction = "You are a helpful travel assistant. Answer questions about travel, destinations, and logistics in Traditional Chinese.";
  
  if (tripContext) {
    systemInstruction += `\n\nCurrent Trip Context:\nDestination: ${tripContext.destination}\nSummary: ${tripContext.summary}\nFull details are known to the user. Answer specific questions about this itinerary if asked.`;
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
