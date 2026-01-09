import { SelectionState } from "../models/SelectionState";
import { EventTeamsTableDataMap } from "../models/EventTeamsTableData";
import { highlightEventsOnMap, centerMapOnEvents } from "../utils/mapNavigation";
import { EventDetailsMap } from "../models/EventDetailsMap";
import L from "leaflet";

export function selectEventTeamRow(
  state: SelectionState,
  eventShortName: string,
  eventTeamsTableData: EventTeamsTableDataMap,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup | null,
  eventDetails: EventDetailsMap,
  map: L.Map | null
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
}

export function selectMapEvent(
  state: SelectionState,
  eventShortName: string,
  markerMap: Map<string, L.CircleMarker>,
  highlightLayer: L.LayerGroup | null,
  eventDetails: EventDetailsMap,
  map: L.Map | null
): void {
  state.selectedEventShortName = eventShortName;
  state.selectedEventAmbassador = null;
  state.selectedRegionalAmbassador = null;
  state.highlightedEvents.clear();
  state.highlightedEvents.add(eventShortName);

  if (highlightLayer && map) {
    highlightEventsOnMap([eventShortName], markerMap, highlightLayer);
    centerMapOnEvents([eventShortName], eventDetails, map);
  }

  const eventTeamsTab = document.getElementById("eventTeamsTab");
  if (eventTeamsTab && !eventTeamsTab.hidden) {
    highlightTableRow("eventTeamsTable", eventShortName, true);
    scrollToTableRow("eventTeamsTable", eventShortName);
  }
}

export function highlightTableRow(
  tableId: string,
  identifier: string,
  isSelected: boolean
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
    `tr[data-event-short-name="${identifier}"]`
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
    `tr[data-event-short-name="${identifier}"]`
  ) as HTMLTableRowElement | null;

  if (!row) {
    return;
  }

  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

