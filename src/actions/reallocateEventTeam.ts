import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { LogEntry } from "@models/LogEntry";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { assignEventToAmbassador } from "./assignEventToAmbassador";
import { calculateAllCapacityStatuses, loadCapacityLimits } from "./checkCapacity";
import { getRegionalAmbassadorForEventAmbassador } from "../utils/regions";
import { extractEventTeamsTableData } from "../models/EventTeamsTable";
import { trackStateChange } from "./trackChanges";

/**
 * Reallocate an event from one Event Ambassador to another.
 * Updates EventTeamsTableData, persists changes (via assignEventToAmbassador), recalculates capacity statuses, and logs the change.
 * Recalculates REA relationships to ensure they're up-to-date in table and map views.
 */
export function reallocateEventTeam(
  eventShortName: string,
  oldAmbassador: string,
  newAmbassador: string,
  eventAmbassadors: EventAmbassadorMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  log: LogEntry[],
  regionalAmbassadors?: RegionalAmbassadorMap,
  eventTeams?: EventTeamMap,
  eventDetails?: EventDetailsMap
): void {
  const eventData = eventTeamsTableData.get(eventShortName);

  if (!eventData) {
    throw new Error(`Event '${eventShortName}' not found in table data`);
  }

  assignEventToAmbassador(
    eventShortName,
    oldAmbassador,
    newAmbassador,
    eventAmbassadors,
    log,
    regionalAmbassadors
  );
  trackStateChange();

  // Update the event ambassador in table data
  eventData.eventAmbassador = newAmbassador;
  
  // Update the regional ambassador relationship
  // The REA is determined by which Regional Ambassador supports the Event Ambassador
  const regionalAmbassadorsToUse = regionalAmbassadors ?? new Map();
  const newREA = getRegionalAmbassadorForEventAmbassador(newAmbassador, regionalAmbassadorsToUse);
  if (newREA) {
    eventData.regionalAmbassador = newREA;
  } else {
    // If no REA found, clear it (shouldn't happen in normal operation)
    eventData.regionalAmbassador = "";
  }
  
  eventTeamsTableData.set(eventShortName, eventData);

  const capacityLimits = loadCapacityLimits();
  calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadorsToUse, capacityLimits);
  
  // If eventTeams and eventDetails are provided, recalculate the entire table data
  // to ensure all relationships are consistent (more thorough but optional)
  if (eventTeams && eventDetails && regionalAmbassadors) {
    const recalculatedData = extractEventTeamsTableData(
      regionalAmbassadors,
      eventAmbassadors,
      eventTeams,
      eventDetails
    );
    // Update the specific event's data from recalculated data
    const recalculatedEventData = recalculatedData.get(eventShortName);
    if (recalculatedEventData) {
      eventTeamsTableData.set(eventShortName, recalculatedEventData);
    }
  }
}
