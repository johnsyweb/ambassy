import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { persistEventAmbassadors } from "./persistState";
import {
  calculateAllCapacityStatuses,
  loadCapacityLimits,
} from "./checkCapacity";

/**
 * Assign an event to an Event Ambassador.
 * Removes the event from the old ambassador's events array if it was previously assigned.
 * Adds the event to the new ambassador's events array.
 */
export function assignEventToAmbassador(
  eventName: string,
  oldEventAmbassador: string,
  newEventAmbassador: string,
  eventAmbassadors: EventAmbassadorMap,
  log: LogEntry[],
  regionalAmbassadors?: RegionalAmbassadorMap,
): void {
  // Remove event from old ambassador's events array
  if (oldEventAmbassador && oldEventAmbassador.trim() !== "") {
    const oldEA = eventAmbassadors.get(oldEventAmbassador);
    if (oldEA) {
      const eventIndex = oldEA.events.indexOf(eventName);
      if (eventIndex > -1) {
        oldEA.events.splice(eventIndex, 1);
        eventAmbassadors.set(oldEventAmbassador, oldEA);
      }
    }
  }

  // Add event to new ambassador's events array
  const newEA = eventAmbassadors.get(newEventAmbassador);
  if (!newEA) {
    throw new Error(`Event Ambassador "${newEventAmbassador}" not found`);
  }

  if (!newEA.events.includes(eventName)) {
    newEA.events.push(eventName);
    eventAmbassadors.set(newEventAmbassador, newEA);
  }

  // Persist the updated Event Ambassadors
  persistEventAmbassadors(eventAmbassadors);

  // Recalculate capacity statuses after assignment
  const capacityLimits = loadCapacityLimits();
  const regionalAmbassadorsToUse = regionalAmbassadors ?? new Map();
  calculateAllCapacityStatuses(
    eventAmbassadors,
    regionalAmbassadorsToUse,
    capacityLimits,
  );

  // Log the change
  log.push({
    type: "assign event to ambassador",
    event: eventName,
    oldValue: oldEventAmbassador || "",
    newValue: newEventAmbassador,
    timestamp: Date.now(),
  });
}
