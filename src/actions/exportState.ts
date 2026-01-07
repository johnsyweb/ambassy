import { ApplicationState } from "@models/ApplicationState";
import { loadFromStorage } from "@utils/storage";

export function exportApplicationState(): Blob {
  const eventAmbassadors = loadFromStorage<Array<[string, import("@models/EventAmbassador").EventAmbassador]>>("eventAmbassadors");
  const eventTeams = loadFromStorage<Array<[string, import("@models/EventTeam").EventTeam]>>("eventTeams");
  const regionalAmbassadors = loadFromStorage<Array<[string, import("@models/RegionalAmbassador").RegionalAmbassador]>>("regionalAmbassadors");
  const changesLog = loadFromStorage<import("@models/LogEntry").LogEntry[]>("changesLog");

  if (eventAmbassadors === null || eventTeams === null || regionalAmbassadors === null || changesLog === null) {
    throw new Error("Cannot export: incomplete application state");
  }

  const state: ApplicationState = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: {
      eventAmbassadors,
      eventTeams,
      regionalAmbassadors,
      changesLog,
    },
  };

  const json = JSON.stringify(state, null, 2);
  return new Blob([json], { type: "application/json" });
}

export function downloadStateFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

