import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { LogEntry } from "@models/LogEntry";
import { persistEventAmbassadors } from "./persistState";
import {
  calculateAllCapacityStatuses,
  loadCapacityLimits,
} from "./checkCapacity";
import { saveProspectiveEvents } from "./persistProspectiveEvents";

export function archiveProspect(
  prospectId: string,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): void {
  const prospect = prospects.findById(prospectId);
  if (!prospect) {
    throw new Error(`Prospect with ID '${prospectId}' not found`);
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
    type: "Prospect Archived",
    event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) archived (not viable)`,
    oldValue: prospect.eventAmbassador || "Unassigned",
    newValue: "Archived (not viable)",
  });
}
