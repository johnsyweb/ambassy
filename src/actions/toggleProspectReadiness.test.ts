import { toggleProspectReadiness } from "./toggleProspectReadiness";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { LogEntry } from "@models/LogEntry";

jest.mock("./persistProspectiveEvents");
jest.mock("./persistState");
jest.mock("./trackChanges");

const mockSaveProspectiveEvents = jest.requireMock(
  "./persistProspectiveEvents",
).saveProspectiveEvents;
const mockPersistChangesLog =
  jest.requireMock("./persistState").persistChangesLog;
const mockTrackStateChange =
  jest.requireMock("./trackChanges").trackStateChange;

describe("toggleProspectReadiness", () => {
  let prospects: ProspectiveEventList;
  let log: LogEntry[];

  beforeEach(() => {
    jest.clearAllMocks();

    prospects = new ProspectiveEventList([
      {
        id: "test-prospect-1",
        prospectEvent: "Test Prospect",
        country: "Australia",
        state: "VIC",
        prospectEDs: "Test ED",
        eventAmbassador: "EA1",
        dateMadeContact: new Date(),
        courseFound: false,
        landownerPermission: true,
        fundingConfirmed: false,
        geocodingStatus: "success",
        ambassadorMatchStatus: "matched",
        importTimestamp: Date.now(),
        sourceRow: 1,
      },
    ]);

    log = [];
  });

  it("toggles course found from false to true and logs the change", () => {
    toggleProspectReadiness("test-prospect-1", "courseFound", prospects, log);

    const updated = prospects.findById("test-prospect-1");
    expect(updated?.courseFound).toBe(true);
    expect(mockSaveProspectiveEvents).toHaveBeenCalledTimes(1);
    expect(log).toHaveLength(1);
    expect(log[0].type).toBe("Prospect Readiness Updated");
    expect(log[0].event).toContain("Course found changed from no to yes");
    expect(mockPersistChangesLog).toHaveBeenCalledWith(log);
    expect(mockTrackStateChange).toHaveBeenCalledTimes(1);
  });

  it("toggles landowner permission from true to false", () => {
    toggleProspectReadiness(
      "test-prospect-1",
      "landownerPermission",
      prospects,
      log,
    );

    expect(prospects.findById("test-prospect-1")?.landownerPermission).toBe(
      false,
    );
    expect(log[0].event).toContain(
      "Landowner permission changed from yes to no",
    );
  });

  it("throws when the prospect id is not found", () => {
    expect(() =>
      toggleProspectReadiness("missing", "fundingConfirmed", prospects, log),
    ).toThrow("Prospect with ID 'missing' not found");
  });
});
