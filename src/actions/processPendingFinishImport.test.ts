import {
  clearFinishImportAutoPromptSuppress,
  getPendingFinishImport,
  isFinishImportAutoPromptSuppressed,
  processPendingFinishImport,
  storePendingFinishImport,
} from "./processPendingFinishImport";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { FinishImportPayload } from "@models/FinishImportPayload";

function samplePayload(): FinishImportPayload {
  return {
    schemaVersion: 1,
    parkrunnerId: "1234567",
    sourceUrl: "https://www.parkrun.com.au/parkrunner/1234567/all/",
    importedAt: "2026-06-16T00:00:00.000Z",
    finishes: [],
  };
}

describe("processPendingFinishImport", () => {
  const eventDetails: EventDetailsMap = new Map();
  const eventAmbassadors: EventAmbassadorMap = new Map([
    ["Alex Sample", { name: "Alex Sample", events: [] }],
  ]);
  const regionalAmbassadors: RegionalAmbassadorMap = new Map();
  const log: LogEntry[] = [];

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = "";
    clearFinishImportAutoPromptSuppress();
  });

  it("keeps pending finish import in storage when assign dialog is cancelled", async () => {
    const payload = samplePayload();
    storePendingFinishImport(payload);
    const onComplete = jest.fn();

    const importPromise = processPendingFinishImport(
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      onComplete,
    );

    const cancelButton = document.querySelector<HTMLButtonElement>(
      "button",
    );
    cancelButton?.click();
    const processed = await importPromise;

    expect(processed).toBe(true);
    expect(getPendingFinishImport()).toEqual(payload);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("does not auto-prompt again after assign dialog is cancelled", async () => {
    storePendingFinishImport(samplePayload());
    const onComplete = jest.fn();

    const firstImport = processPendingFinishImport(
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      onComplete,
    );
    document.querySelector<HTMLButtonElement>("button")?.click();
    await firstImport;

    expect(isFinishImportAutoPromptSuppressed()).toBe(true);

    const secondImport = await processPendingFinishImport(
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      onComplete,
    );

    expect(secondImport).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("resumes a suppressed pending finish import when explicitly requested", async () => {
    storePendingFinishImport(samplePayload());
    const onComplete = jest.fn();

    const firstImport = processPendingFinishImport(
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      onComplete,
    );
    document.querySelector<HTMLButtonElement>("button")?.click();
    await firstImport;

    const resumeImport = processPendingFinishImport(
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      onComplete,
      { resume: true },
    );

    expect(
      document.getElementById("assignParkrunnerImportSelect"),
    ).not.toBeNull();

    document.querySelector<HTMLButtonElement>("button")?.click();
    await resumeImport;
  });
});
