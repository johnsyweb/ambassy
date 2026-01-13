export interface CapacityLimits {
  eventAmbassadorMin: number;
  eventAmbassadorMax: number;
  regionalAmbassadorMin: number;
  regionalAmbassadorMax: number;
}

export const defaultCapacityLimits: CapacityLimits = {
  eventAmbassadorMin: 2,
  eventAmbassadorMax: 9,
  regionalAmbassadorMin: 3,
  regionalAmbassadorMax: 10,
};

