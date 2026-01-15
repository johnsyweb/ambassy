import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import {
  persistEventAmbassadors,
  persistRegionalAmbassadors,
  persistChangesLog,
} from "./persistState";
import { trackStateChange } from "./trackChanges";

/**
 * Transition an Event Ambassador to become a Regional Ambassador.
 * Preserves all event assignments for later reallocation.
 */
export function transitionEventAmbassadorToRegional(
  ambassadorName: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): void {
  const ea = eventAmbassadors.get(ambassadorName);
  if (!ea) {
    throw new Error(`Event Ambassador "${ambassadorName}" not found`);
  }

  const state = ea.state || "";
  const events = [...(ea.events || [])];
  const prospectiveEvents = [...(ea.prospectiveEvents || [])];
  const previousREAName = ea.regionalAmbassador || null;

  eventAmbassadors.delete(ambassadorName);
  persistEventAmbassadors(eventAmbassadors);

  log.push({
    type: "remove event ambassador",
    event: ambassadorName,
    oldValue: ambassadorName,
    newValue: "",
    timestamp: Date.now(),
  });

  const newREA = {
    name: ambassadorName,
    state: state,
    supportsEAs: [],
    eventsForReallocation: events,
    prospectiveEventsForReallocation: prospectiveEvents,
  };

  regionalAmbassadors.set(ambassadorName, newREA);
  persistRegionalAmbassadors(regionalAmbassadors);

  log.push({
    type: "add regional ambassador",
    event: ambassadorName,
    oldValue: "",
    newValue: ambassadorName,
    timestamp: Date.now(),
  });

  if (previousREAName && previousREAName !== null) {
    const previousREA = regionalAmbassadors.get(previousREAName);
    if (previousREA) {
      const oldEAs = [...previousREA.supportsEAs];
      const index = previousREA.supportsEAs.indexOf(ambassadorName);
      if (index > -1) {
        previousREA.supportsEAs.splice(index, 1);
        persistRegionalAmbassadors(regionalAmbassadors);

        log.push({
          type: "remove event ambassador from regional supports",
          event: previousREAName,
          oldValue: oldEAs.join(", ") || "",
          newValue: previousREA.supportsEAs.join(", ") || "",
          timestamp: Date.now(),
        });
      }
    }
  }

  persistChangesLog(log);
  trackStateChange();
}
