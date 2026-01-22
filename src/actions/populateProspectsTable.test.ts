import { populateProspectsTable } from "./populateProspectsTable";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";

jest.mock("./launchProspect", () => ({
  launchProspect: jest.fn(),
}));

jest.mock("./archiveProspect", () => ({
  archiveProspect: jest.fn(),
}));

jest.mock("./showLaunchDialog", () => ({
  showLaunchDialog: jest.fn(),
}));

jest.mock("./persistState", () => ({
  persistChangesLog: jest.fn(),
}));

describe("populateProspectsTable", () => {
  let prospects: ProspectiveEventList;
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let log: LogEntry[];
  let eventDetails: EventDetailsMap;

  beforeEach(() => {
    // Mock confirm to auto-accept
    (globalThis as unknown as { confirm: () => boolean }).confirm = jest.fn(() => true);

    document.body.innerHTML = `
      <table id="prospectsTable">
        <thead>
          <tr>
            <th>Prospect Event</th>
            <th>Country</th>
            <th>State</th>
            <th>Prospect ED/s</th>
            <th>EA</th>
            <th>Date Made Contact</th>
            <th>Course Found</th>
            <th>Landowner Permission</th>
            <th>Funding Confirmed</th>
            <th>Geocoding Status</th>
            <th>Coordinates</th>
            <th>Ambassador Match</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div id="reallocationDialog" role="dialog" aria-labelledby="reallocationDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="reallocationDialogTitle">Select Recipient</h2>
        <div id="reallocationDialogContent"></div>
        <button type="button" id="reallocationDialogCancel">❌ Cancel</button>
      </div>
    `;

    const baseProspect = {
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
      geocodingStatus: "success" as const,
      ambassadorMatchStatus: "matched" as const,
      importTimestamp: Date.now(),
      sourceRow: 1,
      notes: "",
    };

    prospects = new ProspectiveEventList([baseProspect]);
    eventAmbassadors = new Map([
      [
        "EA1",
        {
          name: "EA1",
          events: [],
          prospectiveEvents: ["p1"],
        },
      ],
    ]);
    regionalAmbassadors = new Map();
    log = [];
    eventDetails = new Map();

    jest.clearAllMocks();
  });

  it("renders Launch and Archive buttons and wires click handlers", () => {
    const { showLaunchDialog } = jest.requireMock("./showLaunchDialog");
    const { archiveProspect } = jest.requireMock("./archiveProspect");

    populateProspectsTable(
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      eventDetails,
    );

    const launchButton = document.querySelector("button[aria-label*='launched']") as HTMLButtonElement;
    const archiveButton = document.querySelector("button[aria-label*='Archive']") as HTMLButtonElement;

    expect(launchButton).not.toBeNull();
    expect(archiveButton).not.toBeNull();

    launchButton.click();
    expect(showLaunchDialog).toHaveBeenCalledTimes(1);
    const launchArgs = (showLaunchDialog as jest.Mock).mock.calls[0];
    expect(launchArgs[0].id).toBe("p1");
    expect(launchArgs[1]).toBe(eventDetails);
    expect(launchArgs[2]).toBe(eventAmbassadors);
    expect(launchArgs[3]).toBe(regionalAmbassadors);
    expect(typeof launchArgs[4]).toBe("function");
    expect(typeof launchArgs[5]).toBe("function");

    archiveButton.click();
    expect(archiveProspect).toHaveBeenCalledTimes(1);
    const archiveArgs = (archiveProspect as jest.Mock).mock.calls[0];
    expect(archiveArgs[0]).toBe("p1");
  });

  it("calls launchProspect when showLaunchDialog callback is invoked", () => {
    const { showLaunchDialog } = jest.requireMock("./showLaunchDialog");
    const { launchProspect } = jest.requireMock("./launchProspect");
    const refreshCallback = jest.fn();

    // Set up refresh callback - import the actual module for the callback setter
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { setProspectReallocationRefreshCallback } = require("./populateProspectsTable");
    setProspectReallocationRefreshCallback(refreshCallback);

    populateProspectsTable(
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      eventDetails,
    );

    const launchButton = document.querySelector("button[aria-label*='launched']") as HTMLButtonElement;
    launchButton.click();

    expect(showLaunchDialog).toHaveBeenCalledTimes(1);
    const launchArgs = (showLaunchDialog as jest.Mock).mock.calls[0];
    const onLaunch = launchArgs[4];

    onLaunch("Event A", "EA1");

    expect(launchProspect).toHaveBeenCalledTimes(1);
    const launchProspectArgs = (launchProspect as jest.Mock).mock.calls[0];
    expect(launchProspectArgs[0]).toBe("p1");
    expect(launchProspectArgs[5]).toBe(log);
    expect(launchProspectArgs[6]).toBe("Event A");
    expect(launchProspectArgs[7]).toBe("EA1");
    expect(refreshCallback).toHaveBeenCalledTimes(1);
  });
});
