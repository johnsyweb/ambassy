import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { persistRegionalAmbassadors, persistEventAmbassadors } from "./persistState";
import { calculateAllCapacityStatuses, loadCapacityLimits } from "./checkCapacity";
import { trackStateChange } from "./trackChanges";

/**
 * Reallocate an Event Ambassador from one Regional Ambassador to another.
 * Updates the REA's supportsEAs array, persists changes, recalculates capacity statuses, and logs the change.
 */
export function reallocateEventAmbassador(
  eventAmbassadorName: string,
  oldREA: string | null,
  newREA: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[]
): void {
  // Remove EA from old REA's supportsEAs array
  if (oldREA && oldREA.trim() !== "") {
    const oldREAObj = regionalAmbassadors.get(oldREA);
    if (oldREAObj) {
      const eaIndex = oldREAObj.supportsEAs.indexOf(eventAmbassadorName);
      if (eaIndex > -1) {
        oldREAObj.supportsEAs.splice(eaIndex, 1);
        regionalAmbassadors.set(oldREA, oldREAObj);
      }
    }
  }

  // Add EA to new REA's supportsEAs array
  const newREAObj = regionalAmbassadors.get(newREA);
  if (!newREAObj) {
    throw new Error(`Regional Ambassador "${newREA}" not found`);
  }

  if (!newREAObj.supportsEAs.includes(eventAmbassadorName)) {
    newREAObj.supportsEAs.push(eventAmbassadorName);
    regionalAmbassadors.set(newREA, newREAObj);
  }

  // Update EA's regionalAmbassador field
  const ea = eventAmbassadors.get(eventAmbassadorName);
  if (ea) {
    ea.regionalAmbassador = newREA;
    eventAmbassadors.set(eventAmbassadorName, ea);
    persistEventAmbassadors(eventAmbassadors);
  }

  // Persist the updated Regional Ambassadors
  persistRegionalAmbassadors(regionalAmbassadors);
  trackStateChange();

  // Recalculate capacity statuses after reallocation
  const capacityLimits = loadCapacityLimits();
  calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadors, capacityLimits);

  // Log the change
  log.push({
    type: "reallocate event ambassador",
    event: eventAmbassadorName,
    oldValue: oldREA || "",
    newValue: newREA,
    timestamp: Date.now(),
  });

  log.push({
    type: "assign event ambassador to regional ambassador",
    event: eventAmbassadorName,
    oldValue: oldREA || "",
    newValue: newREA,
    timestamp: Date.now(),
  });
}
