import {
  EventTeamsTableData,
  EventTeamsTableDataMap,
  ambassadorNamesFrom,
  eventAmbassadorsFrom,
  regionalAmbassadorsFrom,
} from "./EventTeamsTableData";

describe("eventAmbassadorsFrom", () => {
  it("should return an empty array when the input map is empty", () => {
    const data: EventTeamsTableDataMap = new Map();
    const result = eventAmbassadorsFrom(data);
    expect(result).toEqual([]);
  });

  it("should return a sorted array of unique event ambassadors", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Ambassador2",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional3",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = eventAmbassadorsFrom(data);
    expect(result).toEqual(["Ambassador1", "Ambassador2"]);
  });

  it("should handle case where all event ambassadors are the same", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional3",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = eventAmbassadorsFrom(data);
    expect(result).toEqual(["Ambassador1"]);
  });

  it("should return a sorted array of event ambassadors", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Zoe",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Anna",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Mike",
          regionalAmbassador: "Regional3",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = eventAmbassadorsFrom(data);
    expect(result).toEqual(["Anna", "Mike", "Zoe"]);
  });
});

describe("regionalAmbassadorsFrom", () => {
  it("should return an empty array when the input map is empty", () => {
    const data: EventTeamsTableDataMap = new Map();
    const result = regionalAmbassadorsFrom(data);
    expect(result).toEqual([]);
  });

  it("should return a sorted array of unique regional ambassadors", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Ambassador2",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = regionalAmbassadorsFrom(data);
    expect(result).toEqual(["Regional1", "Regional2"]);
  });

  it("should handle case where all regional ambassadors are the same", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = regionalAmbassadorsFrom(data);
    expect(result).toEqual(["Regional1"]);
  });

  it("should return a sorted array of regional ambassadors", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Zoe",
          regionalAmbassador: "Regional3",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Anna",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Mike",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = regionalAmbassadorsFrom(data);
    expect(result).toEqual(["Regional1", "Regional2", "Regional3"]);
  });

describe("ambassadorNamesFrom", () => {
  it("should return an empty array when the input map is empty", () => {
    const data: EventTeamsTableDataMap = new Map();
    const result = ambassadorNamesFrom(data);
    expect(result).toEqual([]);
  });

  it("should return a sorted array of unique ambassador names", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Ambassador2",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Regional3",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = ambassadorNamesFrom(data);
    expect(result).toEqual(["Ambassador1", "Ambassador2", "Regional1", "Regional2", "Regional3"]);
  });

  it("should handle case where all ambassadors are the same", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Ambassador1",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Ambassador1",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Ambassador1",
          regionalAmbassador: "Ambassador1",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = ambassadorNamesFrom(data);
    expect(result).toEqual(["Ambassador1"]);
  });

  it("should return a sorted array of ambassador names", () => {
    const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>([
      [
        "1",
        {
          eventShortName: "Event1",
          eventDirectors: "Director1",
          eventAmbassador: "Zoe",
          regionalAmbassador: "Regional3",
          eventCoordinates: "Coord1",
          eventSeries: 1,
          eventCountryCode: 1,
          eventCountry: "Country1",
        },
      ],
      [
        "2",
        {
          eventShortName: "Event2",
          eventDirectors: "Director2",
          eventAmbassador: "Anna",
          regionalAmbassador: "Regional1",
          eventCoordinates: "Coord2",
          eventSeries: 2,
          eventCountryCode: 2,
          eventCountry: "Country2",
        },
      ],
      [
        "3",
        {
          eventShortName: "Event3",
          eventDirectors: "Director3",
          eventAmbassador: "Mike",
          regionalAmbassador: "Regional2",
          eventCoordinates: "Coord3",
          eventSeries: 3,
          eventCountryCode: 3,
          eventCountry: "Country3",
        },
      ],
    ]);
    const result = ambassadorNamesFrom(data);
    expect(result).toEqual(["Anna", "Mike", "Regional1", "Regional2", "Regional3", "Zoe"]);
  });
});
});
