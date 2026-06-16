import { canonicaliseAllocationNames } from "./canonicaliseAllocationNames";
import { detectIssues } from "./detectIssues";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetails } from "@models/EventDetails";
import { LogEntry } from "@models/LogEntry";

function albertMelbourneEvent(): EventDetails {
  return {
    id: "albertmelbourne",
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [144.9631, -37.8136],
    },
    properties: {
      eventname: "albertmelbourne",
      EventLongName: "Albert Melbourne parkrun",
      EventShortName: "Albert Melbourne",
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "Melbourne",
    },
  };
}

describe("canonicaliseAllocationNames", () => {
  it("rewrites Event Ambassador allocations to the canonical event name and logs the rename", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Susan Kennedy",
        {
          name: "Susan Kennedy",
          events: ["Albert, Melbourne"],
        },
      ],
    ]);
    const eventTeams: EventTeamMap = new Map();
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);
    const log: LogEntry[] = [];

    const changed = canonicaliseAllocationNames(
      eventAmbassadors,
      eventTeams,
      eventDetails,
      log,
    );

    expect(changed).toBe(true);
    expect(eventAmbassadors.get("Susan Kennedy")?.events).toEqual([
      "Albert Melbourne",
    ]);
    expect(log).toEqual([
      expect.objectContaining({
        type: "Event Name Canonicalised",
        event: "Albert, Melbourne",
        oldValue: "Albert, Melbourne",
        newValue: "Albert Melbourne",
      }),
    ]);
  });

  it("does not change allocations or log when names are already canonical", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Susan Kennedy",
        {
          name: "Susan Kennedy",
          events: ["Albert Melbourne"],
        },
      ],
    ]);
    const eventTeams: EventTeamMap = new Map();
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);
    const log: LogEntry[] = [];

    const changed = canonicaliseAllocationNames(
      eventAmbassadors,
      eventTeams,
      eventDetails,
      log,
    );

    expect(changed).toBe(false);
    expect(log).toHaveLength(0);
  });

  it("merges Event Teams directors when variant and canonical keys both exist", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Susan Kennedy",
        {
          name: "Susan Kennedy",
          events: ["Albert Melbourne"],
        },
      ],
    ]);
    const eventTeams: EventTeamMap = new Map([
      [
        "Albert, Melbourne",
        {
          eventShortName: "Albert, Melbourne",
          eventAmbassador: "Ignored",
          eventDirectors: ["Den Watts"],
        },
      ],
      [
        "Albert Melbourne",
        {
          eventShortName: "Albert Melbourne",
          eventAmbassador: "Ignored",
          eventDirectors: ["Angie Watts"],
        },
      ],
    ]);
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);
    const log: LogEntry[] = [];

    canonicaliseAllocationNames(
      eventAmbassadors,
      eventTeams,
      eventDetails,
      log,
    );

    expect(eventTeams.get("Albert Melbourne")).toEqual({
      eventShortName: "Albert Melbourne",
      eventAmbassador: "Susan Kennedy",
      eventDirectors: ["Den Watts", "Angie Watts"],
    });
    expect(eventTeams.has("Albert, Melbourne")).toBe(false);
  });

  it("logs duplicate allocation removal when an EA lists both name variants", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Susan Kennedy",
        {
          name: "Susan Kennedy",
          events: ["Albert, Melbourne", "Albert Melbourne"],
        },
      ],
    ]);
    const eventTeams: EventTeamMap = new Map();
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);
    const log: LogEntry[] = [];

    canonicaliseAllocationNames(
      eventAmbassadors,
      eventTeams,
      eventDetails,
      log,
    );

    expect(eventAmbassadors.get("Susan Kennedy")?.events).toEqual([
      "Albert Melbourne",
    ]);
    expect(log).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "Event Name Canonicalised",
          event: "Albert, Melbourne",
          newValue: "Albert Melbourne",
        }),
        expect.objectContaining({
          type: "Duplicate Allocation Removed",
          event: "Albert Melbourne",
        }),
      ]),
    );
  });

  it("prevents missing coordinate issues after canonicalising a comma variant", () => {
    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      [
        "Chris Hoy Poy",
        {
          name: "Chris Hoy Poy",
          state: "VIC",
          supportsEAs: ["Susan Kennedy"],
        },
      ],
    ]);
    const eventAmbassadors: EventAmbassadorMap = new Map([
      [
        "Susan Kennedy",
        {
          name: "Susan Kennedy",
          events: ["Albert, Melbourne"],
        },
      ],
    ]);
    const eventTeams: EventTeamMap = new Map();
    const eventDetails: EventDetailsMap = new Map([
      ["Albert Melbourne", albertMelbourneEvent()],
    ]);
    const log: LogEntry[] = [];

    canonicaliseAllocationNames(
      eventAmbassadors,
      eventTeams,
      eventDetails,
      log,
    );

    const issues = detectIssues(
      eventTeams,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
    );

    expect(issues).toHaveLength(0);
  });
});
