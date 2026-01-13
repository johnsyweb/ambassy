import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventTeamMap } from "../models/EventTeamMap";
import { EventAmbassador } from "../models/EventAmbassador";
import { RegionalAmbassador } from "../models/RegionalAmbassador";
import { CapacityLimits } from "../models/CapacityLimits";
import { LogEntry } from "../models/LogEntry";
import {
  persistEventAmbassadors,
  persistRegionalAmbassadors,
  persistChangesLog,
} from "./persistState";
import { assignEventToAmbassador } from "./assignEventToAmbassador";

/**
 * Check if reallocation would exceed capacity limits and return warning message.
 */
export function checkReallocationCapacityWarning(
  recipient: EventAmbassador | RegionalAmbassador,
  itemsToReallocate: string[],
  itemType: "events" | "eventAmbassadors",
  limits: CapacityLimits,
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
 * Offboard an Event Ambassador and reallocate their events to other ambassadors.
 * @param eventRecipients Map of event name to recipient ambassador name (empty string means unassign)
 */
export function offboardEventAmbassador(
  ambassadorName: string,
  eventRecipients: Map<string, string>,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeams: EventTeamMap,
  log: LogEntry[],
): void {
  const ambassador = eventAmbassadors.get(ambassadorName);
  if (!ambassador) {
    throw new Error(`Event Ambassador "${ambassadorName}" not found`);
  }

  const eventsToReallocate = [...ambassador.events];

  // Reallocate each event to its specified recipient
  for (const eventName of eventsToReallocate) {
    const recipientName = eventRecipients.get(eventName) || "";

    if (recipientName && recipientName.trim() !== "") {
      const recipient = eventAmbassadors.get(recipientName);
      if (!recipient) {
        throw new Error(
          `Recipient Event Ambassador "${recipientName}" not found`,
        );
      }

      // assignEventToAmbassador logs each reassignment separately
      assignEventToAmbassador(
        eventName,
        ambassadorName,
        recipientName,
        eventAmbassadors,
        log,
        regionalAmbassadors,
      );

      // Update Event Team mapping
      const eventTeam = eventTeams.get(eventName);
      if (eventTeam) {
        eventTeam.eventAmbassador = recipientName;
        eventTeams.set(eventName, eventTeam);
      }
    } else {
      // No recipient specified - unassign event and log separately
      const eventTeam = eventTeams.get(eventName);
      if (eventTeam) {
        eventTeam.eventAmbassador = "";
        eventTeams.set(eventName, eventTeam);
      }

      // Log unassignment separately
      log.push({
        type: "assign event to ambassador",
        event: eventName,
        oldValue: ambassadorName,
        newValue: "",
        timestamp: Date.now(),
      });
    }
  }

  // Remove the ambassador
  eventAmbassadors.delete(ambassadorName);
  persistEventAmbassadors(eventAmbassadors);

  // Log the offboarding (each reassignment already logged separately by assignEventToAmbassador)
  log.push({
    type: "offboard event ambassador",
    event: ambassadorName,
    oldValue: ambassadorName,
    newValue: "",
    timestamp: Date.now(),
  });

  persistChangesLog(log);
}

/**
 * Offboard a Regional Ambassador and reallocate their Event Ambassadors to other Regional Ambassadors.
 * @param eaRecipients Map of Event Ambassador name to recipient Regional Ambassador name (empty string means unassign)
 */
export function offboardRegionalAmbassador(
  ambassadorName: string,
  eaRecipients: Map<string, string>,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventAmbassadors: EventAmbassadorMap,
  log: LogEntry[],
): void {
  const ambassador = regionalAmbassadors.get(ambassadorName);
  if (!ambassador) {
    throw new Error(`Regional Ambassador "${ambassadorName}" not found`);
  }

  const easToReallocate = [...ambassador.supportsEAs];

  // Group EAs by recipient
  const recipientGroups = new Map<string, string[]>();
  for (const eaName of easToReallocate) {
    const recipientName = eaRecipients.get(eaName) || "";
    if (recipientName && recipientName.trim() !== "") {
      if (!recipientGroups.has(recipientName)) {
        recipientGroups.set(recipientName, []);
      }
      recipientGroups.get(recipientName)!.push(eaName);
    }
  }

  // Reallocate EAs to their specified recipients
  for (const [recipientName, eas] of recipientGroups.entries()) {
    const recipient = regionalAmbassadors.get(recipientName);
    if (!recipient) {
      throw new Error(
        `Recipient Regional Ambassador "${recipientName}" not found`,
      );
    }

    for (const eaName of eas) {
      if (!recipient.supportsEAs.includes(eaName)) {
        recipient.supportsEAs.push(eaName);
      }

      // Log each EA reassignment separately
      log.push({
        type: "assign event ambassador to regional ambassador",
        event: eaName,
        oldValue: ambassadorName,
        newValue: recipientName,
        timestamp: Date.now(),
      });
    }

    regionalAmbassadors.set(recipientName, recipient);
  }

  // Handle unassigned EAs (no recipient specified)
  for (const eaName of easToReallocate) {
    const recipientName = eaRecipients.get(eaName) || "";
    if (!recipientName || recipientName.trim() === "") {
      // Log unassignment
      log.push({
        type: "assign event ambassador to regional ambassador",
        event: eaName,
        oldValue: ambassadorName,
        newValue: "",
        timestamp: Date.now(),
      });
    }
  }

  // Remove the ambassador
  regionalAmbassadors.delete(ambassadorName);
  persistRegionalAmbassadors(regionalAmbassadors);

  // Log the offboarding
  log.push({
    type: "offboard regional ambassador",
    event: ambassadorName,
    oldValue: ambassadorName,
    newValue: "",
    timestamp: Date.now(),
  });

  persistChangesLog(log);
}
