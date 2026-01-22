import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { LogEntry } from "@models/LogEntry";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { assignEventToAmbassador } from "./assignEventToAmbassador";
import { findMatchingEvents } from "./findMatchingEvents";
import {
  calculateAllCapacityStatuses,
  loadCapacityLimits,
} from "./checkCapacity";
import { persistEventAmbassadors } from "./persistState";
import { saveProspectiveEvents } from "./persistProspectiveEvents";

export function launchProspect(
  prospectId: string,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventDetails: EventDetailsMap,
  log: LogEntry[],
  selectedEventName?: string,
  selectedEA?: string,
): void {
  const prospect = prospects.findById(prospectId);
  if (!prospect) {
    throw new Error(`Prospect with ID '${prospectId}' not found`);
  }

  // Validate selected event if provided
  if (selectedEventName) {
    const selectedEvent = eventDetails.get(selectedEventName);
    if (!selectedEvent) {
      throw new Error(`Event '${selectedEventName}' not found`);
    }

    if (selectedEA) {
      if (!eventAmbassadors.has(selectedEA)) {
        throw new Error(`Event Ambassador '${selectedEA}' not found`);
      }
      assignEventToAmbassador(
        selectedEventName,
        "",
        selectedEA,
        eventAmbassadors,
        log,
        regionalAmbassadors,
      );
    }
  } else {
    // Optionally find matches; currently used by UI to present options
    findMatchingEvents(prospect, eventDetails);
  }

  // Remove prospect from list
  prospects.remove(prospectId);

  // Remove from EA's prospectiveEvents array if assigned
  if (prospect.eventAmbassador) {
    const ea = eventAmbassadors.get(prospect.eventAmbassador);
    if (ea?.prospectiveEvents) {
      ea.prospectiveEvents = ea.prospectiveEvents.filter(
        (id) => id !== prospectId,
      );
    }
  }

  // Recalculate capacity statuses
  const capacityLimits = loadCapacityLimits();
  calculateAllCapacityStatuses(
    eventAmbassadors,
    regionalAmbassadors,
    capacityLimits,
  );

  // Persist changes
  saveProspectiveEvents(prospects.getAll());
  persistEventAmbassadors(eventAmbassadors);

  // Log the change
  log.unshift({
    timestamp: Date.now(),
    type: "Prospect Launched",
    event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) launched`,
    oldValue: prospect.eventAmbassador || "Unassigned",
    newValue: selectedEA || "No event allocated",
  });
}
