import { reallocateEventTeam } from "./reallocateEventTeam";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { LogEntry } from "@models/LogEntry";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { assignEventToAmbassador } from "./assignEventToAmbassador";
import { calculateAllCapacityStatuses } from "./checkCapacity";

jest.mock("./assignEventToAmbassador");
jest.mock("./checkCapacity");

describe("reallocateEventTeam", () => {
  let eventShortName: string;
  let oldAmbassador: string;
  let newAmbassador: string;
  let eventAmbassadors: EventAmbassadorMap;
  let eventTeamsTableData: EventTeamsTableDataMap;
  let log: LogEntry[];
  let regionalAmbassadors: RegionalAmbassadorMap;

  beforeEach(() => {
    eventShortName = "test-event";
    oldAmbassador = "Current EA";
    newAmbassador = "New EA";

    eventAmbassadors = new Map();
    eventAmbassadors.set("Current EA", {
      name: "Current EA",
      events: ["test-event"],
    });
    eventAmbassadors.set("New EA", {
      name: "New EA",
      events: [],
    });

    eventTeamsTableData = new Map();
    eventTeamsTableData.set("test-event", {
      eventShortName: "test-event",
      eventDirectors: "Director 1",
      eventAmbassador: "Current EA",
      regionalAmbassador: "Current REA",
      eventCoordinates: "(-37.8, 144.9)",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    log = [];
    regionalAmbassadors = new Map();

    (assignEventToAmbassador as jest.Mock).mockReset();
    (calculateAllCapacityStatuses as jest.Mock).mockReset();
  });

  it("should perform reallocation by calling assignEventToAmbassador", () => {
    reallocateEventTeam(
      eventShortName,
      oldAmbassador,
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData,
      log,
      regionalAmbassadors
    );

    expect(assignEventToAmbassador).toHaveBeenCalledWith(
      eventShortName,
      oldAmbassador,
      newAmbassador,
      eventAmbassadors,
      log,
      regionalAmbassadors
    );
  });

  it("should update EventTeamsTableData", () => {
    reallocateEventTeam(
      eventShortName,
      oldAmbassador,
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData,
      log,
      regionalAmbassadors
    );

    const updatedData = eventTeamsTableData.get(eventShortName);
    expect(updatedData?.eventAmbassador).toBe(newAmbassador);
  });

  it("should persist changes via assignEventToAmbassador", () => {
    reallocateEventTeam(
      eventShortName,
      oldAmbassador,
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData,
      log,
      regionalAmbassadors
    );

    expect(assignEventToAmbassador).toHaveBeenCalled();
  });

  it("should recalculate capacity statuses", () => {
    reallocateEventTeam(
      eventShortName,
      oldAmbassador,
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData,
      log,
      regionalAmbassadors
    );

    expect(calculateAllCapacityStatuses).toHaveBeenCalled();
  });

  it("should throw error if newAmbassador does not exist", () => {
    (assignEventToAmbassador as jest.Mock).mockImplementation(() => {
      throw new Error('Event Ambassador "Non-existent EA" not found');
    });

    expect(() => {
      reallocateEventTeam(
        eventShortName,
        oldAmbassador,
        "Non-existent EA",
        eventAmbassadors,
        eventTeamsTableData,
        log,
        regionalAmbassadors
      );
    }).toThrow('Event Ambassador "Non-existent EA" not found');
  });

  it("should throw error if eventShortName does not exist in EventTeamsTableData", () => {
    expect(() => {
      reallocateEventTeam(
        "non-existent-event",
        oldAmbassador,
        newAmbassador,
        eventAmbassadors,
        eventTeamsTableData,
        log,
        regionalAmbassadors
      );
    }).toThrow("Event 'non-existent-event' not found in table data");
  });

  it("should handle unassigned event (empty oldAmbassador)", () => {
    eventTeamsTableData.set("unassigned-event", {
      eventShortName: "unassigned-event",
      eventDirectors: "Director 1",
      eventAmbassador: "",
      regionalAmbassador: "",
      eventCoordinates: "(-37.8, 144.9)",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    reallocateEventTeam(
      "unassigned-event",
      "",
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData,
      log,
      regionalAmbassadors
    );

    expect(assignEventToAmbassador).toHaveBeenCalledWith(
      "unassigned-event",
      "",
      newAmbassador,
      eventAmbassadors,
      log,
      regionalAmbassadors
    );

    const updatedData = eventTeamsTableData.get("unassigned-event");
    expect(updatedData?.eventAmbassador).toBe(newAmbassador);
  });
});
