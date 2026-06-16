import { showAssignParkrunnerImportDialog } from "./showAssignParkrunnerImportDialog";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";

describe("showAssignParkrunnerImportDialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("pre-selects the ambassador when a unique profile display name match is provided", async () => {
    const eventAmbassadors: EventAmbassadorMap = new Map([
      ["Alex Sample", { name: "Alex Sample", events: [] }],
      ["Kim Example", { name: "Kim Example", events: [] }],
    ]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();
    const log: LogEntry[] = [];

    const dialogPromise = showAssignParkrunnerImportDialog(
      "1234567",
      eventAmbassadors,
      regionalAmbassadors,
      log,
      {
        parkrunProfileDisplayName: "ALEX SAMPLE",
      },
    );

    const select = document.getElementById(
      "assignParkrunnerImportSelect",
    ) as HTMLSelectElement;
    expect(select.value).toBe("ea:Alex Sample");

    document.querySelector<HTMLButtonElement>("button")?.click();
    await dialogPromise;
  });
});
