import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventAmbassador } from "@models/EventAmbassador";
import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { LogEntry } from "@models/LogEntry";
import { persistEventAmbassadors, persistChangesLog } from "./persistState";
import { persistRegionalAmbassadors } from "./persistState";
import { trackStateChange } from "./trackChanges";

export function validateAmbassadorName(
  name: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): boolean {
  const trimmedName = name.trim();
  if (trimmedName === "") {
    return false;
  }

  if (eventAmbassadors.has(trimmedName)) {
    return false;
  }

  if (regionalAmbassadors.has(trimmedName)) {
    return false;
  }

  return true;
}

export function onboardEventAmbassador(
  name: string,
  state: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  regionalAmbassadorName?: string
): void {
  const trimmedName = name.trim();
  if (!validateAmbassadorName(trimmedName, eventAmbassadors, regionalAmbassadors)) {
    throw new Error("Ambassador name already exists");
  }

  const newAmbassador: EventAmbassador = {
    name: trimmedName,
    events: [],
    state: state,
  };

  eventAmbassadors.set(trimmedName, newAmbassador);
  persistEventAmbassadors(eventAmbassadors);

  log.push({
    type: "onboard event ambassador",
    event: trimmedName,
    oldValue: "",
    newValue: trimmedName,
    timestamp: Date.now(),
  });

  if (regionalAmbassadorName) {
    const rea = regionalAmbassadors.get(regionalAmbassadorName);
    if (!rea) {
      throw new Error(`Regional Ambassador "${regionalAmbassadorName}" not found`);
    }

    newAmbassador.regionalAmbassador = regionalAmbassadorName;
    const oldEAs = [...rea.supportsEAs];
    rea.supportsEAs.push(trimmedName);
    persistEventAmbassadors(eventAmbassadors);
    persistRegionalAmbassadors(regionalAmbassadors);

    log.push({
      type: "assign event ambassador to regional ambassador",
      event: trimmedName,
      oldValue: "",
      newValue: regionalAmbassadorName,
      timestamp: Date.now(),
    });

    log.push({
      type: "add event ambassador to regional supports",
      event: regionalAmbassadorName,
      oldValue: oldEAs.join(", ") || "",
      newValue: rea.supportsEAs.join(", "),
      timestamp: Date.now(),
    });
  }

  persistChangesLog(log);
  trackStateChange();
}

export function onboardRegionalAmbassador(
  name: string,
  state: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void {
  const trimmedName = name.trim();
  if (!validateAmbassadorName(trimmedName, eventAmbassadors, regionalAmbassadors)) {
    throw new Error("Ambassador name already exists");
  }

  const newAmbassador: RegionalAmbassador = {
    name: trimmedName,
    state: state,
    supportsEAs: [],
  };

  regionalAmbassadors.set(trimmedName, newAmbassador);
  persistRegionalAmbassadors(regionalAmbassadors);
  trackStateChange();

  log.push({
    type: "onboard regional ambassador",
    event: trimmedName,
    oldValue: "",
    newValue: trimmedName,
    timestamp: Date.now(),
  });
}

