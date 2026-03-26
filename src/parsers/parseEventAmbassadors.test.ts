import {
  parseEventAmbassadors,
  type EventAmbassadorRow,
} from "./parseEventAmbassadors";

describe("parseEventAmbassadors", () => {
  it("should ignore unknown columns on each row", () => {
    const data: EventAmbassadorRow[] = [
      {
        "Event Ambassador": "Test EA",
        Events: "Some Event",
        extra_notes: "ignored",
      },
      {
        "Event Ambassador": "",
        Events: "Other Event",
        other: "also ignored",
      },
    ];

    const result = parseEventAmbassadors(data);

    expect(result.size).toBe(1);
    const ea = result.get("Test EA");
    expect(ea?.events).toEqual(["Some Event", "Other Event"]);
  });
});
