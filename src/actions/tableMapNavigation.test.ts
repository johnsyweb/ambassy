import {
  selectEventTeamRow,
  selectMapEvent,
  highlightTableRow,
  scrollToTableRow,
  isEventTeamsTabVisible,
  applyDeferredTableSelection,
} from "./tableMapNavigation";
import { SelectionState, createSelectionState } from "../models/SelectionState";
import { EventTeamsTableDataMap } from "../models/EventTeamsTableData";
import { EventDetailsMap } from "../models/EventDetailsMap";
import L from "leaflet";

describe("tableMapNavigation", () => {
  let selectionState: SelectionState;
  let eventTeamsTableData: EventTeamsTableDataMap;
  let markerMap: Map<string, L.CircleMarker>;
  let highlightLayer: L.LayerGroup;
  let eventDetails: EventDetailsMap;
  let map: L.Map;

  beforeEach(() => {
    document.body.innerHTML = '<div id="mapContainer"></div>';
    map = L.map("mapContainer").setView([0, 0], 2);
    markerMap = new Map();
    highlightLayer = L.layerGroup();
    eventDetails = new Map();
    selectionState = createSelectionState();
    eventTeamsTableData = new Map([
      [
        "event1",
        {
          eventShortName: "event1",
          eventDirectors: "Director1",
          eventAmbassador: "EA1",
          regionalAmbassador: "REA1",
          eventCoordinates: "0, 0",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "AU",
        },
      ],
      [
        "event2",
        {
          eventShortName: "event2",
          eventDirectors: "Director2",
          eventAmbassador: "EA2",
          regionalAmbassador: "REA2",
          eventCoordinates: "1, 1",
          eventSeries: 2,
          eventCountryCode: 1,
          eventCountry: "AU",
        },
      ],
    ]);

    document.body.innerHTML = `
      <div id="eventTeamsTab" class="tab-content active">
        <table id="eventTeamsTable">
          <tbody>
            <tr data-event-short-name="event1">
              <td>REA1</td>
              <td>EA1</td>
              <td>event1</td>
            </tr>
            <tr data-event-short-name="event2">
              <td>REA2</td>
              <td>EA2</td>
              <td>event2</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    
    // Mock scrollIntoView for all rows
    document.querySelectorAll('tr').forEach((row) => {
      (row as HTMLElement).scrollIntoView = jest.fn();
    });
  });

  afterEach(() => {
    map.remove();
    document.body.innerHTML = "";
  });

  describe("selectEventTeamRow", () => {
    it("should update selection state when event exists", () => {
      selectEventTeamRow(selectionState, "event1", eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);

      expect(selectionState.selectedEventShortName).toBe("event1");
      expect(selectionState.highlightedEvents.has("event1")).toBe(true);
      expect(selectionState.highlightedEvents.size).toBe(1);
      expect(selectionState.selectedEventAmbassador).toBeNull();
      expect(selectionState.selectedRegionalAmbassador).toBeNull();
    });

    it("should throw error when event does not exist", () => {
      expect(() => {
        selectEventTeamRow(selectionState, "nonexistent", eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);
      }).toThrow();
    });

    it("should clear other selections when selecting new event", () => {
      selectionState.selectedEventAmbassador = "EA1";
      selectionState.selectedRegionalAmbassador = "REA1";
      selectionState.highlightedEvents.add("other");

      selectEventTeamRow(selectionState, "event1", eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);

      expect(selectionState.selectedEventAmbassador).toBeNull();
      expect(selectionState.selectedRegionalAmbassador).toBeNull();
      expect(selectionState.highlightedEvents.has("other")).toBe(false);
    });
  });

  describe("selectMapEvent", () => {
    it("should update selection state", () => {
      selectMapEvent(selectionState, "event1", markerMap, highlightLayer, eventDetails, map);

      expect(selectionState.selectedEventShortName).toBe("event1");
      expect(selectionState.highlightedEvents.has("event1")).toBe(true);
      expect(selectionState.highlightedEvents.size).toBe(1);
      expect(selectionState.selectedEventAmbassador).toBeNull();
      expect(selectionState.selectedRegionalAmbassador).toBeNull();
    });

    it("should clear other selections", () => {
      selectionState.selectedEventAmbassador = "EA1";
      selectionState.selectedRegionalAmbassador = "REA1";
      selectionState.highlightedEvents.add("other");

      selectMapEvent(selectionState, "event1", markerMap, highlightLayer, eventDetails, map);

      expect(selectionState.selectedEventAmbassador).toBeNull();
      expect(selectionState.selectedRegionalAmbassador).toBeNull();
      expect(selectionState.highlightedEvents.has("other")).toBe(false);
    });
  });

  describe("highlightTableRow", () => {
    it("should add selected class to row", () => {
      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      highlightTableRow("eventTeamsTable", "event1", true);

      expect(row.classList.contains("selected")).toBe(true);
      expect(row.getAttribute("aria-selected")).toBe("true");
    });

    it("should clear previous selection in same table", () => {
      const row1 = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;
      const row2 = document.querySelector(
        'tr[data-event-short-name="event2"]'
      ) as HTMLTableRowElement;

      highlightTableRow("eventTeamsTable", "event1", true);
      highlightTableRow("eventTeamsTable", "event2", true);

      expect(row1.classList.contains("selected")).toBe(false);
      expect(row2.classList.contains("selected")).toBe(true);
    });

    it("should remove selected class when isSelected is false", () => {
      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      highlightTableRow("eventTeamsTable", "event1", true);
      highlightTableRow("eventTeamsTable", "event1", false);

      expect(row.classList.contains("selected")).toBe(false);
      expect(row.getAttribute("aria-selected")).toBe("false");
    });

    it("should handle missing row gracefully", () => {
      expect(() => {
        highlightTableRow("eventTeamsTable", "nonexistent", true);
      }).not.toThrow();
    });
  });

  describe("scrollToTableRow", () => {
    it("should scroll to row", () => {
      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;
      const scrollIntoViewSpy = jest.fn();
      row.scrollIntoView = scrollIntoViewSpy;

      scrollToTableRow("eventTeamsTable", "event1");

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "nearest",
      });
    });

    it("should handle missing row gracefully", () => {
      expect(() => {
        scrollToTableRow("eventTeamsTable", "nonexistent");
      }).not.toThrow();
    });
  });

  describe("integration tests", () => {
    it("should highlight map when table row is selected", () => {
      selectEventTeamRow(selectionState, "event1", eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);

      expect(selectionState.highlightedEvents.has("event1")).toBe(true);
    });

    it("should highlight table when map marker is clicked", () => {
      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = false;
      }

      selectMapEvent(selectionState, "event1", markerMap, highlightLayer, eventDetails, map);

      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      expect(row.classList.contains("selected")).toBe(true);
    });
  });

  describe("User Story 2 - Tab visibility", () => {
    it("should check if Event Teams tab is visible", () => {
      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = false;
        expect(isEventTeamsTabVisible()).toBe(true);
        
        eventTeamsTab.hidden = true;
        expect(isEventTeamsTabVisible()).toBe(false);
      }
    });

    it("should defer table highlighting when tab is not visible", () => {
      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = true;
      }

      selectMapEvent(selectionState, "event1", markerMap, highlightLayer, eventDetails, map);

      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      expect(row.classList.contains("selected")).toBe(false);
      expect(selectionState.selectedEventShortName).toBe("event1");
    });

    it("should highlight table immediately when tab is visible", () => {
      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = false;
      }

      selectMapEvent(selectionState, "event1", markerMap, highlightLayer, eventDetails, map);

      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      expect(row.classList.contains("selected")).toBe(true);
    });

    it("should apply deferred selection when tab becomes visible", () => {
      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = true;
      }

      selectMapEvent(selectionState, "event1", markerMap, highlightLayer, eventDetails, map);

      if (eventTeamsTab) {
        eventTeamsTab.hidden = false;
      }

      applyDeferredTableSelection(selectionState, eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);

      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      expect(row.classList.contains("selected")).toBe(true);
    });

    it("should not apply deferred selection if no selection exists", () => {
      selectionState.selectedEventShortName = null;

      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = false;
      }

      applyDeferredTableSelection(selectionState, eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);

      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      expect(row?.classList.contains("selected")).toBe(false);
    });

    it("should not apply deferred selection if tab is not visible", () => {
      const eventTeamsTab = document.getElementById("eventTeamsTab");
      if (eventTeamsTab) {
        eventTeamsTab.hidden = true;
      }

      selectionState.selectedEventShortName = "event1";

      applyDeferredTableSelection(selectionState, eventTeamsTableData, markerMap, highlightLayer, eventDetails, map);

      const row = document.querySelector(
        'tr[data-event-short-name="event1"]'
      ) as HTMLTableRowElement;

      expect(row?.classList.contains("selected")).toBe(false);
    });
  });
});

