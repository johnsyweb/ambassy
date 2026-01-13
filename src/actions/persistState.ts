import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { ApplicationState } from "@models/ApplicationState";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { saveToStorage, loadFromStorage, migrateFromSessionStorage } from "@utils/storage";
import { EventAmbassador } from "@models/EventAmbassador";
import { RegionalAmbassador } from "@models/RegionalAmbassador";

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

/**
 * Migrate existing EventAmbassador data to include prospectiveEvents field
 */
function migrateEventAmbassadorData(eventAmbassadors: EventAmbassadorMap): EventAmbassadorMap {
  const migrated = new Map<string, EventAmbassador>();

  for (const [key, ea] of eventAmbassadors.entries()) {
    migrated.set(key, {
      ...ea,
      prospectiveEvents: ea.prospectiveEvents || [], // Ensure field exists
      regionalAmbassador: ea.regionalAmbassador || undefined // Ensure field exists
    });
  }

  return migrated;
}

/**
 * Migrate existing RegionalAmbassador data to include prospectiveEvents field
 */
function migrateRegionalAmbassadorData(regionalAmbassadors: RegionalAmbassadorMap): RegionalAmbassadorMap {
  const migrated = new Map<string, RegionalAmbassador>();

  for (const [key, ra] of regionalAmbassadors.entries()) {
    migrated.set(key, {
      ...ra,
      prospectiveEvents: ra.prospectiveEvents || [] // Ensure field exists
    });
  }

  return migrated;
}

export function restoreApplicationState(): ApplicationState | null {
  migrateFromSessionStorage();

  const eventAmbassadorsRaw = loadFromStorage<Array<[string, import("@models/EventAmbassador").EventAmbassador]>>("eventAmbassadors");
  const eventTeams = loadFromStorage<Array<[string, import("@models/EventTeam").EventTeam]>>("eventTeams");
  const regionalAmbassadorsRaw = loadFromStorage<Array<[string, import("@models/RegionalAmbassador").RegionalAmbassador]>>("regionalAmbassadors");
  const changesLog = loadFromStorage<LogEntry[]>("changesLog");

  if (eventAmbassadorsRaw === null || eventTeams === null || regionalAmbassadorsRaw === null || changesLog === null) {
    return null;
  }

  // Apply migrations for backward compatibility
  const eventAmbassadorsMap = migrateEventAmbassadorData(new Map(eventAmbassadorsRaw));
  const regionalAmbassadorsMap = migrateRegionalAmbassadorData(new Map(regionalAmbassadorsRaw));

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: {
      eventAmbassadors: Array.from(eventAmbassadorsMap.entries()),
      eventTeams,
      regionalAmbassadors: Array.from(regionalAmbassadorsMap.entries()),
      changesLog,
    },
  };
}

