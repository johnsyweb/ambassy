export interface NeighboringEvent {
  name: string;
  distanceKm: number;
}

export interface ReallocationSuggestion {
  fromAmbassador: string;
  toAmbassador: string;
  items: string[];
  score: number;
  reasons?: string[];
  warnings?: string[];
  allocationCount?: number;
  liveEventsCount?: number;
  prospectEventsCount?: number;
  neighboringEvents?: NeighboringEvent[];
}

