export interface ImportGuidanceState {
  hasImportedData: boolean;
  lastGuidanceShown?: number;
  guidanceDismissed: boolean;
}

export function createImportGuidanceState(): ImportGuidanceState {
  return {
    hasImportedData: false,
    guidanceDismissed: false,
  };
}
