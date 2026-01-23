import { exportApplicationState } from "./exportState";
import { importApplicationState } from "./importState";
import { resolveIssueWithPin } from "./resolveIssue";
import { detectIssues } from "./detectIssues";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventIssue } from "@models/EventIssue";
import { LogEntry } from "@models/LogEntry";
import { loadFromStorage, saveToStorage } from "@utils/storage";

jest.mock("@utils/storage");

describe("Resolved Issues Persistence", () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("should log issue resolution when resolving with pin", () => {
    const issue: EventIssue = {
      eventShortName: "TestEvent",
      eventAmbassador: "EA1",
      regionalAmbassador: "REA1",
      issueType: "missing_coordinates",
      status: "unresolved",
    };

    const eventDetailsMap: EventDetailsMap = new Map();
    const log: LogEntry[] = [];
    const coordinates: [number, number] = [144.9631, -37.8136]; // [lng, lat]

    resolveIssueWithPin(issue, coordinates, eventDetailsMap, log);

    expect(log).toHaveLength(1);
    expect(log[0].type).toBe("Issue Resolved");
    expect(log[0].event).toBe("TestEvent");
    expect(log[0].oldValue).toBe("Missing coordinates");
    expect(log[0].newValue).toContain("Manual pin placement");
    expect(eventDetailsMap.has("TestEvent")).toBe(true);
  });

  it("should persist resolved issues through export and import", async () => {
    // Setup: Create state with an issue that gets resolved
    const eventTeams: EventTeamMap = new Map([
      [
        "TestEvent",
        {
          eventShortName: "TestEvent",
          eventAmbassador: "EA1",
          eventDirectors: [],
        },
      ],
    ]);

    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["EA1", { name: "Event Ambassador 1", events: ["TestEvent"] }],
    ]);

    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      [
        "REA1",
        { name: "Regional Ambassador 1", state: "VIC", supportsEAs: ["EA1"] },
      ],
    ]);

    const log: LogEntry[] = [];

    // Resolve the issue
    const eventDetailsMap: EventDetailsMap = new Map();
    const coordinates: [number, number] = [144.9631, -37.8136];
    const issue: EventIssue = {
      eventShortName: "TestEvent",
      eventAmbassador: "EA1",
      regionalAmbassador: "REA1",
      issueType: "missing_coordinates",
      status: "unresolved",
    };

    resolveIssueWithPin(issue, coordinates, eventDetailsMap, log);

    // Persist to storage
    saveToStorage("eventAmbassadors", Array.from(eventAmbassadors.entries()));
    saveToStorage("eventTeams", Array.from(eventTeams.entries()));
    saveToStorage("regionalAmbassadors", Array.from(regionalAmbassadors.entries()));
    saveToStorage("changesLog", log);

    // Store resolved eventDetails in cache
    const resolvedEventDetails = eventDetailsMap.get("TestEvent");
    expect(resolvedEventDetails).toBeDefined();

    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "parkrun events") {
        return JSON.stringify({
          timestamp: Date.now(),
          eventDetailsMap: Array.from(eventDetailsMap.entries()),
        });
      }
      return null;
    });

    (loadFromStorage as jest.Mock).mockImplementation((key: string) => {
      if (key === "eventAmbassadors") {
        return Array.from(eventAmbassadors.entries());
      }
      if (key === "eventTeams") {
        return Array.from(eventTeams.entries());
      }
      if (key === "regionalAmbassadors") {
        return Array.from(regionalAmbassadors.entries());
      }
      if (key === "changesLog") {
        return log;
      }
      return null;
    });

    // Export state
    const blob = exportApplicationState();
    const jsonString = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsText(blob);
    });
    const exportedState = JSON.parse(jsonString);

    expect(exportedState.data.resolvedEventDetails).toBeDefined();
    expect(exportedState.data.resolvedEventDetails).toHaveLength(1);
    expect(exportedState.data.resolvedEventDetails[0][0]).toBe("TestEvent");

    // Clear storage and cache to simulate fresh import
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    (loadFromStorage as jest.Mock).mockReturnValue(null);

    // Import state
    importApplicationState(exportedState);

    // Verify resolved eventDetails were restored to cache
    const setItemCalls = (mockLocalStorage.setItem as jest.Mock).mock.calls;
    const parkrunEventsCall = setItemCalls.find(
      (call) => call[0] === "parkrun events",
    );
    expect(parkrunEventsCall).toBeDefined();

    const cachedData = JSON.parse(parkrunEventsCall[1]);
    expect(cachedData.eventDetailsMap).toBeDefined();
    expect(cachedData.eventDetailsMap).toHaveLength(1);
    expect(cachedData.eventDetailsMap[0][0]).toBe("TestEvent");

    // Verify that detectIssues doesn't detect the resolved issue
    const restoredEventDetailsMap = new Map<string, import("@models/EventDetails").EventDetails>(
      cachedData.eventDetailsMap,
    );
    const issues = detectIssues(
      eventTeams,
      restoredEventDetailsMap,
      eventAmbassadors,
      regionalAmbassadors,
    );

    // The issue should not appear because eventDetails exist
    expect(issues).toHaveLength(0);
  });

  it("should include Issue Resolved log entries in export", async () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["EA1", { name: "Event Ambassador 1", events: ["TestEvent"] }],
    ]);

    const eventTeams: EventTeamMap = new Map([
      [
        "TestEvent",
        {
          eventShortName: "TestEvent",
          eventAmbassador: "EA1",
          eventDirectors: [],
        },
      ],
    ]);

    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      [
        "REA1",
        { name: "Regional Ambassador 1", state: "VIC", supportsEAs: ["EA1"] },
      ],
    ]);

    const log: LogEntry[] = [
      {
        type: "Issue Resolved",
        event: "TestEvent",
        oldValue: "Missing coordinates",
        newValue: "Manual pin placement: -37.8136, 144.9631",
        timestamp: Date.now(),
      },
    ];

    (loadFromStorage as jest.Mock).mockImplementation((key: string) => {
      if (key === "eventAmbassadors") {
        return Array.from(eventAmbassadors.entries());
      }
      if (key === "eventTeams") {
        return Array.from(eventTeams.entries());
      }
      if (key === "regionalAmbassadors") {
        return Array.from(regionalAmbassadors.entries());
      }
      if (key === "changesLog") {
        return log;
      }
      return null;
    });

    mockLocalStorage.getItem.mockReturnValue(null);

    const blob = exportApplicationState();
    const jsonString = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsText(blob);
    });
    const exportedState = JSON.parse(jsonString);

    expect(exportedState.data.changesLog).toBeDefined();
    expect(exportedState.data.changesLog).toHaveLength(1);
    expect(exportedState.data.changesLog[0].type).toBe("Issue Resolved");
    expect(exportedState.data.changesLog[0].event).toBe("TestEvent");
  });
});
