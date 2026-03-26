import { parseEventAmbassadors } from "./parseEventAmbassadors";

describe("parseEventAmbassadors", () => {
  it("should ignore unknown columns on each row", () => {
    const data: Record<string, unknown>[] = [
      {
        "Event Ambassador": "Test EA",
        Events: "Some Event",
        extra: "ignored",
      },
      {
        "Event Ambassador": "",
        Events: "Other Event",
        notes: "also ignored",
      },
    ];

    const result = parseEventAmbassadors(data);

    expect(result.size).toBe(1);
    const ea = result.get("Test EA");
    expect(ea?.events).toEqual(["Some Event", "Other Event"]);
  });
});
