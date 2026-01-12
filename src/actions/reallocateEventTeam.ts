import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { LogEntry } from "@models/LogEntry";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { assignEventToAmbassador } from "./assignEventToAmbassador";
import { calculateAllCapacityStatuses, loadCapacityLimits } from "./checkCapacity";

/**
 * Reallocate an event from one Event Ambassador to another.
 * Updates EventTeamsTableData, persists changes (via assignEventToAmbassador), recalculates capacity statuses, and logs the change.
 */
export function reallocateEventTeam(
  eventShortName: string,
  oldAmbassador: string,
  newAmbassador: string,
  eventAmbassadors: EventAmbassadorMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  log: LogEntry[],
  regionalAmbassadors?: RegionalAmbassadorMap
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

  eventData.eventAmbassador = newAmbassador;
  eventTeamsTableData.set(eventShortName, eventData);

  const capacityLimits = loadCapacityLimits();
  const regionalAmbassadorsToUse = regionalAmbassadors ?? new Map();
  calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadorsToUse, capacityLimits);
}
