export interface SelectionState {
  selectedEventShortName: string | null;
  selectedEventAmbassador: string | null;
  selectedRegionalAmbassador: string | null;
  highlightedEvents: Set<string>;
  activeTab: string | null;
}

export function createSelectionState(): SelectionState {
  return {
    selectedEventShortName: null,
    selectedEventAmbassador: null,
    selectedRegionalAmbassador: null,
    highlightedEvents: new Set<string>(),
    activeTab: null,
  };
}

export function clearSelection(state: SelectionState): void {
  state.selectedEventShortName = null;
  state.selectedEventAmbassador = null;
  state.selectedRegionalAmbassador = null;
  state.highlightedEvents.clear();
}

