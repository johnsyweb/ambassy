export interface ReallocationSuggestion {
  fromAmbassador: string;
  toAmbassador: string;
  items: string[];
  score: number;
  reasons?: string[];
  warnings?: string[];
}

