import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { assignEventToAmbassador } from "./assignEventToAmbassador";
import { getRegionalAmbassadorForEventAmbassador } from "@utils/regions";

/**
 * Allocate an unallocated event to an Event Ambassador from the map interface.
 * Updates the EA's events array, persists changes, recalculates capacity statuses, and logs the change.
 */
export function allocateEventFromMap(
  eventName: string,
  selectedEA: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeams: EventTeamMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[]
): void {
  if (!eventDetails.has(eventName)) {
    throw new Error(`Event "${eventName}" not found in eventDetails`);
  }

  const ea = eventAmbassadors.get(selectedEA);
  if (!ea) {
    throw new Error(`Event Ambassador "${selectedEA}" not found`);
  }

  assignEventToAmbassador(
    eventName,
    "",
    selectedEA,
    eventAmbassadors,
    log,
    regionalAmbassadors
  );

  const rea = getRegionalAmbassadorForEventAmbassador(selectedEA, regionalAmbassadors);
  
  log.push({
    type: "allocate event from map",
    event: eventName,
    oldValue: "",
    newValue: selectedEA,
    timestamp: Date.now(),
  });

  if (rea) {
    log.push({
      type: "assign event ambassador to regional ambassador",
      event: eventName,
      oldValue: "",
      newValue: rea,
      timestamp: Date.now(),
    });
  }
}
