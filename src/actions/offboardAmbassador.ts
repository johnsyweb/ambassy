import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventTeamMap } from "../models/EventTeamMap";
import { EventAmbassador } from "../models/EventAmbassador";
import { RegionalAmbassador } from "../models/RegionalAmbassador";
import { CapacityLimits } from "../models/CapacityLimits";
import { LogEntry } from "../models/LogEntry";
import { persistEventAmbassadors, persistRegionalAmbassadors, persistChangesLog } from "./persistState";
import { assignEventToAmbassador } from "./assignEventToAmbassador";

/**
 * Check if reallocation would exceed capacity limits and return warning message.
 */
export function checkReallocationCapacityWarning(
  recipient: EventAmbassador | RegionalAmbassador,
  itemsToReallocate: string[],
  itemType: "events" | "eventAmbassadors",
  limits: CapacityLimits
): string | null {
  if (itemType === "events" && "events" in recipient) {
    const newCount = recipient.events.length + itemsToReallocate.length;
    if (newCount > limits.eventAmbassadorMax) {
      return `Reallocation would exceed maximum capacity (${limits.eventAmbassadorMax} events). New total would be ${newCount}.`;
    }
  } else if (itemType === "eventAmbassadors" && "supportsEAs" in recipient) {
    const newCount = recipient.supportsEAs.length + itemsToReallocate.length;
    if (newCount > limits.regionalAmbassadorMax) {
      return `Reallocation would exceed maximum capacity (${limits.regionalAmbassadorMax} Event Ambassadors). New total would be ${newCount}.`;
    }
  }
  return null;
}

/**
 * Offboard an Event Ambassador and reallocate their events to another ambassador.
 */
export function offboardEventAmbassador(
  ambassadorName: string,
  recipientName: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeams: EventTeamMap,
  log: LogEntry[]
): void {
  const ambassador = eventAmbassadors.get(ambassadorName);
  if (!ambassador) {
    throw new Error(`Event Ambassador "${ambassadorName}" not found`);
  }

  const eventsToReallocate = [...ambassador.events];

  // Reallocate events if recipient specified
  if (recipientName && recipientName.trim() !== "") {
    const recipient = eventAmbassadors.get(recipientName);
    if (!recipient) {
      throw new Error(`Recipient Event Ambassador "${recipientName}" not found`);
    }

    // Reallocate each event
    for (const eventName of eventsToReallocate) {
      assignEventToAmbassador(
        eventName,
        ambassadorName,
        recipientName,
        eventAmbassadors,
        log,
        regionalAmbassadors
      );

      // Update Event Team mapping
      const eventTeam = eventTeams.get(eventName);
      if (eventTeam) {
        eventTeam.eventAmbassador = recipientName;
        eventTeams.set(eventName, eventTeam);
      }
    }
  } else {
    // No recipient specified - just remove events from ambassador
    // Events will remain unassigned (or could be flagged for manual assignment)
    for (const eventName of eventsToReallocate) {
      const eventTeam = eventTeams.get(eventName);
      if (eventTeam) {
        eventTeam.eventAmbassador = "";
        eventTeams.set(eventName, eventTeam);
      }
    }
  }

  // Remove the ambassador
  eventAmbassadors.delete(ambassadorName);
  persistEventAmbassadors(eventAmbassadors);

  // Log the offboarding
  log.push({
    type: "offboard event ambassador",
    event: ambassadorName,
    oldValue: ambassadorName,
    newValue: recipientName || "unassigned",
    timestamp: Date.now(),
  });

  persistChangesLog(log);
}

/**
 * Offboard a Regional Ambassador and reallocate their Event Ambassadors to another Regional Ambassador.
 */
export function offboardRegionalAmbassador(
  ambassadorName: string,
  recipientName: string,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventAmbassadors: EventAmbassadorMap,
  log: LogEntry[]
): void {
  const ambassador = regionalAmbassadors.get(ambassadorName);
  if (!ambassador) {
    throw new Error(`Regional Ambassador "${ambassadorName}" not found`);
  }

  const easToReallocate = [...ambassador.supportsEAs];

  // Reallocate Event Ambassadors if recipient specified
  if (recipientName && recipientName.trim() !== "") {
    const recipient = regionalAmbassadors.get(recipientName);
    if (!recipient) {
      throw new Error(`Recipient Regional Ambassador "${recipientName}" not found`);
    }

    // Add EAs to recipient
    for (const eaName of easToReallocate) {
      if (!recipient.supportsEAs.includes(eaName)) {
        recipient.supportsEAs.push(eaName);
      }
    }

    regionalAmbassadors.set(recipientName, recipient);
  }

  // Remove the ambassador
  regionalAmbassadors.delete(ambassadorName);
  persistRegionalAmbassadors(regionalAmbassadors);

  // Log the offboarding
  log.push({
    type: "offboard regional ambassador",
    event: ambassadorName,
    oldValue: ambassadorName,
    newValue: recipientName || "unassigned",
    timestamp: Date.now(),
  });

  persistChangesLog(log);
}

