import { EventTeam } from "@models/EventTeam";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { LogEntry } from "@models/LogEntry";
import { findCanonicalEventShortName } from "@utils/findCanonicalEventShortName";

export function canonicaliseAllocationNames(
  eventAmbassadors: EventAmbassadorMap,
  eventTeams: EventTeamMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
): boolean {
  let changed = false;

  changed =
    canonicaliseEventAmbassadorAllocations(
      eventAmbassadors,
      eventDetails,
      log,
    ) || changed;
  changed =
    canonicaliseEventTeamAllocations(
      eventAmbassadors,
      eventTeams,
      eventDetails,
      log,
    ) || changed;

  return changed;
}

function canonicaliseEventAmbassadorAllocations(
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
): boolean {
  let changed = false;

  for (const ambassador of eventAmbassadors.values()) {
    const rewrittenEvents: string[] = [];

    for (const eventName of ambassador.events) {
      const canonicalName = findCanonicalEventShortName(
        eventName,
        eventDetails,
      );
      const resolvedName = canonicalName ?? eventName;

      if (canonicalName && canonicalName !== eventName) {
        log.push({
          type: "Event Name Canonicalised",
          event: eventName,
          oldValue: eventName,
          newValue: canonicalName,
          timestamp: Date.now(),
        });
        changed = true;
      }

      rewrittenEvents.push(resolvedName);
    }

    ambassador.events = dedupeAllocationNames(rewrittenEvents, log, () => {
      changed = true;
    });
  }

  return changed;
}

function canonicaliseEventTeamAllocations(
  eventAmbassadors: EventAmbassadorMap,
  eventTeams: EventTeamMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
): boolean {
  if (eventTeams.size === 0) {
    return false;
  }

  let changed = false;
  const canonicalTeams = new Map<string, EventTeam>();

  for (const [eventName, team] of eventTeams) {
    const canonicalName = findCanonicalEventShortName(eventName, eventDetails);
    const resolvedName = canonicalName ?? eventName;

    if (canonicalName && canonicalName !== eventName) {
      log.push({
        type: "Event Name Canonicalised",
        event: eventName,
        oldValue: eventName,
        newValue: canonicalName,
        timestamp: Date.now(),
      });
      changed = true;
    }

    const existing = canonicalTeams.get(resolvedName);
    if (existing) {
      mergeEventTeamDirectors(existing, team);
      existing.eventAmbassador =
        findEventAmbassadorForEvent(resolvedName, eventAmbassadors) ??
        existing.eventAmbassador;
      logDuplicateRemoval(eventName, resolvedName, log, () => {
        changed = true;
      });
      continue;
    }

    canonicalTeams.set(resolvedName, {
      eventShortName: resolvedName,
      eventAmbassador:
        findEventAmbassadorForEvent(resolvedName, eventAmbassadors) ??
        team.eventAmbassador,
      eventDirectors: [...team.eventDirectors],
    });
  }

  eventTeams.clear();
  for (const [name, team] of canonicalTeams) {
    eventTeams.set(name, team);
  }

  return changed;
}

function mergeEventTeamDirectors(target: EventTeam, source: EventTeam): void {
  for (const director of source.eventDirectors) {
    if (!target.eventDirectors.includes(director)) {
      target.eventDirectors.push(director);
    }
  }
}

function findEventAmbassadorForEvent(
  eventName: string,
  eventAmbassadors: EventAmbassadorMap,
): string | undefined {
  for (const ambassador of eventAmbassadors.values()) {
    if (ambassador.events.includes(eventName)) {
      return ambassador.name;
    }
  }

  return undefined;
}

function dedupeAllocationNames(
  events: string[],
  log: LogEntry[],
  onChanged: () => void,
): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const eventName of events) {
    if (seen.has(eventName)) {
      log.push({
        type: "Duplicate Allocation Removed",
        event: eventName,
        oldValue: eventName,
        newValue: eventName,
        timestamp: Date.now(),
      });
      onChanged();
      continue;
    }

    seen.add(eventName);
    deduped.push(eventName);
  }

  return deduped;
}

function logDuplicateRemoval(
  removedName: string,
  canonicalName: string,
  log: LogEntry[],
  onChanged: () => void,
): void {
  if (removedName === canonicalName) {
    return;
  }

  log.push({
    type: "Duplicate Allocation Removed",
    event: removedName,
    oldValue: removedName,
    newValue: canonicalName,
    timestamp: Date.now(),
  });
  onChanged();
}
