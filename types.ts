
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
  id: string; // Unique ID for history
  createdAt: number; // Timestamp
  destination: string;
  tripName: string;
  summary: string;
  estimatedTransportCost: string; 
  totalEstimatedCost: string; 
  days: DayPlan[];
}

export interface UserPreferences {
  origin: string;
  destination: string;
  duration: number;
  budgetAmount: number;
  travelStyle: string;
  companions: string;
  interests: string[];
  transportPreference?: string;
  dietaryRestrictions?: string;
  specialRequests?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface NearbyPlace {
  name: string;
  type: 'restaurant' | 'attraction' | 'shop';
  description: string;
  address: string;
  rating: string;
  priceLevel: string;
  tags: string[];
}

export interface SearchRecord {
  id: string;
  timestamp: number;
  locationName: string;
  radius: string;
  results: NearbyPlace[];
}
