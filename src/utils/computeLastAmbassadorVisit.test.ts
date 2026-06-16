import { computeLastAmbassadorVisitByEvent } from "./computeLastAmbassadorVisit";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { AmbassadorFinishHistoryMap } from "@models/AmbassadorFinishHistory";

describe("computeLastAmbassadorVisitByEvent", () => {
  const eventAmbassadors: EventAmbassadorMap = new Map([
    ["Pete Robinson", { name: "Pete Robinson", events: ["Event A"] }],
    ["Kim De Waal", { name: "Kim De Waal", events: ["Event B"] }],
  ]);
  const regionalAmbassadors: RegionalAmbassadorMap = new Map([
    [
      "Rhondda Wetton",
      { name: "Rhondda Wetton", state: "QLD", supportsEAs: ["Kim De Waal"] },
    ],
  ]);

  it("returns the latest finish with all ambassadors tied on the same date", () => {
    const finishHistories: AmbassadorFinishHistoryMap = {
      "ea:Pete Robinson": {
        parkrunnerId: "1001388",
        finishesByEvent: {
          "Greenheart Robina Parklands": "2026-06-13",
        },
        lastImportedAt: 1,
      },
      "ea:Kim De Waal": {
        parkrunnerId: "2001",
        finishesByEvent: {
          "Greenheart Robina Parklands": "2026-06-13",
        },
        lastImportedAt: 1,
      },
    };

    const result = computeLastAmbassadorVisitByEvent(
      ["Greenheart Robina Parklands"],
      eventAmbassadors,
      regionalAmbassadors,
      finishHistories,
    );

    expect(result.get("Greenheart Robina Parklands")).toBe(
      "Kim De Waal; Pete Robinson — 13 Jun 2026",
    );
  });

  it("returns N/A when no imported finish exists for the event", () => {
    const result = computeLastAmbassadorVisitByEvent(
      ["Greenheart Robina Parklands"],
      eventAmbassadors,
      regionalAmbassadors,
      {},
    );

    expect(result.get("Greenheart Robina Parklands")).toBe("N/A");
  });

  it("uses the most recent finish across ambassadors", () => {
    const finishHistories: AmbassadorFinishHistoryMap = {
      "ea:Pete Robinson": {
        parkrunnerId: "1001388",
        finishesByEvent: {
          "Greenheart Robina Parklands": "2026-06-13",
        },
        lastImportedAt: 1,
      },
      "rea:Rhondda Wetton": {
        parkrunnerId: "3001",
        finishesByEvent: {
          "Greenheart Robina Parklands": "2026-07-01",
        },
        lastImportedAt: 1,
      },
    };

    const result = computeLastAmbassadorVisitByEvent(
      ["Greenheart Robina Parklands"],
      eventAmbassadors,
      regionalAmbassadors,
      finishHistories,
    );

    expect(result.get("Greenheart Robina Parklands")).toBe(
      "Rhondda Wetton — 1 Jul 2026",
    );
  });
});
