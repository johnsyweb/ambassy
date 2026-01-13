import { validateReallocation } from "./validateReallocation";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";

describe("validateReallocation", () => {
  let eventShortName: string;
  let newAmbassador: string;
  let eventAmbassadors: EventAmbassadorMap;
  let eventTeamsTableData: EventTeamsTableDataMap;

  beforeEach(() => {
    eventShortName = "test-event";
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
      eventCoordinates: "37.80000° S 144.90000° E",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });
  });

  it("should return valid for valid reallocation", () => {
    const result = validateReallocation(
      eventShortName,
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData
    );

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should return invalid if event not found in EventTeamsTableData", () => {
    const result = validateReallocation(
      "non-existent-event",
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Event not found in table data");
  });

  it("should return invalid if recipient ambassador does not exist", () => {
    const result = validateReallocation(
      eventShortName,
      "Non-existent EA",
      eventAmbassadors,
      eventTeamsTableData
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Recipient ambassador not found");
  });

  it("should return invalid if reallocating to same ambassador (no-op)", () => {
    const result = validateReallocation(
      eventShortName,
      "Current EA",
      eventAmbassadors,
      eventTeamsTableData
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Event is already assigned to this ambassador");
  });

  it("should return invalid if event is not currently assigned", () => {
    eventTeamsTableData.set("unassigned-event", {
      eventShortName: "unassigned-event",
      eventDirectors: "Director 1",
      eventAmbassador: "",
      regionalAmbassador: "",
      eventCoordinates: "37.80000° S 144.90000° E",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "Australia",
    });

    const result = validateReallocation(
      "unassigned-event",
      newAmbassador,
      eventAmbassadors,
      eventTeamsTableData
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Event is not currently assigned to any ambassador");
  });
});
