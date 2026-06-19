import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { SelectionState } from "@models/SelectionState";
import {
  selectLiveEventFromTerritoryMapSearch,
  selectProspectFromTerritoryMapSearch,
} from "@actions/tableMapNavigation";
import { getAmbassadorNameFilter } from "@utils/ambassadorNameFilter";
import {
  PlaceGeocodingUnavailableError,
  PLACE_GEOCODING_UNAVAILABLE_SHORT_MESSAGE,
  searchPlaces,
} from "@utils/geocoding";
import {
  buildLocalTerritoryMapSearchSuggestions,
  TERRITORY_MAP_SEARCH_FILTER_HIDDEN_SUFFIX,
  TERRITORY_MAP_SEARCH_NO_LOCATION_SUFFIX,
  TERRITORY_MAP_SEARCH_NO_MAP_LOCATION_STATUS,
  TERRITORY_MAP_SEARCH_UNALLOCATED_SUFFIX,
  TerritoryMapSearchPlaceSuggestion,
  toPlaceSuggestion,
} from "@utils/territoryMapSearchSuggestions";
import {
  clearTemporaryPlacePin,
  openTemporaryPlacePinActions,
  setTemporaryPlacePin,
} from "@utils/temporaryPlacePin";
import {
  isTerritoryMapSearchMinimised,
  setTerritoryMapSearchMinimised,
  clearTerritoryMapSearchMinimised,
} from "@utils/territoryMapSearchMinimised";
import L from "leaflet";

export type TerritoryMapSearchContext = {
  eventDetails: EventDetailsMap;
  eventTeamsTableData: EventTeamsTableDataMap;
  prospects: ProspectiveEventList;
  eventAmbassadors: EventAmbassadorMap;
};

export const TERRITORY_MAP_SEARCH_DEBOUNCE_MS = 300;
export const TERRITORY_MAP_SEARCH_INPUT_ID = "territoryMapSearchInput";
export const TERRITORY_MAP_SEARCH_OPEN_PLACE_ACTIONS_ID =
  "territoryMapSearchOpenPlaceActions";

export type TerritoryMapSearchNavigation = {
  selectionState: SelectionState;
  getMap: () => L.Map | null;
  getMarkerMap: () => Map<string, L.CircleMarker>;
  getHighlightLayer: () => L.LayerGroup | null;
  onAddProspectFromPlacePin?: () => void;
};

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let placeSearchRequestId = 0;
let keyboardShortcutAttached = false;
let keyboardShortcutHandler: ((event: KeyboardEvent) => void) | null = null;

function isTextInputElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSuffix(label: string): string {
  return `<span class="territory-map-search-result-suffix">${escapeHtml(label)}</span>`;
}

export function renderTerritoryMapSearchSuggestionsHtml(
  localSuggestions: ReturnType<typeof buildLocalTerritoryMapSearchSuggestions>,
  places: TerritoryMapSearchPlaceSuggestion[],
): string {
  const sections: string[] = [];

  if (localSuggestions.liveEvents.length > 0) {
    sections.push(`
      <div class="territory-map-search-section" role="group" aria-label="Live events">
        <p class="territory-map-search-section-label">Live events</p>
        ${localSuggestions.liveEvents
          .map(
            (suggestion) => `
          <button
            type="button"
            class="territory-map-search-option"
            role="option"
            data-kind="live-event"
            data-event-short-name="${escapeHtml(suggestion.eventShortName)}"
            data-hidden-by-filter="${suggestion.hiddenByAmbassadorFilter ? "true" : "false"}"
          >
            <span>${escapeHtml(suggestion.label)}</span>
            ${suggestion.isUnallocated ? renderSuffix(TERRITORY_MAP_SEARCH_UNALLOCATED_SUFFIX) : ""}
            ${suggestion.hiddenByAmbassadorFilter ? renderSuffix(TERRITORY_MAP_SEARCH_FILTER_HIDDEN_SUFFIX) : ""}
          </button>
        `,
          )
          .join("")}
      </div>
    `);
  }

  if (localSuggestions.prospectiveEvents.length > 0) {
    sections.push(`
      <div class="territory-map-search-section" role="group" aria-label="Prospective events">
        <p class="territory-map-search-section-label">Prospective events</p>
        ${localSuggestions.prospectiveEvents
          .map(
            (suggestion) => `
          <button
            type="button"
            class="territory-map-search-option"
            role="option"
            data-kind="prospect"
            data-prospect-id="${escapeHtml(suggestion.prospectId)}"
            data-hidden-by-filter="${suggestion.hiddenByAmbassadorFilter ? "true" : "false"}"
          >
            <span>${escapeHtml(suggestion.label)}</span>
            ${!suggestion.hasLocation ? renderSuffix(TERRITORY_MAP_SEARCH_NO_LOCATION_SUFFIX) : ""}
            ${suggestion.hiddenByAmbassadorFilter ? renderSuffix(TERRITORY_MAP_SEARCH_FILTER_HIDDEN_SUFFIX) : ""}
          </button>
        `,
          )
          .join("")}
      </div>
    `);
  }

  if (places.length > 0) {
    sections.push(`
      <div class="territory-map-search-section" role="group" aria-label="Places">
        <p class="territory-map-search-section-label">Places</p>
        ${places
          .map(
            (place, index) => `
          <button
            type="button"
            class="territory-map-search-option"
            role="option"
            data-kind="place"
            data-place-index="${index}"
            data-latitude="${place.latitude}"
            data-longitude="${place.longitude}"
            data-place-label="${escapeHtml(place.label)}"
          >
            <span>${escapeHtml(place.label)}</span>
          </button>
        `,
          )
          .join("")}
      </div>
    `);
  }

  return sections.join("");
}

