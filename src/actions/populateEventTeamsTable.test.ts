jest.mock("./refreshUI");
jest.mock("./updateEventAmbassador");
jest.mock("./populateMap");

// Mock d3-geo-voronoi to avoid ES module issues
jest.mock("d3-geo-voronoi", () => ({
  geoVoronoi: jest.fn(() => ({
    polygons: jest.fn(() => ({ features: [] })),
  })),
}));

import { populateEventTeamsTable, setReallocateButtonHandler, updateReallocateButtonStates } from "./populateEventTeamsTable";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { SelectionState, createSelectionState } from "@models/SelectionState";

describe("populateEventTeamsTable - Reallocate Button", () => {
  let eventTeamsTableData: EventTeamsTableDataMap;
  let eventDetailsMap: EventDetailsMap;
  let changelog: LogEntry[];
  let selectionState: SelectionState;
  let tableBody: HTMLTableSectionElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <table id="eventTeamsTable">
        <thead>
          <tr>
            <th>Regional Ambassador</th>
            <th>Event Ambassador</th>
            <th>Event</th>
            <th>Event Directors</th>
            <th>Coordinates</th>
            <th>Series</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    tableBody = document.querySelector("#eventTeamsTable tbody")!;

    eventTeamsTableData = new Map();
    eventTeamsTableData.set("test-event", {
      eventShortName: "test-event",
      eventDirectors: "Director 1",
      eventAmbassador: "Test EA",
      regionalAmbassador: "Test REA",
      eventCoordinates: "37.80000° S 144.90000° E",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    eventDetailsMap = new Map();
    changelog = [];
    selectionState = createSelectionState();
  });

  it("should add Reallocate button to each row", () => {
    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    const row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    expect(row).not.toBeNull();

    const actionsCell = row?.querySelector("td:last-child");
    expect(actionsCell).not.toBeNull();

    const reallocateButton = actionsCell?.querySelector("button.reallocate-button");
    expect(reallocateButton).not.toBeNull();
    expect(reallocateButton?.textContent).toBe("🤝🏼 Reallocate");
  });

  it("should disable Reallocate button when no row is selected", () => {
    selectionState.selectedEventShortName = null;
    setReallocateButtonHandler(selectionState, () => {});

    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    const row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    const reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;

    expect(reallocateButton.disabled).toBe(true);
  });

  it("should enable Reallocate button when row is selected", () => {
    selectionState.selectedEventShortName = "test-event";
    setReallocateButtonHandler(selectionState, () => {});

    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    const row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    const reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;

    expect(reallocateButton.disabled).toBe(false);
  });

  it("should call handler when Reallocate button is clicked", () => {
    const handler = jest.fn();
    selectionState.selectedEventShortName = "test-event";
    setReallocateButtonHandler(selectionState, handler);

    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    const row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    const reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;

    reallocateButton.click();

    expect(handler).toHaveBeenCalledWith("test-event");
  });

  it("should be keyboard accessible (Enter key)", () => {
    const handler = jest.fn();
    selectionState.selectedEventShortName = "test-event";
    setReallocateButtonHandler(selectionState, handler);

    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    const row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    const reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;

    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    reallocateButton.dispatchEvent(enterEvent);

    expect(handler).toHaveBeenCalledWith("test-event");
  });

  it("should be keyboard accessible (Space key)", () => {
    const handler = jest.fn();
    selectionState.selectedEventShortName = "test-event";
    setReallocateButtonHandler(selectionState, handler);

    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    const row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    const reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;

    const spaceEvent = new KeyboardEvent("keydown", { key: " " });
    reallocateButton.dispatchEvent(spaceEvent);

    expect(handler).toHaveBeenCalledWith("test-event");
  });

  it("should update button state when selection changes", () => {
    selectionState.selectedEventShortName = null;
    setReallocateButtonHandler(selectionState, () => {});

    populateEventTeamsTable(eventTeamsTableData, eventDetailsMap, changelog);

    let row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    let reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;

    updateReallocateButtonStates();
    expect(reallocateButton.disabled).toBe(true);

    selectionState.selectedEventShortName = "test-event";
    updateReallocateButtonStates();

    row = tableBody.querySelector("tr[data-event-short-name='test-event']");
    reallocateButton = row?.querySelector("button.reallocate-button") as HTMLButtonElement;
    expect(reallocateButton.disabled).toBe(false);
  });
});
