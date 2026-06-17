import { fromGeoJSONArray } from "@models/Coordinate";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { computeMapPopulationFingerprint } from "./mapPopulationFingerprint";

function allocatedRow(
  eventShortName: string,
  eventAmbassador: string,
  regionalAmbassador: string,
  eventDirectors = "Director",
) {
  return {
    eventShortName,
    eventDirectors,
    eventAmbassador,
    regionalAmbassador,
    eventCoordinates: "37.80000° S 144.90000° E",
    eventSeries: 1,
    eventCountryCode: 3,
    eventCountry: "Australia",
  };
}

function catalogueEvent(
  eventShortName: string,
  longitude: number,
  latitude: number,
) {
  return {
    id: eventShortName,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude] as [number, number],
    },
    properties: {
      eventname: eventShortName,
      EventLongName: eventShortName,
      EventShortName: eventShortName,
      LocalisedEventLongName: null,
      countrycode: 0,
      seriesid: 1,
      EventLocation: "Location",
    },
  };
}

describe("computeMapPopulationFingerprint", () => {
  it("is stable for identical inputs", () => {
    const eventTeamsTableData = new Map([
      ["event1", allocatedRow("event1", "EA1", "REA1")],
    ]) as EventTeamsTableDataMap;
    const eventDetails = new Map([
      ["event1", catalogueEvent("event1", 144.9631, -37.8136)],
    ]) as EventDetailsMap;

    const inputs = { eventTeamsTableData, eventDetails };
    expect(computeMapPopulationFingerprint(inputs)).toBe(
      computeMapPopulationFingerprint(inputs),
    );
  });

  it("changes when allocation changes", () => {
    const eventTeamsTableData = new Map([
      ["event1", allocatedRow("event1", "EA1", "REA1")],
    ]) as EventTeamsTableDataMap;
    const eventDetails = new Map([
      ["event1", catalogueEvent("event1", 144.9631, -37.8136)],
    ]) as EventDetailsMap;

    const before = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
    });

    eventTeamsTableData.set("event1", allocatedRow("event1", "EA2", "REA1"));
    const after = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
    });

    expect(after).not.toBe(before);
  });

  it("changes when catalogue coordinates change", () => {
    const eventTeamsTableData = new Map([
      ["event1", allocatedRow("event1", "EA1", "REA1")],
    ]) as EventTeamsTableDataMap;
    const eventDetails = new Map([
      ["event1", catalogueEvent("event1", 144.9631, -37.8136)],
      ["unallocated", catalogueEvent("unallocated", 145.1, -37.9)],
    ]) as EventDetailsMap;

    const before = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
    });

    eventDetails.set(
      "unallocated",
      catalogueEvent("unallocated", 145.2, -37.9),
    );
    const after = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
    });

    expect(after).not.toBe(before);
  });

  it("changes when prospective events change", () => {
    const eventTeamsTableData = new Map() as EventTeamsTableDataMap;
    const eventDetails = new Map() as EventDetailsMap;
    const prospect: ProspectiveEvent = {
      id: "prospect-1",
      prospectEvent: "Future parkrun",
      country: "Australia",
      state: "VIC",
      prospectEDs: "ED",
      eventAmbassador: "EA1",
      courseFound: false,
      landownerPermission: false,
      fundingConfirmed: false,
      dateMadeContact: null,
      coordinates: fromGeoJSONArray([144.9, -37.8]),
      geocodingStatus: "success",
      ambassadorMatchStatus: "matched",
      importTimestamp: 1,
      sourceRow: 1,
    };

    const before = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
      prospectiveEvents: [prospect],
    });

    const after = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
      prospectiveEvents: [{ ...prospect, eventAmbassador: "EA2" }],
    });

    expect(after).not.toBe(before);
  });

  it("changes when prospect launch readiness flags change", () => {
    const eventTeamsTableData = new Map() as EventTeamsTableDataMap;
    const eventDetails = new Map() as EventDetailsMap;
    const prospect: ProspectiveEvent = {
      id: "prospect-1",
      prospectEvent: "Future parkrun",
      country: "Australia",
      state: "VIC",
      prospectEDs: "ED",
      eventAmbassador: "EA1",
      courseFound: false,
      landownerPermission: false,
      fundingConfirmed: false,
      dateMadeContact: null,
      coordinates: fromGeoJSONArray([144.9, -37.8]),
      geocodingStatus: "success",
      ambassadorMatchStatus: "matched",
      importTimestamp: 1,
      sourceRow: 1,
    };

    const before = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
      prospectiveEvents: [prospect],
    });

    const after = computeMapPopulationFingerprint({
      eventTeamsTableData,
      eventDetails,
      prospectiveEvents: [{ ...prospect, courseFound: true }],
    });

    expect(after).not.toBe(before);
  });
});