function setSearchStatus(message: string): void {
  const status = document.getElementById("territoryMapSearchStatus");
  if (status) {
    status.textContent = message;
  }
}

export function renderPlaceSearchStatusHtml(placeLabel: string): string {
  return `<span class="territory-map-search-place-label">${escapeHtml(placeLabel)}</span> <button type="button" id="${TERRITORY_MAP_SEARCH_OPEN_PLACE_ACTIONS_ID}" class="territory-map-search-open-place-actions">Open place actions</button>`;
}

function setPlaceSearchStatus(
  placeLabel: string,
  onOpenPlaceActions: () => void,
): void {
  const status = document.getElementById("territoryMapSearchStatus");
  if (!status) {
    return;
  }

  status.innerHTML = renderPlaceSearchStatusHtml(placeLabel);
  const openActionsButton = status.querySelector(
    `#${TERRITORY_MAP_SEARCH_OPEN_PLACE_ACTIONS_ID}`,
  ) as HTMLButtonElement | null;
  openActionsButton?.addEventListener("click", (event) => {
    L.DomEvent.stopPropagation(event);
    onOpenPlaceActions();
  });
}

function hideSuggestionList(
  listbox: HTMLElement,
  input: HTMLInputElement,
): void {
  listbox.hidden = true;
  listbox.innerHTML = "";
  input.setAttribute("aria-expanded", "false");
}

