import { showEventAllocationDialog } from "./showEventAllocationDialog";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";

jest.mock("./getReallocationSuggestions");

describe("showEventAllocationDialog", () => {
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let cancelButton: HTMLButtonElement;
  let onSelect: jest.Mock;
  let onCancel: jest.Mock;
  let suggestions: ReallocationSuggestion[];
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let eventDetails: EventDetailsMap;
  let eventTeams: EventTeamMap;

  beforeEach(() => {
    eventAmbassadors = new Map();
    eventAmbassadors.set("EA 1", { name: "EA 1", events: [] });
    eventAmbassadors.set("EA 2", { name: "EA 2", events: [] });
    eventAmbassadors.set("EA 3", { name: "EA 3", events: [] });

    regionalAmbassadors = new Map();
    regionalAmbassadors.set("REA 1", {
      name: "REA 1",
      state: "VIC",
      supportsEAs: ["EA 1", "EA 2"],
    });

    eventDetails = new Map();
    eventDetails.set("event1", {
      id: "1",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9631, -37.8136],
      },
      properties: {
        eventname: "Event 1",
        EventLongName: "Event 1 Long Name",
        EventShortName: "event1",
        LocalisedEventLongName: null,
        countrycode: 0,
        seriesid: 1,
        EventLocation: "Location 1",
      },
    });

    eventTeams = new Map();
    eventTeams.set("event1", {
      eventShortName: "event1",
      eventAmbassador: "",
      eventDirectors: ["Director1"],
    });

    document.body.innerHTML = `
      <div id="reallocationDialog" role="dialog" aria-labelledby="reallocationDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="reallocationDialogTitle">Allocate Event</h2>
        <div id="reallocationDialogContent"></div>
        <button type="button" id="reallocationDialogCancel">Cancel</button>
      </div>
    `;

    dialog = document.getElementById("reallocationDialog")!;
    title = document.getElementById("reallocationDialogTitle")!;
    content = document.getElementById("reallocationDialogContent")!;
    cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

    onSelect = jest.fn();
    onCancel = jest.fn();

    suggestions = [
      {
        fromAmbassador: "",
        toAmbassador: "EA 1",
        items: ["event1"],
        score: 85,
        reasons: ["Has available capacity"],
      },
      {
        fromAmbassador: "",
        toAmbassador: "EA 2",
        items: ["event1"],
        score: 75,
        reasons: ["Same region"],
      },
    ];
  });

  it("should display dialog for allocating unallocated event", () => {
    showEventAllocationDialog(
      "event1",
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      suggestions
    );

    expect(dialog.style.display).not.toBe("none");
    expect(title.textContent).toContain("event1");
    expect(title.textContent).toContain("Allocate");
  });

  it("should show error message when no Event Ambassadors exist", () => {
    const emptyEAs = new Map();

    showEventAllocationDialog(
      "event1",
      eventDetails,
      emptyEAs,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      []
    );

    expect(content.textContent).toContain("No Event Ambassadors available");
  });

  it("should create suggestion buttons for top suggestions", () => {
    showEventAllocationDialog(
      "event1",
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      suggestions
    );

    const buttons = content.querySelectorAll("button.suggestion-button");
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.length).toBeLessThanOrEqual(5);
  });

  it("should call onSelect when suggestion button is clicked", () => {
    showEventAllocationDialog(
      "event1",
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      suggestions
    );

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.click();

    expect(onSelect).toHaveBeenCalledWith("EA 1");
  });

  it("should call onCancel when cancel button is clicked", () => {
    showEventAllocationDialog(
      "event1",
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      suggestions
    );

    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("should display Event Directors if available", () => {
    showEventAllocationDialog(
      "event1",
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      suggestions
    );

    expect(content.textContent).toContain("Director1");
  });

  it("should be keyboard accessible", () => {
    showEventAllocationDialog(
      "event1",
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      eventTeams,
      onSelect,
      onCancel,
      suggestions
    );

    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("reallocationDialogTitle");
  });
});
