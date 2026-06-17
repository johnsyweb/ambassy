import { enrichEventTeamsWithLastAmbassadorVisit } from "./enrichEventTeamsWithLastAmbassadorVisit";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import {
  LAST_AMBASSADOR_VISIT_NONE_ON_RECORD,
  LAST_AMBASSADOR_VISIT_NOT_IMPORTED,
} from "@utils/computeLastAmbassadorVisit";

describe("enrichEventTeamsWithLastAmbassadorVisit", () => {
  const eventTeamsTableData: EventTeamsTableDataMap = new Map([
    [
      "Albert",
      {
        eventShortName: "Albert",
        eventDirectors: "Director",
        eventAmbassador: "EA One",
        regionalAmbassador: "REA One",
        eventCoordinates: "0, 0",
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: "Australia",
      },
    ],
  ]);
  const eventAmbassadors: EventAmbassadorMap = new Map([
    ["EA One", { name: "EA One", events: ["Albert"] }],
  ]);
  const regionalAmbassadors: RegionalAmbassadorMap = new Map([
    ["REA One", { name: "REA One", state: "VIC", supportsEAs: ["EA One"] }],
  ]);

  it("marks events as not imported when no visit history exists", () => {
    enrichEventTeamsWithLastAmbassadorVisit(
      eventTeamsTableData,
      eventAmbassadors,
      regionalAmbassadors,
      {},
    );

    expect(eventTeamsTableData.get("Albert")?.lastAmbassadorVisit).toBe(
      LAST_AMBASSADOR_VISIT_NOT_IMPORTED,
    );
  });

  it("marks events with no matching finish as no visit on record", () => {
    enrichEventTeamsWithLastAmbassadorVisit(
      eventTeamsTableData,
      eventAmbassadors,
      regionalAmbassadors,
      {
        "ea:EA One": {
          parkrunnerId: "1001388",
          finishesByEvent: { Coburg: "2026-06-13" },
          lastImportedAt: 1,
        },
      },
    );

    expect(eventTeamsTableData.get("Albert")?.lastAmbassadorVisit).toBe(
      LAST_AMBASSADOR_VISIT_NONE_ON_RECORD,
    );
  });
});
