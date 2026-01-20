import { SelectionState } from "@models/SelectionState";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import {
  highlightEventsOnMap,
  centerMapOnEvents,
} from "@utils/mapNavigation";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { updateReallocateButtonStates } from "./populateEventTeamsTable";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { toLeafletArray } from "@models/Coordinate";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { showEventAllocationDialog } from "./showEventAllocationDialog";
import L from "leaflet";

export function selectEventTeamRow(
  state: SelectionState,
  eventShortName: string,
  eventTeamsTableData: EventTeamsTableDataMap,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup | null,
  eventDetails: EventDetailsMap,
  map: L.Map | null,
): void {
  if (!eventTeamsTableData.has(eventShortName)) {
    throw new Error(`Event ${eventShortName} does not exist`);
  }

  state.selectedEventShortName = eventShortName;
  state.selectedEventAmbassador = null;
  state.selectedRegionalAmbassador = null;
  state.highlightedEvents.clear();
  state.highlightedEvents.add(eventShortName);

  if (highlightLayer && map) {
    highlightEventsOnMap([eventShortName], markerMap, highlightLayer);
    centerMapOnEvents([eventShortName], eventDetails, map);
  }

  highlightTableRow("eventTeamsTable", eventShortName, true);
  scrollToTableRow("eventTeamsTable", eventShortName);
  updateReallocateButtonStates();
}

export function selectMapEvent(
  state: SelectionState,
  eventShortName: string,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup | null,
  eventDetails: EventDetailsMap,
  map: L.Map | null,
  eventTeamsTableData?: EventTeamsTableDataMap,
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap,
  eventTeams?: EventTeamMap,
  onAllocate?: (eventName: string, eaName: string) => void,
  onReallocate?: (eventName: string) => void,
): void {
  state.selectedEventShortName = eventShortName;
  state.selectedEventAmbassador = null;
  state.selectedRegionalAmbassador = null;
  state.highlightedEvents.clear();
  state.highlightedEvents.add(eventShortName);

  const isUnallocated =
    eventTeamsTableData !== undefined &&
    !eventTeamsTableData.has(eventShortName);

  if (
    isUnallocated &&
    eventAmbassadors &&
    regionalAmbassadors &&
    eventTeams &&
    onAllocate
  ) {
    if (eventAmbassadors.size === 0) {
      alert(
        "No Event Ambassadors available. Please onboard an Event Ambassador first.",
      );
      return;
    }

    showEventAllocationDialog(
      eventShortName,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      (eaName) => {
        onAllocate(eventShortName, eaName);
      },
      () => {
        state.selectedEventShortName = null;
        state.highlightedEvents.clear();
      },
    );
    return;
  }

  // If allocated and reallocation handler provided, trigger reallocation
  // Only trigger if eventTeamsTableData is defined and event exists in it (so we know it's actually allocated)
  if (
    eventTeamsTableData !== undefined &&
    eventTeamsTableData.has(eventShortName) &&
    onReallocate
  ) {
    onReallocate(eventShortName);
    return;
  }

  if (highlightLayer && map) {
    highlightEventsOnMap([eventShortName], markerMap, highlightLayer);
    centerMapOnEvents([eventShortName], eventDetails, map);
  }

  if (isEventTeamsTabVisible()) {
    highlightTableRow("eventTeamsTable", eventShortName, true);
    scrollToTableRow("eventTeamsTable", eventShortName);
    updateReallocateButtonStates();
  }
}

export function highlightTableRow(
  tableId: string,
  identifier: string,
  isSelected: boolean,
): void {
  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    return;
  }

  if (isSelected) {
    const previousSelected = table.querySelector("tr.selected");
    if (previousSelected) {
      previousSelected.classList.remove("selected");
      previousSelected.setAttribute("aria-selected", "false");
    }
  }

  const row = table.querySelector(
    `tr[data-event-short-name="${identifier}"]`,
  ) as HTMLTableRowElement | null;

  if (!row) {
    return;
  }

  if (isSelected) {
    row.classList.add("selected");
    row.setAttribute("aria-selected", "true");
  } else {
    row.classList.remove("selected");
    row.setAttribute("aria-selected", "false");
  }
}

export function scrollToTableRow(tableId: string, identifier: string): void {
  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    return;
  }

  const row = table.querySelector(
    `tr[data-event-short-name="${identifier}"]`,
  ) as HTMLTableRowElement | null;

  if (!row) {
    return;
  }

  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function isEventTeamsTabVisible(): boolean {
  const eventTeamsTab = document.getElementById("eventTeamsTab");
  return eventTeamsTab !== null && !eventTeamsTab.hidden;
}

export function selectProspectRow(
  state: SelectionState,
  prospectId: string,
  prospects: ProspectiveEventList,
  map: L.Map | null,
): void {
  const prospect = prospects.findById(prospectId);
  if (!prospect) {
    throw new Error(`Prospect ${prospectId} does not exist`);
  }

  if (!prospect.coordinates || prospect.geocodingStatus !== "success") {
    throw new Error(
      `Prospect ${prospect.prospectEvent} does not have valid coordinates`,
    );
  }

  // Clear any existing selection
  state.selectedEventShortName = null;
  state.selectedEventAmbassador = null;
  state.selectedRegionalAmbassador = null;
  state.highlightedEvents.clear();

  // For prospects, we'll store the prospect ID in a way that doesn't conflict
  // Since SelectionState doesn't have a prospectId field, we'll use a special marker
  state.selectedEventShortName = `prospect:${prospectId}`;

  if (map && prospect.coordinates) {
    // Center the map on the prospect coordinates
    map.setView(toLeafletArray(prospect.coordinates), 13); // Zoom level 13 for good detail
  }

  // Highlight the table row
  highlightProspectTableRow("prospectsTable", prospectId, true);
  scrollToProspectTableRow("prospectsTable", prospectId);
}

export function highlightProspectTableRow(
  tableId: string,
  prospectId: string,
  isSelected: boolean,
): void {
  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    return;
  }

  if (isSelected) {
    const previousSelected = table.querySelector("tr.selected");
    if (previousSelected) {
      previousSelected.classList.remove("selected");
      previousSelected.setAttribute("aria-selected", "false");
    }
  }

  const row = table.querySelector(
    `tr[data-prospect-id="${prospectId}"]`,
  ) as HTMLTableRowElement | null;

  if (!row) {
    return;
  }

  if (isSelected) {
    row.classList.add("selected");
    row.setAttribute("aria-selected", "true");
  } else {
    row.classList.remove("selected");
    row.setAttribute("aria-selected", "false");
  }
}

export function scrollToProspectTableRow(
  tableId: string,
  prospectId: string,
): void {
  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    return;
  }

  const row = table.querySelector(
    `tr[data-prospect-id="${prospectId}"]`,
  ) as HTMLTableRowElement | null;

  if (!row) {
    return;
  }

  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function isProspectsTabVisible(): boolean {
  const prospectsTab = document.getElementById("prospectsTab");
  return prospectsTab !== null && !prospectsTab.hidden;
}

export function applyDeferredTableSelection(
  state: SelectionState,
  eventTeamsTableData: EventTeamsTableDataMap,
): void {
  if (!isEventTeamsTabVisible()) {
    return;
  }

  if (
    state.selectedEventShortName &&
    eventTeamsTableData.has(state.selectedEventShortName)
  ) {
    highlightTableRow("eventTeamsTable", state.selectedEventShortName, true);
    scrollToTableRow("eventTeamsTable", state.selectedEventShortName);
    updateReallocateButtonStates();
  }
}
