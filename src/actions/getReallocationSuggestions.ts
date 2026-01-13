import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CapacityLimits } from "@models/CapacityLimits";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { suggestEventReallocation } from "./suggestReallocation";

/**
 * Generate prioritised suggestions for reallocating a single event.
 * Finds the current ambassador for the event and calls suggestEventReallocation.
 */
export function getReallocationSuggestions(
  eventShortName: string,
  eventTeamsTableData: EventTeamsTableDataMap,
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  limits: CapacityLimits,
  regionalAmbassadors: RegionalAmbassadorMap,
): ReallocationSuggestion[] {
  const eventData = eventTeamsTableData.get(eventShortName);

  if (!eventData) {
    throw new Error(`Event '${eventShortName}' not found in table data`);
  }

  const currentAmbassador = eventData.eventAmbassador;

  if (!currentAmbassador || currentAmbassador.trim() === "") {
    throw new Error(
      `Event '${eventShortName}' is not currently assigned to any ambassador`,
    );
  }

  if (!eventAmbassadors.has(currentAmbassador)) {
    throw new Error(`Current ambassador '${currentAmbassador}' not found`);
  }

  return suggestEventReallocation(
    currentAmbassador,
    [eventShortName],
    eventAmbassadors,
    eventDetails,
    limits,
    regionalAmbassadors,
  );
}
