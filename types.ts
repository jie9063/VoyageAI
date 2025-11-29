
export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  type: 'food' | 'sightseeing' | 'relax' | 'travel' | 'shopping' | 'other';
  estimatedCost?: string;
}

export interface DayPlan {
  day: number;
  title: string;
  theme: string;
  activities: Activity[];
}

export interface Itinerary {
  destination: string;
  tripName: string;
  summary: string;
  days: DayPlan[];
}

export interface UserPreferences {
  destination: string;
  duration: number;
  travelStyle: string; // e.g., Relaxed, Packed, Foodie, Adventure
  budget: string; // e.g., Budget, Moderate, Luxury
  companions: string; // e.g., Solo, Couple, Family, Friends
  interests: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// New Types for Nearby Search
export interface NearbyPlace {
  name: string;
  type: 'restaurant' | 'attraction' | 'shop';
  description: string;
  address: string;
  rating: string; // e.g., "4.5/5"
  priceLevel: string; // e.g., "NT$200-400"
  tags: string[];
}

export interface SearchRecord {
  id: string;
  timestamp: number;
  locationName: string; // The query or detected address
  radius: string; // e.g., "500m", "1km"
  results: NearbyPlace[];
}
