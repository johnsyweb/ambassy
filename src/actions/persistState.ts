import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { ApplicationState } from "@models/ApplicationState";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { saveToStorage, loadFromStorage, migrateFromSessionStorage } from "@utils/storage";

export function persistEventAmbassadors(eventAmbassadors: EventAmbassadorMap): void {
  saveToStorage("eventAmbassadors", Array.from(eventAmbassadors.entries()));
}

export function persistEventTeams(eventTeams: EventTeamMap): void {
  saveToStorage("eventTeams", Array.from(eventTeams.entries()));
}

export function persistRegionalAmbassadors(regionalAmbassadors: RegionalAmbassadorMap): void {
  saveToStorage("regionalAmbassadors", Array.from(regionalAmbassadors.entries()));
}

export function persistChangesLog(changesLog: LogEntry[]): void {
  saveToStorage("changesLog", changesLog);
}

export function persistEventDetails(eventDetailsMap: EventDetailsMap): void {
  const CACHE_KEY = 'parkrun events';

  // Always update the cache with fresh timestamp and current eventDetailsMap
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    timestamp: Date.now(),
    eventDetailsMap: Array.from(eventDetailsMap.entries())
  }));
}

export function restoreApplicationState(): ApplicationState | null {
  migrateFromSessionStorage();

  const eventAmbassadors = loadFromStorage<Array<[string, import("@models/EventAmbassador").EventAmbassador]>>("eventAmbassadors");
  const eventTeams = loadFromStorage<Array<[string, import("@models/EventTeam").EventTeam]>>("eventTeams");
  const regionalAmbassadors = loadFromStorage<Array<[string, import("@models/RegionalAmbassador").RegionalAmbassador]>>("regionalAmbassadors");
  const changesLog = loadFromStorage<LogEntry[]>("changesLog");

  if (eventAmbassadors === null || eventTeams === null || regionalAmbassadors === null || changesLog === null) {
    return null;
  }

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: {
      eventAmbassadors,
      eventTeams,
      regionalAmbassadors,
      changesLog,
    },
  };
}

