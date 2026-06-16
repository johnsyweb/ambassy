import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import {
  AmbassadorRole,
  ambassadorFinishHistoryKey,
} from "@models/AmbassadorFinishHistory";
import { LogEntry } from "@models/LogEntry";
import {
  formatParkrunnerIdForDisplay,
  isValidParkrunnerIdInput,
  normalizeParkrunnerIdForStorage,
  parkrunnerIdsMatch,
} from "@utils/parkrunnerProfileUrl";
import { trackStateChange } from "./trackChanges";
import {
  persistEventAmbassadors,
  persistRegionalAmbassadors,
} from "./persistState";

export interface AmbassadorReference {
  role: AmbassadorRole;
  name: string;
}

export function findAmbassadorByParkrunnerId(
  parkrunnerId: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
): AmbassadorReference | undefined {
  for (const [name, ambassador] of eventAmbassadors) {
    if (
      ambassador.parkrunnerId &&
      parkrunnerIdsMatch(ambassador.parkrunnerId, parkrunnerId)
    ) {
      return { role: "ea", name };
    }
  }

  for (const [name, ambassador] of regionalAmbassadors) {
    if (
      ambassador.parkrunnerId &&
      parkrunnerIdsMatch(ambassador.parkrunnerId, parkrunnerId)
    ) {
      return { role: "rea", name };
    }
  }

  return undefined;
}

export function setAmbassadorParkrunnerId(
  ambassador: AmbassadorReference,
  parkrunnerId: string | undefined,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): void {
  const normalizedId = parkrunnerId?.trim();
  if (normalizedId && !isValidParkrunnerIdInput(normalizedId)) {
    throw new Error(
      "parkrunner ID must be digits, optionally prefixed with A (e.g. A1001388).",
    );
  }

  if (normalizedId) {
    const storedId = normalizeParkrunnerIdForStorage(normalizedId);
    setStoredParkrunnerId(
      ambassador,
      storedId,
      eventAmbassadors,
      regionalAmbassadors,
      log,
    );
    return;
  }

  setStoredParkrunnerId(
    ambassador,
    undefined,
    eventAmbassadors,
    regionalAmbassadors,
    log,
  );
}

function setStoredParkrunnerId(
  ambassador: AmbassadorReference,
  parkrunnerId: string | undefined,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): void {
  if (ambassador.role === "ea") {
    setEventAmbassadorParkrunnerId(
      ambassador.name,
      parkrunnerId,
      eventAmbassadors,
      log,
    );
    return;
  }

  setRegionalAmbassadorParkrunnerId(
    ambassador.name,
    parkrunnerId,
    regionalAmbassadors,
    log,
  );
}

function setEventAmbassadorParkrunnerId(
  eaName: string,
  parkrunnerId: string | undefined,
  eventAmbassadors: EventAmbassadorMap,
  log: LogEntry[],
): void {
  const ambassador = eventAmbassadors.get(eaName);
  if (!ambassador) {
    throw new Error(`Event Ambassador "${eaName}" not found`);
  }

  const previousValue = ambassador.parkrunnerId;
  if (previousValue === parkrunnerId) {
    return;
  }

  ambassador.parkrunnerId = parkrunnerId;
  eventAmbassadors.set(eaName, ambassador);
  trackStateChange();
  persistEventAmbassadors(eventAmbassadors);

  log.push({
    type: "parkrunner ID updated",
    event: eaName,
    oldValue: formatParkrunnerIdForDisplay(previousValue),
    newValue: formatParkrunnerIdForDisplay(parkrunnerId),
    timestamp: Date.now(),
  });
}

function setRegionalAmbassadorParkrunnerId(
  reaName: string,
  parkrunnerId: string | undefined,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): void {
  const ambassador = regionalAmbassadors.get(reaName);
  if (!ambassador) {
    throw new Error(`Regional Event Ambassador "${reaName}" not found`);
  }

  const previousValue = ambassador.parkrunnerId;
  if (previousValue === parkrunnerId) {
    return;
  }

  ambassador.parkrunnerId = parkrunnerId;
  regionalAmbassadors.set(reaName, ambassador);
  trackStateChange();
  persistRegionalAmbassadors(regionalAmbassadors);

  log.push({
    type: "parkrunner ID updated",
    event: reaName,
    oldValue: formatParkrunnerIdForDisplay(previousValue),
    newValue: formatParkrunnerIdForDisplay(parkrunnerId),
    timestamp: Date.now(),
  });
}

export function canonicaliseAmbassadorParkrunnerIds(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
): boolean {
  let changed = false;

  for (const ambassador of eventAmbassadors.values()) {
    if (!ambassador.parkrunnerId) {
      continue;
    }

    const normalized = normalizeParkrunnerIdForStorage(ambassador.parkrunnerId);
    if (normalized !== ambassador.parkrunnerId) {
      ambassador.parkrunnerId = normalized;
      changed = true;
    }
  }

  for (const ambassador of regionalAmbassadors.values()) {
    if (!ambassador.parkrunnerId) {
      continue;
    }

    const normalized = normalizeParkrunnerIdForStorage(ambassador.parkrunnerId);
    if (normalized !== ambassador.parkrunnerId) {
      ambassador.parkrunnerId = normalized;
      changed = true;
    }
  }

  return changed;
}

export function mergePreservedParkrunnerIds(
  parsedEventAmbassadors: EventAmbassadorMap,
  existingEventAmbassadors: EventAmbassadorMap,
  parsedRegionalAmbassadors: RegionalAmbassadorMap,
  existingRegionalAmbassadors: RegionalAmbassadorMap,
): void {
  for (const [name, ambassador] of parsedEventAmbassadors) {
    if (!ambassador.parkrunnerId) {
      const previous = existingEventAmbassadors.get(name);
      if (previous?.parkrunnerId) {
        ambassador.parkrunnerId = previous.parkrunnerId;
      }
    }
  }

  for (const [name, ambassador] of parsedRegionalAmbassadors) {
    if (!ambassador.parkrunnerId) {
      const previous = existingRegionalAmbassadors.get(name);
      if (previous?.parkrunnerId) {
        ambassador.parkrunnerId = previous.parkrunnerId;
      }
    }
  }
}

export function listAmbassadorOptions(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
): Array<{ role: AmbassadorRole; name: string; label: string }> {
  const options: Array<{ role: AmbassadorRole; name: string; label: string }> =
    [];

  for (const name of [...eventAmbassadors.keys()].sort((a, b) =>
    a.localeCompare(b),
  )) {
    options.push({
      role: "ea",
      name,
      label: `Event Ambassador: ${name}`,
    });
  }

  for (const name of [...regionalAmbassadors.keys()].sort((a, b) =>
    a.localeCompare(b),
  )) {
    options.push({
      role: "rea",
      name,
      label: `Regional Event Ambassador: ${name}`,
    });
  }

  return options;
}

export function ambassadorHistoryStorageKey(
  ambassador: AmbassadorReference,
): string {
  return ambassadorFinishHistoryKey(ambassador.role, ambassador.name);
}
