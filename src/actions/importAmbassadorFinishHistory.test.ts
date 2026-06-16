import { importAmbassadorFinishHistory } from "./importAmbassadorFinishHistory";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventDetails } from "@models/EventDetails";
import { LogEntry } from "@models/LogEntry";
import { loadAmbassadorFinishHistories } from "./persistAmbassadorFinishHistory";

function greenheartEvent(): EventDetails {
  return {
    id: "greenheartrobinaparklands",
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [153.38233, -28.06302],
    },
    properties: {
      eventname: "greenheartrobinaparklands",
      EventLongName: "Greenheart Robina Parklands parkrun",
      EventShortName: "Greenheart Robina Parklands",
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "Robina",
    },
  };
}

describe("importAmbassadorFinishHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("merges matched finishes and discards unknown events", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Pete Robinson",
        { name: "Pete Robinson", events: [], parkrunnerId: "1001388" },
      ],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();
    const eventDetails: EventDetailsMap = new Map([
      ["Greenheart Robina Parklands", greenheartEvent()],
    ]);
    const log: LogEntry[] = [];

    importAmbassadorFinishHistory(
      {
        schemaVersion: 1,
        parkrunnerId: "1001388",
        sourceUrl: "https://www.parkrun.com.au/parkrunner/1001388/all/",
        importedAt: "2026-06-16T00:00:00.000Z",
        finishes: [
          {
            eventSlug: "greenheartrobinaparklands",
            eventName: "Greenheart Robina Parklands",
            date: "2026-06-13",
            domain: "www.parkrun.com.au",
          },
          {
            eventSlug: "unknown-event",
            eventName: "Unknown Event",
            date: "2026-05-01",
            domain: "www.parkrun.com.au",
          },
        ],
      },
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );

    const histories = loadAmbassadorFinishHistories();
    expect(histories["ea:Pete Robinson"]?.finishesByEvent).toEqual({
      "Greenheart Robina Parklands": "2026-06-13",
    });
    expect(log[0]).toEqual(
      expect.objectContaining({
        type: "Visit History Imported",
        newValue: "1 events (1 discarded)",
      }),
    );
  });

  it("keeps only the most recent finish per event slug before matching", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Pete Robinson",
        { name: "Pete Robinson", events: [], parkrunnerId: "1001388" },
      ],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();
    const eventDetails: EventDetailsMap = new Map([
      ["Greenheart Robina Parklands", greenheartEvent()],
    ]);
    const log: LogEntry[] = [];

    importAmbassadorFinishHistory(
      {
        schemaVersion: 1,
        parkrunnerId: "1001388",
        sourceUrl: "https://www.parkrun.com.au/parkrunner/1001388/all/",
        importedAt: "2026-06-16T00:00:00.000Z",
        finishes: [
          {
            eventSlug: "greenheartrobinaparklands",
            eventName: "Greenheart Robina Parklands",
            date: "2024-01-01",
            domain: "www.parkrun.com.au",
          },
          {
            eventSlug: "greenheartrobinaparklands",
            eventName: "Greenheart Robina Parklands",
            date: "2026-06-13",
            domain: "www.parkrun.com.au",
          },
        ],
      },
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );

    const histories = loadAmbassadorFinishHistories();
    expect(histories["ea:Pete Robinson"]?.finishesByEvent).toEqual({
      "Greenheart Robina Parklands": "2026-06-13",
    });
    expect(log[0]).toEqual(
      expect.objectContaining({
        newValue: "1 events (0 discarded)",
      }),
    );
  });
});
