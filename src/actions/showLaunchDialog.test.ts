import { showLaunchDialog } from "./showLaunchDialog";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

jest.mock("./findMatchingEvents", () => ({
  findMatchingEvents: jest.fn(),
}));

jest.mock("./suggestEventAllocation", () => ({
  suggestEventAllocation: jest.fn(),
}));

describe("showLaunchDialog", () => {
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let cancelButton: HTMLButtonElement;

  const baseProspect: ProspectiveEvent = {
    id: "p1",
    prospectEvent: "Test Prospect",
    country: "AU",
    state: "VIC",
    prospectEDs: "ED",
    eventAmbassador: "EA1",
    courseFound: false,
    landownerPermission: false,
    fundingConfirmed: false,
    dateMadeContact: null,
    coordinates: { latitude: -37.8, longitude: 144.9 },
    geocodingStatus: "success",
    ambassadorMatchStatus: "matched",
    importTimestamp: Date.now(),
    sourceRow: 1,
    notes: "",
  };

  let eventDetails: EventDetailsMap;
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="reallocationDialog" role="dialog" aria-labelledby="reallocationDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="reallocationDialogTitle">Select Recipient</h2>
        <div id="reallocationDialogContent"></div>
        <button type="button" id="reallocationDialogCancel">❌ Cancel</button>
      </div>
    `;

    dialog = document.getElementById("reallocationDialog") as HTMLElement;
    title = document.getElementById("reallocationDialogTitle") as HTMLElement;
    content = document.getElementById("reallocationDialogContent") as HTMLElement;
    cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

    eventDetails = new Map();
    eventDetails.set("Event A", {
      id: "Event A",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [144.9, -37.8] as [number, number],
      },
      properties: {
        eventname: "event-a",
        EventShortName: "Event A",
        EventLongName: "Event A",
        LocalisedEventLongName: null,
        countrycode: 1,
        seriesid: 1,
        EventLocation: "Test Location",
      },
    });

    eventAmbassadors = new Map([
      [
        "EA1",
        {
          name: "EA1",
          events: [],
          prospectiveEvents: ["p1"],
        },
      ],
      [
        "EA2",
        {
          name: "EA2",
          events: [],
          prospectiveEvents: [],
        },
      ],
    ]);

    regionalAmbassadors = new Map();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays dialog with prospect information", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    findMatchingEvents.mockReturnValue([]);

    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      jest.fn(),
      jest.fn(),
    );

    expect(dialog.style.display).toBe("block");
    expect(title.textContent).toContain("Launch Prospect: Test Prospect");
    expect(content.textContent).toContain("Test Prospect");
    expect(content.textContent).toContain("AU, VIC");
  });

  it("shows matching events when matches are found", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    const matchingEvent = eventDetails.get("Event A")!;
    findMatchingEvents.mockReturnValue([matchingEvent]);

    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      jest.fn(),
      jest.fn(),
    );

    expect(content.textContent).toContain("Potential matching events found");
    expect(content.textContent).toContain("Event A");
    expect(content.textContent).toContain("Proceed without event allocation");
  });

  it("shows no matches message when no matches found", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    findMatchingEvents.mockReturnValue([]);

    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      jest.fn(),
      jest.fn(),
    );

    expect(content.textContent).toContain("No matching events found");
    expect(content.textContent).toContain("Launch without event allocation");
  });

  it("calls onLaunch with no parameters when proceeding without allocation", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    findMatchingEvents.mockReturnValue([]);

    const onLaunch = jest.fn();
    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      onLaunch,
      jest.fn(),
    );

    const launchButton = content.querySelector("button");
    expect(launchButton).not.toBeNull();
    launchButton?.click();

    expect(onLaunch).toHaveBeenCalledTimes(1);
    expect(onLaunch).toHaveBeenCalledWith();
  });

  it("allows selecting a matching event and shows EA selection", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    const { suggestEventAllocation } = jest.requireMock("./suggestEventAllocation");
    const matchingEvent = eventDetails.get("Event A")!;
    findMatchingEvents.mockReturnValue([matchingEvent]);
    suggestEventAllocation.mockReturnValue([
      {
        toAmbassador: "EA1",
        liveEventsCount: 0,
        prospectEventsCount: 1,
        allocationCount: 1,
        reasons: ["Under capacity"],
      },
    ]);

    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      jest.fn(),
      jest.fn(),
    );

    const eventButton = Array.from(content.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Event A"),
    );
    expect(eventButton).not.toBeNull();
    eventButton?.click();

    expect(content.textContent).toContain("Selected Event: Event A");
    expect(content.textContent).toContain("Suggested Event Ambassadors");
  });

  it("calls onCancel when cancel button is clicked", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    findMatchingEvents.mockReturnValue([]);

    const onCancel = jest.fn();
    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      jest.fn(),
      onCancel,
    );

    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
    expect(dialog.style.display).toBe("none");
  });

  it("calls onLaunch with selected event and EA when both are selected", () => {
    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    const { suggestEventAllocation } = jest.requireMock("./suggestEventAllocation");
    const matchingEvent = eventDetails.get("Event A")!;
    findMatchingEvents.mockReturnValue([matchingEvent]);
    suggestEventAllocation.mockReturnValue([
      {
        toAmbassador: "EA1",
        liveEventsCount: 0,
        prospectEventsCount: 1,
        allocationCount: 1,
        reasons: ["Under capacity"],
      },
    ]);

    const onLaunch = jest.fn();
    showLaunchDialog(
      baseProspect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      onLaunch,
      jest.fn(),
    );

    const eventButton = Array.from(content.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Event A"),
    );
    eventButton?.click();

    const eaButton = Array.from(content.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("EA1"),
    );
    eaButton?.click();

    const launchButton = Array.from(content.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Launch and Allocate"),
    );
    launchButton?.click();

    expect(onLaunch).toHaveBeenCalledWith("Event A", "EA1");
  });

  it("handles prospect without coordinates", () => {
    const prospectWithoutCoords = {
      ...baseProspect,
      coordinates: undefined,
    };

    const { findMatchingEvents } = jest.requireMock("./findMatchingEvents");
    findMatchingEvents.mockReturnValue([]);

    showLaunchDialog(
      prospectWithoutCoords,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      jest.fn(),
      jest.fn(),
    );

    expect(content.textContent).toContain("Test Prospect");
    expect(content.textContent).not.toContain("Coordinates");
  });
});
