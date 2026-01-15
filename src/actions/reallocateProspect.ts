import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { calculateAllCapacityStatuses, loadCapacityLimits } from "./checkCapacity";
import { saveProspectiveEvents } from "./persistProspectiveEvents";
import { persistEventAmbassadors, persistChangesLog } from "./persistState";
import { trackStateChange } from "./trackChanges";

/**
 * Reallocate a prospective event from one Event Ambassador to another.
 * Updates the prospect's eventAmbassador field, updates EventAmbassador prospectiveEvents arrays,
 * recalculates capacity statuses, and logs the change.
 */
export function reallocateProspect(
  prospectId: string,
  oldAmbassador: string,
  newAmbassador: string,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  log: LogEntry[],
  regionalAmbassadors?: RegionalAmbassadorMap
): void {
  const prospect = prospects.findById(prospectId);

  if (!prospect) {
    throw new Error(`Prospect with ID '${prospectId}' not found`);
  }

  if (prospect.eventAmbassador !== oldAmbassador) {
    throw new Error(`Prospect '${prospect.prospectEvent}' is not currently assigned to '${oldAmbassador}'`);
  }

  // Update the prospect's ambassador assignment
  prospects.update({
    ...prospect,
    eventAmbassador: newAmbassador,
    ambassadorMatchStatus: newAmbassador ? 'matched' : 'unmatched'
  });

  // Update EventAmbassador prospectiveEvents arrays
  // Remove from old ambassador
  if (oldAmbassador) {
    const oldEA = eventAmbassadors.get(oldAmbassador);
    if (oldEA?.prospectiveEvents) {
      oldEA.prospectiveEvents = oldEA.prospectiveEvents.filter(id => id !== prospectId);
    }
  }

  // Add to new ambassador
  if (newAmbassador) {
    const newEA = eventAmbassadors.get(newAmbassador);
    if (newEA) {
      if (!newEA.prospectiveEvents) {
        newEA.prospectiveEvents = [];
      }
      if (!newEA.prospectiveEvents.includes(prospectId)) {
        newEA.prospectiveEvents.push(prospectId);
      }
    }
  }

  // Recalculate capacity statuses
  const capacityLimits = loadCapacityLimits();
  calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadors ?? new Map(), capacityLimits);

  // Persist the updated Event Ambassadors (prospectiveEvents arrays were modified)
  persistEventAmbassadors(eventAmbassadors);

  // Save the updated prospects
  saveProspectiveEvents(prospects.getAll());

  // Log the change
  const timestamp = Date.now();
  const changeEntry: LogEntry = {
    timestamp,
    type: "Prospect Reallocated",
    event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) reallocated from "${oldAmbassador}" to "${newAmbassador}"`,
    oldValue: oldAmbassador,
    newValue: newAmbassador
  };

  log.unshift(changeEntry);
  persistChangesLog(log);

  // Track state change after all persistence operations complete
  trackStateChange();
}