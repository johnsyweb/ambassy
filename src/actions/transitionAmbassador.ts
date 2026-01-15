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

/**
 * Validate that REA-to-EA transition is possible.
 * Returns error message if validation fails, null if valid.
 */
export function validateREAToEATransition(
  ambassadorName: string,
  regionalAmbassadors: RegionalAmbassadorMap,
): string | null {
  const rea = regionalAmbassadors.get(ambassadorName);
  if (!rea) {
    return `Regional Ambassador "${ambassadorName}" not found`;
  }

  if (rea.supportsEAs.length === 0) {
    return null;
  }

  const otherREAs = Array.from(regionalAmbassadors.keys()).filter(
    (name) => name !== ambassadorName,
  );

  if (otherREAs.length === 0) {
    return `Regional Ambassador "${ambassadorName}" cannot be transitioned to Event Ambassador because there are no other Regional Ambassadors to reallocate their ${rea.supportsEAs.length} supported Event Ambassador(s).`;
  }

  return null;
}

/**
 * Transition a Regional Ambassador to become an Event Ambassador.
 * Requires reallocation of all supported Event Ambassadors.
 */
export function transitionRegionalAmbassadorToEvent(
  ambassadorName: string,
  eaRecipients: Map<string, string>,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): void {
  const rea = regionalAmbassadors.get(ambassadorName);
  if (!rea) {
    throw new Error(`Regional Ambassador "${ambassadorName}" not found`);
  }

  const state = rea.state;
  const supportedEAs = [...rea.supportsEAs];

  if (supportedEAs.length > 0 && eaRecipients.size !== supportedEAs.length) {
    throw new Error(
      "Not all supported Event Ambassadors have recipients. All EAs must be reallocated before transition.",
    );
  }

  for (const eaName of supportedEAs) {
    const oldEAsList = [...rea.supportsEAs];
    const index = rea.supportsEAs.indexOf(eaName);
    if (index > -1) {
      rea.supportsEAs.splice(index, 1);
      persistRegionalAmbassadors(regionalAmbassadors);

      log.push({
        type: "remove event ambassador from regional supports",
        event: ambassadorName,
        oldValue: oldEAsList.join(", ") || "",
        newValue: rea.supportsEAs.join(", ") || "",
        timestamp: Date.now(),
      });
    }
    const recipientREAName = eaRecipients.get(eaName);
    if (!recipientREAName) {
      throw new Error(
        `Event Ambassador "${eaName}" does not have a recipient specified.`,
      );
    }

    const recipientREA = regionalAmbassadors.get(recipientREAName);
    if (!recipientREA) {
      throw new Error(
        `Recipient Regional Ambassador "${recipientREAName}" not found`,
      );
    }

    const ea = eventAmbassadors.get(eaName);
    if (!ea) {
      throw new Error(`Event Ambassador "${eaName}" not found`);
    }

    const oldREAName = ea.regionalAmbassador || "";

    const oldEAs = [...recipientREA.supportsEAs];
    recipientREA.supportsEAs.push(eaName);
    persistRegionalAmbassadors(regionalAmbassadors);

    log.push({
      type: "add event ambassador to regional supports",
      event: recipientREAName,
      oldValue: oldEAs.join(", ") || "",
      newValue: recipientREA.supportsEAs.join(", "),
      timestamp: Date.now(),
    });

    ea.regionalAmbassador = recipientREAName;
    persistEventAmbassadors(eventAmbassadors);

    log.push({
      type: "assign event ambassador to regional ambassador",
      event: eaName,
      oldValue: oldREAName,
      newValue: recipientREAName,
      timestamp: Date.now(),
    });
  }

  regionalAmbassadors.delete(ambassadorName);
  persistRegionalAmbassadors(regionalAmbassadors);

  log.push({
    type: "remove regional ambassador",
    event: ambassadorName,
    oldValue: ambassadorName,
    newValue: "",
    timestamp: Date.now(),
  });

  const newEA = {
    name: ambassadorName,
    events: [],
    state: state,
  };

  eventAmbassadors.set(ambassadorName, newEA);
  persistEventAmbassadors(eventAmbassadors);

  log.push({
    type: "add event ambassador",
    event: ambassadorName,
    oldValue: "",
    newValue: ambassadorName,
    timestamp: Date.now(),
  });

  persistChangesLog(log);
  trackStateChange();
}
