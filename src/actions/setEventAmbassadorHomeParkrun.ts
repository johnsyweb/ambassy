import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { findCanonicalEventShortName } from "@utils/findCanonicalEventShortName";
import { trackStateChange } from "./trackChanges";
import { persistEventAmbassadors } from "./persistState";

export function setEventAmbassadorHomeParkrun(
  eaName: string,
  homeParkrun: string | undefined,
  eventAmbassadors: EventAmbassadorMap,
  log: LogEntry[],
): void {
  const ambassador = eventAmbassadors.get(eaName);
  if (!ambassador) {
    throw new Error(`Event Ambassador "${eaName}" not found`);
  }

  const previousValue = ambassador.homeParkrun;
  if (previousValue === homeParkrun) {
    return;
  }

  ambassador.homeParkrun = homeParkrun;
  eventAmbassadors.set(eaName, ambassador);
  trackStateChange();
  persistEventAmbassadors(eventAmbassadors);

  log.push({
    type: "Home Parkrun Updated",
    event: eaName,
    oldValue: previousValue ?? "—",
    newValue: homeParkrun ?? "—",
    timestamp: Date.now(),
  });
}

export function canonicaliseEventAmbassadorHomeParkruns(
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
): boolean {
  let changed = false;

  for (const [eaName, ambassador] of eventAmbassadors) {
    if (!ambassador.homeParkrun) {
      continue;
    }

    const original = ambassador.homeParkrun;
    const resolved = resolveHomeParkrun(original, eventDetails);

    if (resolved === original) {
      continue;
    }

    ambassador.homeParkrun = resolved;
    eventAmbassadors.set(eaName, ambassador);
    changed = true;

    if (!resolved) {
      log.push({
        type: "Home Parkrun Warning",
        event: eaName,
        oldValue: original,
        newValue: "Could not resolve home parkrun in events.json",
        timestamp: Date.now(),
      });
    }
  }

  return changed;
}

function resolveHomeParkrun(
  homeParkrun: string,
  eventDetails: EventDetailsMap,
): string | undefined {
  const direct = eventDetails.get(homeParkrun);
  if (hasValidCoordinates(direct)) {
    return direct!.properties.EventShortName;
  }

  const canonical = findCanonicalEventShortName(homeParkrun, eventDetails);
  if (!canonical) {
    return undefined;
  }

  const canonicalEvent = eventDetails.get(canonical);
  return hasValidCoordinates(canonicalEvent) ? canonical : undefined;
}

function hasValidCoordinates(event: EventDetails | undefined): boolean {
  return Boolean(
    event?.geometry?.coordinates &&
    event.geometry.coordinates.length === 2 &&
    typeof event.geometry.coordinates[0] === "number" &&
    typeof event.geometry.coordinates[1] === "number",
  );
}

export function mergePreservedHomeParkruns(
  parsed: EventAmbassadorMap,
  existing: EventAmbassadorMap,
): void {
  for (const [name, ambassador] of parsed) {
    if (!ambassador.homeParkrun) {
      const previous = existing.get(name);
      if (previous?.homeParkrun) {
        ambassador.homeParkrun = previous.homeParkrun;
      }
    }
  }
}
