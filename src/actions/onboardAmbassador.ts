import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventAmbassador } from "@models/EventAmbassador";
import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { LogEntry } from "@models/LogEntry";
import { persistEventAmbassadors } from "./persistState";
import { persistRegionalAmbassadors } from "./persistState";

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
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void {
  const trimmedName = name.trim();
  if (!validateAmbassadorName(trimmedName, eventAmbassadors, regionalAmbassadors)) {
    throw new Error("Ambassador name already exists");
  }

  const newAmbassador: EventAmbassador = {
    name: trimmedName,
    events: [],
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

  log.push({
    type: "onboard regional ambassador",
    event: trimmedName,
    oldValue: "",
    newValue: trimmedName,
    timestamp: Date.now(),
  });
}