function showSuggestionList(
  listbox: HTMLElement,
  input: HTMLInputElement,
  html: string,
): void {
  if (!html) {
    hideSuggestionList(listbox, input);
    return;
  }

  listbox.innerHTML = html;
  listbox.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

async function refreshTerritoryMapSearchSuggestions(
  query: string,
  context: TerritoryMapSearchContext,
  listbox: HTMLElement,
  input: HTMLInputElement,
): Promise<TerritoryMapSearchPlaceSuggestion[]> {
  const localSuggestions = buildLocalTerritoryMapSearchSuggestions({
    query,
    eventDetails: context.eventDetails,
    eventTeamsTableData: context.eventTeamsTableData,
    prospects: context.prospects.getAll(),
    eventAmbassadors: context.eventAmbassadors,
    ambassadorFilter: getAmbassadorNameFilter(),
  });

  const requestId = ++placeSearchRequestId;
  let places: TerritoryMapSearchPlaceSuggestion[] = [];

  try {
    const placeResults = await searchPlaces(query);
    if (requestId === placeSearchRequestId) {
      places = placeResults.map(toPlaceSuggestion);
    }
  } catch (error) {
    if (requestId === placeSearchRequestId) {
      places = [];
      if (error instanceof PlaceGeocodingUnavailableError) {
        setSearchStatus(PLACE_GEOCODING_UNAVAILABLE_SHORT_MESSAGE);
      }
    }
  }

  if (requestId !== placeSearchRequestId) {
    return places;
  }

  showSuggestionList(
    listbox,
    input,
    renderTerritoryMapSearchSuggestionsHtml(localSuggestions, places),
  );

  return places;
}

function handleSuggestionSelection(
  button: HTMLButtonElement,
  context: TerritoryMapSearchContext,
  navigation: TerritoryMapSearchNavigation,
  input: HTMLInputElement,
  listbox: HTMLElement,
): void {
  const map = navigation.getMap();
  const kind = button.dataset.kind;

  clearTemporaryPlacePin(map);
  setSearchStatus("");

  if (kind === "live-event" && button.dataset.eventShortName) {
    selectLiveEventFromTerritoryMapSearch(
      navigation.selectionState,
      button.dataset.eventShortName,
      context.eventTeamsTableData,
      navigation.getMarkerMap(),
      navigation.getHighlightLayer(),
      context.eventDetails,
      map,
    );

    if (button.dataset.hiddenByFilter === "true") {
      setSearchStatus(TERRITORY_MAP_SEARCH_FILTER_HIDDEN_SUFFIX);
    }
  }

  if (kind === "prospect" && button.dataset.prospectId) {
    const noMapLocation = selectProspectFromTerritoryMapSearch(
      navigation.selectionState,
      button.dataset.prospectId,
      context.prospects,
      map,
    );

    if (noMapLocation) {
      setSearchStatus(TERRITORY_MAP_SEARCH_NO_MAP_LOCATION_STATUS);
    } else if (button.dataset.hiddenByFilter === "true") {
      setSearchStatus(TERRITORY_MAP_SEARCH_FILTER_HIDDEN_SUFFIX);
    }
  }

  if (
    kind === "place" &&
    map &&
    button.dataset.latitude &&
    button.dataset.longitude
  ) {
    const latitude = Number.parseFloat(button.dataset.latitude);
    const longitude = Number.parseFloat(button.dataset.longitude);
    const placeLabel = button.dataset.placeLabel ?? "";
    map.setView([latitude, longitude], 13, { animate: true });
    setTemporaryPlacePin(map, latitude, longitude, {
      label: placeLabel,
      onAddProspect: navigation.onAddProspectFromPlacePin,
    });
    setPlaceSearchStatus(placeLabel, () => {
      openTemporaryPlacePinActions();
    });
  }

  hideSuggestionList(listbox, input);
  input.blur();
}

function ensureTerritoryMapSearchUi(): {
  host: HTMLElement;
  restoreHost: HTMLElement;
  input: HTMLInputElement;
  listbox: HTMLElement;
} | null {
  const mapContainer = document.getElementById("mapContainer");
  if (!mapContainer) {
    return null;
  }

  let host = mapContainer.querySelector(
    ".territory-map-search-host",
  ) as HTMLElement | null;
  let restoreHost = mapContainer.querySelector(
    ".territory-map-search-restore-host",
  ) as HTMLElement | null;

  if (!host) {
    host = document.createElement("div");
    host.className = "territory-map-search-host";
    host.innerHTML = `
      <div class="territory-map-search-header">
        <label class="territory-map-search-label" for="${TERRITORY_MAP_SEARCH_INPUT_ID}">Find on map</label>
        <button type="button" class="territory-map-search-dismiss" aria-label="Minimise map search">×</button>
      </div>
      <input
        id="${TERRITORY_MAP_SEARCH_INPUT_ID}"
        class="territory-map-search-input"
        type="search"
        role="combobox"
        aria-expanded="false"
        aria-controls="territoryMapSearchListbox"
        autocomplete="off"
        spellcheck="false"
      />
      <div id="territoryMapSearchStatus" class="territory-map-search-status" role="status" aria-live="polite"></div>
      <div id="territoryMapSearchListbox" class="territory-map-search-listbox" role="listbox" hidden></div>
    `;
    mapContainer.appendChild(host);
  }

  if (!restoreHost) {
    restoreHost = document.createElement("div");
    restoreHost.className = "territory-map-search-restore-host";
    restoreHost.innerHTML = `<button type="button" class="territory-map-search-restore">Find on map</button>`;
    mapContainer.appendChild(restoreHost);
  }

  const input = host.querySelector(
    `#${TERRITORY_MAP_SEARCH_INPUT_ID}`,
  ) as HTMLInputElement | null;
  const listbox = host.querySelector(
    "#territoryMapSearchListbox",
  ) as HTMLElement | null;

  if (!input || !listbox) {
    return null;
  }

  return { host, restoreHost, input, listbox };
}

function syncTerritoryMapSearchVisibility(
  host: HTMLElement,
  restoreHost: HTMLElement,
): void {
  const minimised = isTerritoryMapSearchMinimised();
  host.hidden = minimised;
  restoreHost.hidden = !minimised;
}

function expandTerritoryMapSearchAndFocus(input: HTMLInputElement): void {
  if (isTerritoryMapSearchMinimised()) {
    setTerritoryMapSearchMinimised(false);
    const host = input.closest(".territory-map-search-host") as HTMLElement;
    const restoreHost = document.querySelector(
      ".territory-map-search-restore-host",
    ) as HTMLElement | null;
    if (restoreHost) {
      syncTerritoryMapSearchVisibility(host, restoreHost);
    }
  }

  input.focus();
  input.select();
}

export function initializeTerritoryMapSearch(
  contextProvider: () => TerritoryMapSearchContext | null,
  navigation: TerritoryMapSearchNavigation,
): void {
  const ui = ensureTerritoryMapSearchUi();
  if (!ui) {
    return;
  }

  const { host, restoreHost, input, listbox } = ui;
  syncTerritoryMapSearchVisibility(host, restoreHost);

  if (host.dataset.initialized === "true") {
    return;
  }
  host.dataset.initialized = "true";

  L.DomEvent.disableClickPropagation(host);
  L.DomEvent.disableScrollPropagation(host);
  L.DomEvent.disableClickPropagation(restoreHost);
  L.DomEvent.disableScrollPropagation(restoreHost);

  const dismissButton = host.querySelector(
    ".territory-map-search-dismiss",
  ) as HTMLButtonElement | null;
  dismissButton?.addEventListener("click", () => {
    hideSuggestionList(listbox, input);
    setSearchStatus("");
    setTerritoryMapSearchMinimised(true);
    syncTerritoryMapSearchVisibility(host, restoreHost);
  });

  const restoreButton = restoreHost.querySelector(
    ".territory-map-search-restore",
  ) as HTMLButtonElement | null;
  restoreButton?.addEventListener("click", () => {
    setTerritoryMapSearchMinimised(false);
    syncTerritoryMapSearchVisibility(host, restoreHost);
    input.focus();
  });

  input.addEventListener("input", () => {
    const context = contextProvider();
    if (!context) {
      return;
    }

    const query = input.value.trim();
    setSearchStatus("");

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (query.length === 0) {
      placeSearchRequestId += 1;
      hideSuggestionList(listbox, input);
      return;
    }

    searchDebounceTimer = setTimeout(() => {
      searchDebounceTimer = null;
      void refreshTerritoryMapSearchSuggestions(query, context, listbox, input);
    }, TERRITORY_MAP_SEARCH_DEBOUNCE_MS);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideSuggestionList(listbox, input);
      setSearchStatus("");
    }
  });

  listbox.addEventListener("click", (event) => {
    L.DomEvent.stopPropagation(event);

    const target = (event.target as HTMLElement | null)?.closest(
      ".territory-map-search-option",
    ) as HTMLButtonElement | null;
    if (!target) {
      return;
    }

    const context = contextProvider();
    if (!context) {
      return;
    }

    handleSuggestionSelection(target, context, navigation, input, listbox);
  });

  if (!keyboardShortcutAttached) {
    keyboardShortcutHandler = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey
      ) {
        return;
      }

      if (isTextInputElement(event.target)) {
        return;
      }

      const searchInput = document.getElementById(
        TERRITORY_MAP_SEARCH_INPUT_ID,
      ) as HTMLInputElement | null;
      if (!searchInput) {
        return;
      }

      event.preventDefault();
      expandTerritoryMapSearchAndFocus(searchInput);
    };
    document.addEventListener("keydown", keyboardShortcutHandler);
    keyboardShortcutAttached = true;
  }
}

export function resetTerritoryMapSearchForTests(): void {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
  placeSearchRequestId = 0;
  if (keyboardShortcutHandler) {
    document.removeEventListener("keydown", keyboardShortcutHandler);
    keyboardShortcutHandler = null;
  }
  keyboardShortcutAttached = false;
  clearTerritoryMapSearchMinimised();
  document.querySelector(".territory-map-search-host")?.remove();
  document.querySelector(".territory-map-search-restore-host")?.remove();
}
