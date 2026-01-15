import { reallocateProspect } from "./reallocateProspect";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { CapacityStatus } from "@models/CapacityStatus";

// Mock dependencies
jest.mock("./persistProspectiveEvents");
jest.mock("./checkCapacity");
jest.mock("./persistState");
jest.mock("./trackChanges");

const mockLoadCapacityLimits = jest.requireMock("./checkCapacity").loadCapacityLimits;

const mockSaveProspectiveEvents = jest.requireMock("./persistProspectiveEvents").saveProspectiveEvents;
const mockCalculateAllCapacityStatuses = jest.requireMock("./checkCapacity").calculateAllCapacityStatuses;
const mockPersistEventAmbassadors = jest.requireMock("./persistState").persistEventAmbassadors;
const mockPersistChangesLog = jest.requireMock("./persistState").persistChangesLog;
const mockTrackStateChange = jest.requireMock("./trackChanges").trackStateChange;

describe("reallocateProspect", () => {
  let prospects: ProspectiveEventList;
  let eventAmbassadors: EventAmbassadorMap;
  let log: LogEntry[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock loadCapacityLimits to return default limits
    mockLoadCapacityLimits.mockReturnValue({
      eventAmbassadorMin: 2,
      eventAmbassadorMax: 9,
      regionalAmbassadorMin: 3,
      regionalAmbassadorMax: 10
    });

    prospects = new ProspectiveEventList([
      {
        id: "test-prospect-1",
        prospectEvent: "Test Prospect",
        country: "Australia",
        state: "VIC",
        prospectEDs: "Test ED",
        eventAmbassador: "Old EA",
        dateMadeContact: new Date(),
        courseFound: true,
        landownerPermission: false,
        fundingConfirmed: true,
        geocodingStatus: "success",
        ambassadorMatchStatus: "matched",
        importTimestamp: Date.now(),
        sourceRow: 1
      }
    ]);

    eventAmbassadors = new Map([
      ["Old EA", {
        name: "Old EA",
        events: ["Some Event"],
        prospectiveEvents: ["test-prospect-1"],
        capacityStatus: CapacityStatus.WITHIN
      }],
      ["New EA", {
        name: "New EA",
        events: [],
        prospectiveEvents: [],
        capacityStatus: CapacityStatus.WITHIN
      }]
    ]);

    log = [];
  });

  it("should reallocate a prospect from one EA to another", () => {
      reallocateProspect(
        "test-prospect-1",
        "Old EA",
        "New EA",
        prospects,
        eventAmbassadors,
        log
      );

    // Check prospect was updated
    const updatedProspect = prospects.findById("test-prospect-1");
    expect(updatedProspect?.eventAmbassador).toBe("New EA");
    expect(updatedProspect?.ambassadorMatchStatus).toBe("matched");

    // Check old EA's prospectiveEvents was updated
    const oldEA = eventAmbassadors.get("Old EA");
    expect(oldEA?.prospectiveEvents).toEqual([]);

    // Check new EA's prospectiveEvents was updated
    const newEA = eventAmbassadors.get("New EA");
    expect(newEA?.prospectiveEvents).toEqual(["test-prospect-1"]);

    // Check capacity statuses were recalculated
    expect(mockCalculateAllCapacityStatuses).toHaveBeenCalledWith(
      eventAmbassadors,
      new Map(),
      {
        eventAmbassadorMin: 2,
        eventAmbassadorMax: 9,
        regionalAmbassadorMin: 3,
        regionalAmbassadorMax: 10
      }
    );

    // Check event ambassadors were persisted
    expect(mockPersistEventAmbassadors).toHaveBeenCalledWith(eventAmbassadors);

    // Check prospects were saved
    expect(mockSaveProspectiveEvents).toHaveBeenCalledWith(prospects.getAll());

    // Check log entry was added
    expect(log).toHaveLength(1);
    expect(log[0].type).toBe("Prospect Reallocated");
    expect(log[0].event).toContain("Test Prospect");
    expect(log[0].oldValue).toBe("Old EA");
    expect(log[0].newValue).toBe("New EA");

    // Check log was persisted
    expect(mockPersistChangesLog).toHaveBeenCalledWith(log);

    // Check state change was tracked
    expect(mockTrackStateChange).toHaveBeenCalled();
  });

  it("should handle unassigning a prospect (setting to empty string)", () => {
    reallocateProspect(
      "test-prospect-1",
      "Old EA",
      "",
      prospects,
      eventAmbassadors,
      log
    );

    const updatedProspect = prospects.findById("test-prospect-1");
    expect(updatedProspect?.eventAmbassador).toBe("");
    expect(updatedProspect?.ambassadorMatchStatus).toBe("unmatched");

    const oldEA = eventAmbassadors.get("Old EA");
    expect(oldEA?.prospectiveEvents).toEqual([]);
  });

  it("should throw error if prospect not found", () => {
    expect(() => {
      reallocateProspect(
        "non-existent-id",
        "Old EA",
        "New EA",
        prospects,
        eventAmbassadors,
        log
      );
    }).toThrow("Prospect with ID 'non-existent-id' not found");
  });

  it("should throw error if prospect is not assigned to the specified old ambassador", () => {
    expect(() => {
      reallocateProspect(
        "test-prospect-1",
        "Wrong EA",
        "New EA",
        prospects,
        eventAmbassadors,
        log
      );
    }).toThrow("Prospect 'Test Prospect' is not currently assigned to 'Wrong EA'");
  });
});