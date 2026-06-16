import {
  setEventAmbassadorHomeParkrun,
  mergePreservedHomeParkruns,
} from "./setEventAmbassadorHomeParkrun";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";

jest.mock("./persistState", () => ({
  persistEventAmbassadors: jest.fn(),
}));

jest.mock("./trackChanges", () => ({
  trackStateChange: jest.fn(),
}));

describe("setEventAmbassadorHomeParkrun", () => {
  it("logs when home parkrun changes", () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["David", { name: "David", events: ["Event A"] }],
    ]);
    const log: import("@models/LogEntry").LogEntry[] = [];

    setEventAmbassadorHomeParkrun(
      "David",
      "Jamestown Golf Course",
      eventAmbassadors,
      log,
    );

    expect(eventAmbassadors.get("David")?.homeParkrun).toBe(
      "Jamestown Golf Course",
    );
    expect(log).toEqual([
      expect.objectContaining({
        type: "Home Parkrun Updated",
        event: "David",
        oldValue: "—",
        newValue: "Jamestown Golf Course",
      }),
    ]);
  });
});

describe("mergePreservedHomeParkruns", () => {
  it("preserves existing home parkrun when CSV cell is blank", () => {
    const parsed: EventAmbassadorMap = new Map([
      ["David", { name: "David", events: ["Event A"] }],
    ]);
    const existing: EventAmbassadorMap = new Map([
      [
        "David",
        {
          name: "David",
          events: ["Event A"],
          homeParkrun: "Jamestown Golf Course",
        },
      ],
    ]);

    mergePreservedHomeParkruns(parsed, existing);

    expect(parsed.get("David")?.homeParkrun).toBe("Jamestown Golf Course");
  });
});
